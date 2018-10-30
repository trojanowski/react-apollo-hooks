import {
  ApolloClient,
  ApolloQueryResult,
  FetchMoreOptions,
  FetchMoreQueryOptions,
  MutationOptions,
  ObservableQuery,
  OperationVariables,
} from 'apollo-client';
import { FetchResult } from 'apollo-link';
import { DocumentNode } from 'graphql';
import * as React from 'react';

export function ApolloProvider<CacheShape = any>(props: {
  children: React.ReactNode;
  client: ApolloClient<CacheShape>;
}): JSX.Element;

export function useApolloClient<CacheShape = any>(): ApolloClient<
  CacheShape
> | null;

export function useApolloQuery<TData = any, TVariables = OperationVariables>(
  query: DocumentNode,
  options?: { variables: TVariables }
): ApolloQueryResult<TData> & {
  fetchMore<K extends keyof TVariables>(
    fetchMoreOptions: FetchMoreQueryOptions<TVariables, K> &
      FetchMoreOptions<TData, TVariables>
  ): Promise<ApolloQueryResult<TData>>;
};

export function useApolloMutation<T, TVariables>(
  mutation: DocumentNode,
  options?: Partial<MutationOptions<T, TVariables>>
): Promise<FetchResult<T>>;
