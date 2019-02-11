import {
  ApolloCurrentResult,
  ApolloError,
  ApolloQueryResult,
  FetchMoreOptions,
  FetchMoreQueryOptions,
  FetchPolicy,
  ObservableQuery,
  OperationVariables,
  QueryOptions,
  WatchQueryOptions,
} from 'apollo-client';
import { DocumentNode } from 'graphql';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useApolloClient } from './ApolloContext';
import { SSRContext } from './internal/SSRContext';
import actHack from './internal/actHack';
import {
  getCachedObservableQuery,
  invalidateCachedObservableQuery,
} from './queryCache';
import { Omit, compact, objToKey } from './utils';

export interface QueryHookState<TData>
  extends Pick<
    ApolloCurrentResult<undefined | TData>,
    'error' | 'errors' | 'loading' | 'partial'
  > {
  data?: TData;
}

export interface QueryHookOptions<TVariables>
  extends Omit<QueryOptions<TVariables>, 'query'> {
  // watch query options from apollo client
  notifyOnNetworkStatusChange?: boolean;
  pollInterval?: number;
  // custom options of `useQuery` hook
  ssr?: boolean;
  skip?: boolean;
  suspend?: boolean;
}

export interface QueryHookResult<TData, TVariables>
  extends QueryHookState<TData>,
    Pick<
      ObservableQuery<TData, TVariables>,
      'refetch' | 'startPolling' | 'stopPolling' | 'updateQuery'
    > {
  fetchMore<K extends keyof TVariables>(
    fetchMoreOptions: FetchMoreQueryOptions<TVariables, K> &
      FetchMoreOptions<TData, TVariables>
  ): Promise<ApolloQueryResult<TData>>;
}

export function useQuery<TData = any, TVariables = OperationVariables>(
  query: DocumentNode,
  {
    // Hook options
    ssr = true,
    skip = false,
    suspend = true,

    // Watch options
    pollInterval,
    notifyOnNetworkStatusChange = false,

    // Apollo client options
    context,
    metadata,
    variables,
    fetchPolicy: actualCachePolicy,
    errorPolicy,
    fetchResults,
  }: QueryHookOptions<TVariables> = {}
): QueryHookResult<TData, TVariables> {
  const client = useApolloClient();
  const ssrManager = useContext(SSRContext);
  const ssrInUse = ssr && ssrManager;

  // Skips when `skip: true` or SSRContext passed but `ssr: false`
  const shouldSkip = skip || (ssrManager != null && !ssr);
  const fetchPolicy =
    ssrInUse &&
    // Taken from https://github.com/apollographql/react-apollo/blob/2d7e48b7d0c26e792e1ed26e98bb84d8fba5bb8a/src/Query.tsx#L167-L169
    (actualCachePolicy === 'network-only' ||
      actualCachePolicy === 'cache-and-network')
      ? 'cache-first'
      : actualCachePolicy;

  const watchQueryOptions: WatchQueryOptions<TVariables> = useMemo(
    () =>
      compact({
        context,
        errorPolicy,
        fetchPolicy,
        fetchResults,
        metadata,
        notifyOnNetworkStatusChange,
        pollInterval,
        query,
        variables,
      }),
    [
      query,

      pollInterval,
      notifyOnNetworkStatusChange,

      context && objToKey(context),
      metadata && objToKey(metadata),
      variables && objToKey(variables),
      fetchPolicy,
      errorPolicy,
      fetchResults,
    ]
  );
  const observableQuery = useMemo(
    () =>
      getCachedObservableQuery<TData, TVariables>(client, watchQueryOptions),
    [client, watchQueryOptions]
  );

  const [responseId, setResponseId] = useState(0);

  const currentResult = useMemo<QueryHookState<TData>>(
    () => {
      const result = observableQuery.currentResult();

      return {
        data: result.data as TData,
        error:
          result.errors && result.errors.length > 0
            ? new ApolloError({ graphQLErrors: result.errors })
            : result.error,
        errors: result.errors,
        loading: result.loading,
        partial: result.partial,
      };
    },
    [shouldSkip, responseId, observableQuery]
  );

  useEffect(
    () => {
      if (shouldSkip) {
        return;
      }

      const invalidateCurrentResult = () => {
        // A hack to get rid React warnings during tests. The default
        // implementation of `actHack` just invokes the callback immediately.
        // In tests, it's replaced with `act` from react-testing-library.
        // A better solution welcome.
        actHack(() => {
          setResponseId(x => x + 1);
        });
      };
      const subscription = observableQuery.subscribe(
        invalidateCurrentResult,
        invalidateCurrentResult
      );

      invalidateCachedObservableQuery(client, watchQueryOptions);

      return () => {
        subscription.unsubscribe();
      };
    },
    [shouldSkip, observableQuery]
  );

  ensureSupportedFetchPolicy(suspend, fetchPolicy);

  const helpers = {
    fetchMore: observableQuery.fetchMore.bind(observableQuery),
    refetch: observableQuery.refetch.bind(observableQuery),
    startPolling: observableQuery.startPolling.bind(observableQuery),
    stopPolling: observableQuery.stopPolling.bind(observableQuery),
    updateQuery: observableQuery.updateQuery.bind(observableQuery),
  };

  if (shouldSkip) {
    // Taken from https://github.com/apollographql/react-apollo/blob/5cb63b3625ce5e4a3d3e4ba132eaec2a38ef5d90/src/Query.tsx#L376-L381
    return {
      ...helpers,
      data: undefined,
      error: undefined,
      loading: false,
    };
  }

  if (currentResult.partial) {
    if (suspend) {
      // throw a promise - use the react suspense to wait until the data is
      // available
      throw observableQuery.result();
    }

    if (ssrInUse) {
      ssrManager!.register(observableQuery.result());
    }
  }

  return { ...helpers, ...currentResult };
}

function ensureSupportedFetchPolicy(
  suspend: boolean,
  fetchPolicy?: FetchPolicy
) {
  if (suspend && fetchPolicy && fetchPolicy !== 'cache-first') {
    throw new Error(
      `Fetch policy ${fetchPolicy} is not supported without 'suspend: false'`
    );
  }
}
