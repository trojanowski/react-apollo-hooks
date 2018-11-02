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
import { FetchResult } from 'apollo-link';
import { DocumentNode } from 'graphql';
import * as React from 'react';

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export function ApolloProvider<CacheShape = any>(props: {
  children: React.ReactNode;
  client: ApolloClient<CacheShape>;
}): JSX.Element;

export function useApolloClient<CacheShape = any>(): ApolloClient<
  CacheShape
> | null;

type QueryHookOptions<TVariables> = Omit<QueryOptions<TVariables>, 'query'>;

export function useApolloQuery<TData = any, TVariables = OperationVariables>(
  query: DocumentNode,
  options?: QueryHookOptions<TVariables>
): ApolloQueryResult<TData> & {
  fetchMore<K extends keyof TVariables>(
    fetchMoreOptions: FetchMoreQueryOptions<TVariables, K> &
      FetchMoreOptions<TData, TVariables>
  ): Promise<ApolloQueryResult<TData>>;
};

type MutationHookOptions<T, TVariables> = Omit<
  MutationOptions<T, TVariables>,
  'mutation'
>;

export function useApolloMutation<T, TVariables = OperationVariables>(
  mutation: DocumentNode,
  options?: MutationHookOptions<T, TVariables>
): ((
  localOptions?: MutationHookOptions<T, TVariables>
) => Promise<FetchResult<T>>);
