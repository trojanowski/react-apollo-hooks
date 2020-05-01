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
import actHack from './internal/actHack';
import { Omit, objToKey } from './utils';

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
  rethrow?: boolean;
}

export interface MutationHookOptions<TData, TVariables, TCache = object>
  extends BaseMutationHookOptions<TData, TVariables> {
  client?: ApolloClient<TCache>;
}

export type MutationFn<TData, TVariables> = (
  options?: BaseMutationHookOptions<TData, TVariables>
) => Promise<FetchResult<TData>>;

export interface ExecutionResult<T = Record<string, any>> {
  data?: T;
  extensions?: Record<string, any>;
  errors?: GraphQLError[];
}

export interface MutationResult<TData> {
  called: boolean;
  data?: TData;
  error?: ApolloError;
  hasError: boolean;
  loading: boolean;
}

const getInitialState = (): MutationResult<any> => ({
  called: false,
  data: undefined,
  error: undefined,
  hasError: false,
  loading: false,
});

export function useMutation<TData, TVariables = OperationVariables>(
  mutation: DocumentNode,
  baseOptions: MutationHookOptions<TData, TVariables> = {}
): [MutationFn<TData, TVariables>, MutationResult<TData>] {
  const client = useApolloClient(baseOptions.client);
  const [result, setResult] = React.useState<MutationResult<TData>>(
    getInitialState
  );

  const { rethrow = true, ...options } = baseOptions;

  const mergeResult = (partialResult: Partial<MutationResult<TData>>) => {
    // A hack to get rid React warnings during tests.
    actHack(() => {
      setResult(prev => ({
        ...prev,
        ...partialResult,
      }));
    });
  };

  // reset state if client instance changes
  React.useEffect(
    () => {
      mergeResult(getInitialState());
    },
    [client]
  );

  const { generateNewMutationId, isMostRecentMutation } = useMutationTracking();

  const onMutationStart = () => {
    if (!result.loading) {
      mergeResult({
        called: true,
        data: undefined,
        error: undefined,
        hasError: false,
        loading: true,
      });
    }
  };

  const onMutationError = (error: ApolloError, mutationId: number) => {
    if (isMostRecentMutation(mutationId)) {
      mergeResult({
        error,
        hasError: true,
        loading: false,
      });
    }
  };

  const onMutationCompleted = (
    response: ExecutionResult<TData>,
    mutationId: number
  ) => {
    const { data, errors } = response;
    if (errors && errors.length > 0) {
      onMutationError(new ApolloError({ graphQLErrors: errors }), mutationId);
      return;
    }

    if (isMostRecentMutation(mutationId)) {
      mergeResult({
        data,
        loading: false,
      });
    }
  };

  const runMutation = React.useCallback(
    (mutateOptions: MutationHookOptions<TData, TVariables> = {}, context: TData | undefined) => {
      return new Promise<FetchResult<TData>>((resolve, reject) => {
        onMutationStart();
        const mutationId = generateNewMutationId();

        // merge together variables from baseOptions (if specified)
        // and the execution
        const mutateVariables = options.variables
          ? { ...mutateOptions.variables, ...options.variables }
          : mutateOptions.variables;

        client
          .mutate({
            mutation,
            ...options,
            ...mutateOptions,
            variables: mutateVariables,
          })
          .then(response => {
            onMutationCompleted(response, mutationId, context);
            resolve(response as ExecutionResult<TData>);
          })
          .catch(err => {
            onMutationError(err, mutationId, context);
            if (rethrow) {
              reject(err);
              return;
            }
            resolve(({} as unknown) as ExecutionResult<TData>);
          });
      });
    },
    [client, mutation, objToKey(baseOptions)]
  );

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
