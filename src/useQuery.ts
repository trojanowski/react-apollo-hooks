import {
  ApolloCurrentResult,
  ApolloQueryResult,
  FetchMoreOptions,
  FetchMoreQueryOptions,
  FetchPolicy,
  ObservableQuery,
  OperationVariables,
  QueryOptions,
  UpdateQueryOptions,
} from 'apollo-client';
import { DocumentNode } from 'graphql';
import { useEffect, useRef, useState } from 'react';
import isEqual from 'react-fast-compare';

import { useApolloClient } from './ApolloContext';
import {
  getCachedObservableQuery,
  invalidateCachedObservableQuery,
} from './queryCache';
import { Omit, objToKey } from './utils';

export interface QueryHookState<TData>
  extends Pick<
    ApolloCurrentResult<undefined | TData>,
    'error' | 'errors' | 'loading'
  > {
  data?: TData;
}

export interface QueryHookOptions<TVariables>
  extends Omit<QueryOptions<TVariables>, 'query'> {
  // watch query options from apollo client
  notifyOnNetworkStatusChange?: boolean;
  pollInterval?: number;
  // custom options of `useQuery` hook
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
  { suspend = true, ...restOptions }: QueryHookOptions<TVariables> = {}
): QueryHookResult<TData, TVariables> {
  const client = useApolloClient();
  const [result, setResult] = useState<null | QueryHookState<TData>>(null);
  const previousQuery = useRef<null | DocumentNode>(null);
  const previousRestOptions = useRef<null | QueryHookOptions<TVariables>>(null);
  const observableQuery = useRef<null | ObservableQuery<TData, TVariables>>(
    null
  );

  useEffect(
    () => {
      const subscription = observableQuery.current!.subscribe(nextResult => {
        setResult(nextResult);
      });
      invalidateCachedObservableQuery(client, query, restOptions);

      return () => {
        subscription.unsubscribe();
      };
    },
    [query, objToKey(restOptions)]
  );

  ensureSupportedFetchPolicy(suspend, restOptions.fetchPolicy);

  const helpers = {
    fetchMore: <K extends keyof TVariables>(
      fetchMoreOptions: FetchMoreQueryOptions<TVariables, K> &
        FetchMoreOptions<TData, TVariables>
    ) => observableQuery.current!.fetchMore(fetchMoreOptions),
    refetch: (variables?: TVariables) =>
      observableQuery.current!.refetch(variables),
    startPolling: (pollInterval: number) =>
      observableQuery.current!.startPolling(pollInterval),
    stopPolling: () => observableQuery.current!.stopPolling(),
    updateQuery: (
      mapFn: (
        previousQueryResult: TData,
        options: UpdateQueryOptions<TVariables>
      ) => TData
    ) => observableQuery.current!.updateQuery(mapFn),
  };

  if (
    !(
      query === previousQuery.current &&
      isEqual(restOptions, previousRestOptions.current)
    )
  ) {
    previousQuery.current = query;
    previousRestOptions.current = restOptions;
    const watchedQuery = getCachedObservableQuery<TData, TVariables>(
      client,
      query,
      restOptions
    );
    observableQuery.current = watchedQuery;
    const {
      partial,

      data,
      error,
      errors,
      loading,
    } = watchedQuery.currentResult();
    if (partial && suspend) {
      // throw a promise - use the react suspense to wait until the data is
      // available
      throw watchedQuery.result();
    }

    const currentResult: QueryHookState<TData> = {
      data: data as TData,
      error,
      errors,
      loading,
    };

    setResult(currentResult);

    return { ...helpers, ...currentResult };
  }

  return { ...helpers, ...result! };
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
