import ApolloClient, {
  ApolloCurrentResult,
  ApolloError,
  ApolloQueryResult,
  FetchMoreOptions,
  FetchMoreQueryOptions,
  FetchPolicy,
  NetworkStatus,
  ObservableQuery,
  OperationVariables,
  QueryOptions,
  WatchQueryOptions,
} from 'apollo-client';
import { DocumentNode } from 'graphql';
import pick from 'lodash/pick';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';

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
  // networkStatus is undefined for skipped queries or the ones using suspense
  networkStatus: NetworkStatus | undefined;
}

export interface QueryHookOptions<TVariables, TCache = object>
  extends Omit<QueryOptions<TVariables>, 'query'> {
  // watch query options from apollo client
  notifyOnNetworkStatusChange?: boolean;
  pollInterval?: number;
  // custom options of `useQuery` hook
  client?: ApolloClient<TCache>;
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

export function useQuery<
  TData = any,
  TVariables = OperationVariables,
  TCache = object
>(
  query: DocumentNode,
  {
    // Hook options
    ssr = true,
    skip = false,
    suspend = false,

    // Watch options
    pollInterval,
    notifyOnNetworkStatusChange = false,

    // Apollo client options
    client: overrideClient,
    context,
    metadata,
    variables,
    fetchPolicy: actualCachePolicy,
    errorPolicy,
    fetchResults,
  }: QueryHookOptions<TVariables, TCache> = {}
): QueryHookResult<TData, TVariables> {
  const client = useApolloClient(overrideClient);
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

  const previousClient = useRef<ApolloClient<TCache>>(client);
  const previousQuery = useRef<DocumentNode>(query);
  const observableQuery = useRef<ObservableQuery<TData, TVariables> | null>(
    null
  );
  const isObservableQueryInitialized = useRef<boolean>(false);

  if (previousClient.current !== client || previousQuery.current !== query) {
    observableQuery.current = null;
    isObservableQueryInitialized.current = false;

    if (previousClient.current !== client) {
      previousClient.current = client;
    }

    if (previousQuery.current !== query) {
      previousQuery.current = query;
    }
  }

  const [responseId, setResponseId] = useState(0);

  const invalidateCurrentResult = () => {
    // A hack to get rid React warnings during tests. The default
    // implementation of `actHack` just invokes the callback immediately.
    // In tests, it's replaced with `act` from react-testing-library.
    // A better solution welcome.
    actHack(() => {
      setResponseId(x => x + 1);
    });
  };

  let currentObservableQuery: ObservableQuery<TData, TVariables>;
  if (observableQuery.current) {
    currentObservableQuery = observableQuery.current;
  } else {
    currentObservableQuery = getCachedObservableQuery<TData, TVariables>(
      client,
      watchQueryOptions
    );
    observableQuery.current = currentObservableQuery;
  }

  useEffect(
    () => {
      if (isObservableQueryInitialized.current) {
        currentObservableQuery.setOptions(
          pick(watchQueryOptions, [
            'errorPolicy',
            'fetchPolicy',
            'fetchResults',
            'notifyOnNetworkStatusChange',
            'pollInterval',
            'variables',
          ])
        );
        invalidateCurrentResult();
      } else {
        isObservableQueryInitialized.current = true;
      }
    },
    [currentObservableQuery, watchQueryOptions]
  );

  const currentResult = useMemo<QueryHookResult<TData, TVariables>>(
    () => {
      const helpers = {
        fetchMore: currentObservableQuery.fetchMore.bind(observableQuery),
        refetch: currentObservableQuery.refetch.bind(observableQuery),
        startPolling: currentObservableQuery.startPolling.bind(observableQuery),
        stopPolling: currentObservableQuery.stopPolling.bind(observableQuery),
        updateQuery: currentObservableQuery.updateQuery.bind(observableQuery),
      };

      const result = currentObservableQuery.currentResult();

      // return the old result data when there is an error
      let data = result.data as TData;
      if (result.error || result.errors) {
        data = {
          ...result.data,
          ...(currentObservableQuery.getLastResult() || {}).data,
        };
      }

      if (shouldSkip) {
        // Taken from https://github.com/apollographql/react-apollo/blob/5cb63b3625ce5e4a3d3e4ba132eaec2a38ef5d90/src/Query.tsx#L376-L381
        return {
          ...helpers,
          data: undefined,
          error: undefined,
          loading: false,
          networkStatus: undefined,
        };
      }

      return {
        ...helpers,
        data,
        error:
          result.errors && result.errors.length > 0
            ? new ApolloError({ graphQLErrors: result.errors })
            : result.error,
        errors: result.errors,
        loading: result.loading,
        // don't try to return `networkStatus` when suspense it's used
        // because it's unreliable in that case
        // https://github.com/trojanowski/react-apollo-hooks/pull/68
        networkStatus: suspend ? undefined : result.networkStatus,
        partial: result.partial,
      };
    },
    [shouldSkip, responseId, currentObservableQuery]
  );

  useEffect(
    () => {
      if (shouldSkip) {
        return;
      }

      const subscription = currentObservableQuery.subscribe(
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

  if (currentResult.partial) {
    if (suspend) {
      // throw a promise - use the react suspense to wait until the data is
      // available
      throw currentObservableQuery.result();
    }

    if (ssrInUse) {
      ssrManager!.register(currentObservableQuery.result());
    }
  }

  return currentResult;
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
