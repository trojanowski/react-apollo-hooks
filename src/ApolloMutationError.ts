import { ApolloError } from 'apollo-client';
import { DocumentNode } from 'graphql';
import { MutationHookOptions } from './useMutation';

export class ApolloMutationError<
  TData = any,
  TVariables = any
> extends ApolloError {
  public mutation: DocumentNode;
  public mutationOptions: MutationHookOptions<TData, TVariables>;

  constructor(
    apolloError: ApolloError,
    mutation: DocumentNode,
    mutationOptions: MutationHookOptions<TData, TVariables>
  ) {
    super({ ...apolloError });
    this.mutation = mutation;
    this.mutationOptions = mutationOptions;
  }
}

export function isMutationError<TData, TVariables>(
  err: Error
): err is ApolloMutationError<TData, TVariables> {
  return err.hasOwnProperty('mutation');
}
