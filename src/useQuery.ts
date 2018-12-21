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
  FetchPolicy,
  ApolloCurrentResult,
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
    skip = false,
    suspend = true,
    ...restOptions
  }: QueryHookOptions<TVariables> = {}
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
      if (skip) {
        return;
      }

      const subscription = observableQuery.current!.subscribe(nextResult => {
        setResult(nextResult);
      });
      invalidateCachedObservableQuery(client!, query, restOptions);

      return () => {
        subscription.unsubscribe();
      };
    },
    [skip, query, objToKey(restOptions)]
  );

  ensureSupportedFetchPolicy(suspend, restOptions.fetchPolicy);

  const shouldUpdateQuery = !(
    query === previousQuery.current &&
    isEqual(restOptions, previousRestOptions.current)
  );

  // TODO: Refactor with useMemo.
  if (shouldUpdateQuery) {
    previousQuery.current = query;
    previousRestOptions.current = restOptions;
    observableQuery.current = getCachedObservableQuery<TData, TVariables>(
      client!,
      query,
      restOptions
    );
  }

  const helpers = {
    fetchMore: observableQuery.current!.fetchMore.bind(observableQuery.current),
    refetch: observableQuery.current!.refetch.bind(observableQuery.current),
    startPolling: observableQuery.current!.startPolling.bind(
      observableQuery.current
    ),
    stopPolling: observableQuery.current!.stopPolling.bind(
      observableQuery.current
    ),
    updateQuery: observableQuery.current!.updateQuery.bind(
      observableQuery.current
    ),
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
    const currentResult = observableQuery.current!.currentResult();

    if (currentResult.partial) {
      // throw a promise - use the react suspense to wait until the data is
      // available
      throw observableQuery.current!.result();
    }
  }

  if (shouldUpdateQuery) {
    const nextState = currentResultToState(
      observableQuery.current!.currentResult()
    );

    setResult(nextState);

    return { ...helpers, ...nextState };
  }

  if (!result) {
    const nextState = currentResultToState(
      observableQuery.current!.currentResult()
    );

    setResult(nextState);

    return { ...helpers, ...nextState };
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
