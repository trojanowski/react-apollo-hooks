import { ApolloError } from 'apollo-client';
import { DocumentNode } from 'graphql';
import { QueryHookOptions } from './useQuery';

export class ApolloQueryError<TVariables = any> extends ApolloError {
  public query: DocumentNode;
  public queryOptions: QueryHookOptions<TVariables>;

  constructor(
    apolloError: ApolloError,
    query: DocumentNode,
    queryOptions: QueryHookOptions<TVariables>
  ) {
    super({ ...apolloError });
    this.query = query;
    this.queryOptions = queryOptions;
  }
}

export function isQueryError<TVariables>(
  err: Error
): err is ApolloQueryError<TVariables> {
  return err.hasOwnProperty('query');
}
