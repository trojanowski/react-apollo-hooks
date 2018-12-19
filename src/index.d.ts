import {
  ApolloClient,
  ApolloQueryResult,
  FetchMoreOptions,
  FetchMoreQueryOptions,
  MutationOptions,
  ObservableQuery,
  OperationVariables,
  QueryOptions,
} from 'apollo-client';
import { DataProxy } from 'apollo-cache';
import { DocumentNode, ExecutionResult } from 'graphql';
import * as React from 'react';

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

type FetchResult<
  C = Record<string, any>,
  E = Record<string, any>
> = ExecutionResult<C> & {
  extensions?: E;
  context?: C;
};

export function ApolloProvider<CacheShape = any>(props: {
  children: React.ReactNode;
  client: ApolloClient<CacheShape>;
}): JSX.Element;

export function useApolloClient<CacheShape = any>(): ApolloClient<
  CacheShape
> | null;

type QueryHookOptions<TVariables> = Omit<QueryOptions<TVariables>, 'query'> & {
  // watch query options from apollo client
  notifyOnNetworkStatusChange?: boolean;
  pollInterval?: number;
  // custom options of `useQuery` hook
  skip?: boolean;
  suspend?: boolean;
};

export function useQuery<TData = any, TVariables = OperationVariables>(
  query: DocumentNode,
  options?: QueryHookOptions<TVariables>
): ApolloQueryResult<TData> &
  Pick<
    ObservableQuery<TData, TVariables>,
    'refetch' | 'startPolling' | 'stopPolling' | 'updateQuery'
  > & {
    fetchMore<K extends keyof TVariables>(
      fetchMoreOptions: FetchMoreQueryOptions<TVariables, K> &
        FetchMoreOptions<TData, TVariables>
    ): Promise<ApolloQueryResult<TData>>;
  };

// We have to redefine MutationUpdaterFn and `update` option of `useMutation`
// hook because we want them to use our custom parametrized version
// of `FetchResult` type. Please look at
// https://github.com/trojanowski/react-apollo-hooks/issues/25
export type MutationUpdaterFn<
  T = {
    [key: string]: any;
  }
> = (proxy: DataProxy, mutationResult: FetchResult<T>) => void;

type MutationHookOptions<T, TVariables> = Omit<
  MutationOptions<T, TVariables>,
  'mutation' | 'update'
> & {
  update?: MutationUpdaterFn<T>;
};

export function useMutation<T, TVariables = OperationVariables>(
  mutation: DocumentNode,
  options?: MutationHookOptions<T, TVariables>
): ((
  localOptions?: MutationHookOptions<T, TVariables>
) => Promise<FetchResult<T>>);
