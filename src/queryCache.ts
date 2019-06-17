import ApolloClient, {
  ObservableQuery,
  WatchQueryOptions,
} from 'apollo-client';
import { createHash } from 'crypto';
import { print } from 'graphql/language/printer';

import { objToKey } from './utils';

const cachedQueriesByClient = new WeakMap<
  ApolloClient<any>,
  Map<any, ObservableQuery<any, any>>
>();

export function getCachedObservableQuery<TData, TVariables>(
  client: ApolloClient<any>,
  options: WatchQueryOptions<TVariables>
): ObservableQuery<TData, TVariables> {
  const queriesForClient = getCachedQueriesForClient(client);
  const cacheKey = getCacheKey(options);
  let observableQuery = queriesForClient.get(cacheKey);
  if (observableQuery == null) {
    observableQuery = client.watchQuery(options);
    queriesForClient.set(cacheKey, observableQuery);
  }
  return observableQuery;
}

export function invalidateCachedObservableQuery<TVariables>(
  client: ApolloClient<any>,
  options: WatchQueryOptions<TVariables>
): void {
  const queriesForClient = getCachedQueriesForClient(client);
  const cacheKey = getCacheKey(options);
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

function getCacheKey<TVariables>({
  query,
  ...options
}: WatchQueryOptions<TVariables>): string {
  const cacheKey = createHash('sha1')
    .update(`${print(query)}@@${objToKey(options)}`)
    .digest('base64');
  return cacheKey;
}
