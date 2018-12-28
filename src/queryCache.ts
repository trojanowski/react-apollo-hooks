import ApolloClient, { ObservableQuery } from 'apollo-client';
import { DocumentNode } from 'graphql';
import { print } from 'graphql/language/printer';

import objToKey from './utils';

const cachedQueriesByClient = new WeakMap<
  ApolloClient<any>,
  Map<any, ObservableQuery<any, any>>
>();

export function getCachedObservableQuery<TData, TVariables>(
  client: ApolloClient<any>,
  query: DocumentNode,
  options: Record<string, any>
): ObservableQuery<TData, TVariables> {
  const queriesForClient = getCachedQueriesForClient(client);
  const cacheKey = getCacheKey(query, options);
  let observableQuery = queriesForClient.get(cacheKey);
  if (observableQuery == null) {
    observableQuery = client.watchQuery({ query, ...options });
    queriesForClient.set(cacheKey, observableQuery);
  }
  return observableQuery;
}

export function invalidateCachedObservableQuery(
  client: ApolloClient<any>,
  query: DocumentNode,
  options: Record<string, any>
): void {
  const queriesForClient = getCachedQueriesForClient(client);
  const cacheKey = getCacheKey(query, options);
  queriesForClient.delete(cacheKey);
}

function getCachedQueriesForClient(client: ApolloClient<any>) {
  let queriesForClient = cachedQueriesByClient.get(client);
  if (queriesForClient == null) {
    queriesForClient = new Map();
    cachedQueriesByClient.set(client, queriesForClient);
  }
  return queriesForClient;
}

function getCacheKey(
  query: DocumentNode,
  options: Record<string, any>
): string {
  return `${print(query)}@@${objToKey(options)}`;
}
