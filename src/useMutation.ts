import { DataProxy } from 'apollo-cache';
import ApolloClient, {
  MutationOptions,
  OperationVariables,
} from 'apollo-client';
import { FetchResult } from 'apollo-link';
import { DocumentNode } from 'graphql';
import { isEqual } from 'lodash';
import { useCallback, useRef } from 'react';

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
export interface BaseMutationHookOptions<TData, TVariables>
  extends Omit<MutationOptions<TData, TVariables>, 'mutation' | 'update'> {
  update?: MutationUpdaterFn<TData>;
}

export interface MutationHookOptions<TData, TVariables, TCache = object>
  extends BaseMutationHookOptions<TData, TVariables> {
  client?: ApolloClient<TCache>;
}

export type MutationFn<TData, TVariables> = (
  options?: BaseMutationHookOptions<TData, TVariables>
) => Promise<FetchResult<TData>>;

export function useMutation<
  TData,
  TVariables = OperationVariables,
  TCache = object
>(
  mutation: DocumentNode,
  {
    client: overrideClient,
    ...baseOptions
  }: MutationHookOptions<TData, TVariables, TCache> = {}
): MutationFn<TData, TVariables> {
  const client = useApolloClient(overrideClient);

  const baseOptionsRef = useRef(baseOptions);
  if (!isEqual(baseOptionsRef.current, baseOptions)) {
    baseOptionsRef.current = baseOptions;
  }

  const mutationFn: MutationFn<TData, TVariables> = useCallback(
    options =>
      client.mutate({ mutation, ...baseOptionsRef.current!, ...options }),
    [client, mutation, baseOptionsRef.current]
  );

  return mutationFn;
}
