import {
  ApolloQueryResult,
  FetchMoreOptions,
  FetchMoreQueryOptions,
  NetworkStatus,
  ObservableQuery,
  OperationVariables,
} from 'apollo-client';
import { DocumentNode } from 'graphql';
import React from 'react';
import { useReactApolloHooksOptions } from './ApolloContext';
import { QueryHookOptions, QueryHookResult, useQuery } from './useQuery';

export interface QueryLoaderResult<TData, TVariables>
  extends Pick<
    ObservableQuery<TData, TVariables>,
    'refetch' | 'startPolling' | 'stopPolling' | 'updateQuery'
  > {
  data?: TData;
  // networkStatus is undefined for skipped queries or the ones using suspense
  networkStatus: NetworkStatus | undefined;
  partial?: boolean;
  fetchMore<K extends keyof TVariables>(
    fetchMoreOptions: FetchMoreQueryOptions<TVariables, K> &
      FetchMoreOptions<TData, TVariables>
  ): Promise<ApolloQueryResult<TData>>;
}

type RenderCallback<TData, TVariables> = (
  result: QueryLoaderResult<TData, TVariables>
) => React.ReactElement<any> | null;

export function useQueryLoader<
  TData = any,
  TVariables = OperationVariables,
  TCache = object
>(query: DocumentNode, options?: QueryHookOptions<TVariables, TCache>) {
  const result = useQuery(query, options);
  return (renderCallback: RenderCallback<TData, TVariables>) =>
    render({ result, renderCallback });
}

export interface QueryLoaderProps {
  result: QueryHookResult<any, any>;
  renderCallback: RenderCallback<any, any>;
}

function render({ result, renderCallback }: QueryLoaderProps) {
  const {
    defaultLoadingComponent: LoadingComponent,
    defaultErrorComponent: ErrorComponent,
  } = useReactApolloHooksOptions();
  if (!(LoadingComponent && ErrorComponent)) {
    throw Error(
      'defaultLoadingComponent and defaultErrorComponent must be set prior to using the useQueryLoader() hook'
    );
  }
  if (result.loading) {
    return <LoadingComponent />;
  }
  if (result.error) {
    return <ErrorComponent errorObject={result.error} />;
  }
  return renderCallback(result);
}
