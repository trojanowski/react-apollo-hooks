import { DocumentNode } from 'graphql';
import { useState, useEffect, useMemo } from 'react';
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

export interface QueryHookOptions<TVariables>
  extends Omit<QueryOptions<TVariables>, 'query'> {
  // watch query options from apollo client
  notifyOnNetworkStatusChange?: boolean;
  pollInterval?: number;
  // custom options of `useQuery` hook
  skip?: boolean;
  suspend?: boolean;
}

export interface QueryHookState<TData>
  extends Pick<
    ApolloCurrentResult<undefined | TData>,
    'error' | 'errors' | 'loading'
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

function currentResultToState<TData>({
  data,
  error,
  errors,
  loading,
}: ApolloCurrentResult<TData>): QueryHookState<TData> {
  return { error, errors, loading, data: data as TData };
}

export function useQuery<TData = any, TVariables = OperationVariables>(
  query: DocumentNode,
  {
    // Hook options
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

  const watchQueryOptions: WatchQueryOptions<TVariables> = useMemo(
    () => ({
      query,

      pollInterval,
      notifyOnNetworkStatusChange,

      context,
      metadata,
      variables,
      fetchPolicy,
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
      getCachedObservableQuery<TData, TVariables>(client!, watchQueryOptions),
    [client, watchQueryOptions]
  );

  const [responseId, setResponseId] = useState(0);

  const currentResult = useMemo(
    () => currentResultToState(observableQuery.currentResult()),
    [skip, responseId, observableQuery]
  );

  useEffect(
    () => {
      if (skip) {
        return;
      }

      const subscription = observableQuery.subscribe(() => {
        setResponseId(x => x + 1);
      });

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

  if (skip) {
    // Taken from https://github.com/apollographql/react-apollo/blob/5cb63b3625ce5e4a3d3e4ba132eaec2a38ef5d90/src/Query.tsx#L376-L381
    return {
      ...helpers,
      data: undefined,
      error: undefined,
      loading: false,
    };
  }

  if (suspend) {
    const current = observableQuery.currentResult();

    if (current.partial) {
      // throw a promise - use the react suspense to wait until the data is
      // available
      throw observableQuery.result();
    }
  }

  return { ...helpers, ...currentResult };
}

function ensureSupportedFetchPolicy(
  suspend: boolean,
  fetchPolicy?: FetchPolicy
) {
  if (!suspend) {
    return;
  }
  if (fetchPolicy && fetchPolicy !== 'cache-first') {
    throw new Error(
      `Fetch policy ${fetchPolicy} is not supported without 'suspend: false'`
    );
  }
}
