import { DataProxy } from 'apollo-cache';
import ApolloClient, {
  ApolloError,
  MutationOptions,
  OperationVariables,
} from 'apollo-client';
import { FetchResult } from 'apollo-link';
import { DocumentNode, GraphQLError } from 'graphql';

import React from 'react';
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

export interface MutationResult<TData> {
  called: boolean;
  data?: TData;
  error?: ApolloError;
  loading: boolean;
}

export interface ExecutionResult<T = Record<string, any>> {
  data?: T;
  extensions?: Record<string, any>;
  errors?: GraphQLError[];
}

export function useMutation<TData, TVariables = OperationVariables>(
  mutation: DocumentNode,
  baseOptions: MutationHookOptions<TData, TVariables> = {}
): [MutationFn<TData, TVariables>, MutationResult<TData>] {
  const client = useApolloClient(baseOptions.client);
  const [result, setResult] = React.useState<MutationResult<TData>>({
    called: false,
    data: undefined,
    error: undefined,
    loading: false,
  });

  const { generateNewMutationId, isMostRecentMutation } = useMutationTracking();

  const onMutationStart = () => {
    if (!result.loading) {
      setResult({
        called: true,
        data: undefined,
        error: undefined,
        loading: true,
      });
    }
  };

  const onMutationCompleted = (
    response: ExecutionResult<TData>,
    mutationId: number
  ) => {
    const { data, errors } = response;
    const error =
      errors && errors.length > 0
        ? new ApolloError({ graphQLErrors: errors })
        : undefined;

    if (isMostRecentMutation(mutationId)) {
      setResult(prev => ({
        ...prev,
        data,
        error,
        loading: false,
      }));
    }
  };

  const onMutationError = (error: ApolloError, mutationId: number) => {
    if (isMostRecentMutation(mutationId)) {
      setResult(prev => ({
        ...prev,
        error,
        loading: false,
      }));
    }
  };

  const runMutation = async (
    options: MutationHookOptions<TData, TVariables> = {}
  ) => {
    onMutationStart();
    const mutationId = generateNewMutationId();

    try {
      // merge together variables from baseOptions (if specified)
      // and the execution
      const mutateVariables = baseOptions.variables
        ? { ...options.variables, ...baseOptions.variables }
        : options.variables;

      const response = await client.mutate({
        mutation,
        ...baseOptions,
        ...options,
        variables: mutateVariables,
      });

      onMutationCompleted(response, mutationId);
      return response as ExecutionResult<TData>;
    } catch (err) {
      onMutationError(err, mutationId);
      throw err;
    }
  };

  return [runMutation, result];
}

function useMutationTracking() {
  const mostRecentMutationId = React.useRef(0);

  const generateNewMutationId = (): number => {
    mostRecentMutationId.current += 1;
    return mostRecentMutationId.current;
  };

  const isMostRecentMutation = (mutationId: number) => {
    return mostRecentMutationId.current === mutationId;
  };

  return { generateNewMutationId, isMostRecentMutation };
}
