import { DocumentNode } from 'graphql';
import { useState, useEffect, useMemo, useContext } from 'react';
import {
  invalidateCachedObservableQuery,
  getCachedObservableQuery,
} from './queryCache';
import objToKey, { Omit, assertApolloClient } from './Utils';
import { useApolloClient } from './ApolloContext';
import {
  OperationVariables,
  QueryOptions,
  ObservableQuery,
  ApolloQueryResult,
  FetchMoreQueryOptions,
  FetchMoreOptions,
  FetchPolicy,
  ApolloCurrentResult,
  WatchQueryOptions,
} from 'apollo-client';
import { SSRContext } from './internal/SSRContext';

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

export interface QueryHookState<TData>
  extends Pick<
    ApolloCurrentResult<undefined | TData>,
    'error' | 'errors' | 'loading' | 'partial'
  > {
  data?: TData;
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
    notifyOnNetworkStatusChange,

    // Apollo client options
    context,
    metadata,
    variables,
    fetchPolicy,
    errorPolicy,
    fetchResults,
  }: QueryHookOptions<TVariables> = {}
): QueryHookResult<TData, TVariables> {
  const client = useApolloClient()!;

  assertApolloClient(client);

  const ssrManager = useContext(SSRContext);
  const watchQueryOptions: WatchQueryOptions<TVariables> = useMemo(
    () => ({
      query,

      pollInterval,
      notifyOnNetworkStatusChange,

      context,
      metadata,
      variables,
      fetchPolicy:
        ssrManager == null ||
        (fetchPolicy !== 'network-only' && fetchPolicy !== 'cache-and-network')
          ? fetchPolicy
          : 'cache-first',
      errorPolicy,
      fetchResults,
    }),
    [
      query,

      pollInterval,
      notifyOnNetworkStatusChange,

      context,
      metadata,
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
      const {
        data,
        error,
        errors,
        loading,
        partial,
      } = observableQuery.currentResult();

      return {
        error,
        errors,
        loading,
        partial,
        data: data as TData,
      };
    },
    [skip, responseId, observableQuery]
  );

  useEffect(
    () => {
      if (skip) {
        return;
      }

      const subscription = observableQuery.subscribe(
        () => setResponseId(x => x + 1),
        () => setResponseId(x => x + 1)
      );

      invalidateCachedObservableQuery(client, watchQueryOptions);

      return () => {
        subscription.unsubscribe();
      };
    },
    [skip, observableQuery]
  );

  ensureSupportedFetchPolicy(suspend, fetchPolicy);

  const helpers = {
    fetchMore: observableQuery.fetchMore.bind(observableQuery),
    refetch: observableQuery.refetch.bind(observableQuery),
    startPolling: observableQuery.startPolling.bind(observableQuery),
    stopPolling: observableQuery.stopPolling.bind(observableQuery),
    updateQuery: observableQuery.updateQuery.bind(observableQuery),
  };

  if (skip || (!ssr && ssrManager != null)) {
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

    if (ssr && ssrManager) {
      ssrManager.register(observableQuery.result());
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
