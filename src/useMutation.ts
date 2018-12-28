import { DataProxy } from 'apollo-cache';
import { MutationOptions, OperationVariables } from 'apollo-client';
import { FetchResult } from 'apollo-link';
import { DocumentNode } from 'graphql';

import { useApolloClient } from './ApolloContext';
import { Omit } from './utils';

export type MutationUpdaterFn<TData = Record<string, any>> = (
  proxy: DataProxy,
  mutationResult: FetchResult<TData>
) => void;

// We have to redefine MutationUpdaterFn and `update` option of `useMutation`
// hook because we want them to use our custom parametrized version
// of `FetchResult` type. Please look at
// https://github.com/trojanowski/react-apollo-hooks/issues/25
export interface MutationHookOptions<TData, TVariables>
  extends Omit<MutationOptions<TData, TVariables>, 'mutation' | 'update'> {
  update?: MutationUpdaterFn<TData>;
}

export type MutationFn<TData, TVariables> = (
  options?: MutationHookOptions<TData, TVariables>
) => Promise<FetchResult<TData>>;

export function useMutation<TData, TVariables = OperationVariables>(
  mutation: DocumentNode,
  baseOptions?: MutationHookOptions<TData, TVariables>
): MutationFn<TData, TVariables> {
  const client = useApolloClient();

  return options => client.mutate({ mutation, ...baseOptions, ...options });
}
