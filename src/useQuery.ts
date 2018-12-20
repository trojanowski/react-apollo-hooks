import { DocumentNode } from 'graphql';
import { useState, useEffect, useRef } from 'react';
import {
  invalidateCachedObservableQuery,
  getCachedObservableQuery,
} from './queryCache';
import objToKey, { Omit } from './Utils';
import isEqual from 'react-fast-compare';
import { useApolloClient } from './ApolloContext';
import {
  OperationVariables,
  QueryOptions,
  ObservableQuery,
  ApolloQueryResult,
  FetchMoreQueryOptions,
  FetchMoreOptions,
  UpdateQueryOptions,
  FetchPolicy,
  ApolloCurrentResult,
} from 'apollo-client';

export interface QueryHookOptions<TVariables>
  extends Omit<QueryOptions<TVariables>, 'query'> {
  // watch query options from apollo client
  notifyOnNetworkStatusChange?: boolean;
  pollInterval?: number;
  // custom options of `useQuery` hook
  suspend?: boolean;
}

export type QueryHookState<TData> = Pick<
  ApolloCurrentResult<undefined | TData>,
  'error' | 'errors' | 'loading'
>;

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
      invalidateCachedObservableQuery(client!, query, restOptions);

      return () => {
        subscription.unsubscribe();
      };
    },
    [query, objToKey(restOptions)]
  );

  ensureSupportedFetchPolicy(suspend, restOptions.fetchPolicy);

  // TODO: https://github.com/apollographql/react-apollo/blob/5cb63b3625ce5e4a3d3e4ba132eaec2a38ef5d90/src/Query.tsx#L54-L59
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
      client!,
      query,
      restOptions
    );
    observableQuery.current = watchedQuery;
    const currentResult = watchedQuery.currentResult();
    if (currentResult.partial && suspend) {
      // throw a promise - use the react suspense to wait until the data is
      // available
      throw watchedQuery.result();
    }

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
