import { print } from 'graphql/language/printer';

import objToKey from './objToKey';

const cachedQueriesByClient = new WeakMap();

export function getCachedObservableQuery(client, query, options) {
  const queriesForClient = getCachedQueriesForClient(client);
  const cacheKey = getCacheKey(query, options);
  let observableQuery = queriesForClient.get(cacheKey);
  if (observableQuery == null) {
    observableQuery = client.watchQuery({ query, ...options });
    queriesForClient.set(cacheKey, observableQuery);
  }
  return observableQuery;
}

export function invalidateCachedObservableQuery(client, query, options) {
  const queriesForClient = getCachedQueriesForClient(client);
  const cacheKey = getCacheKey(query, options);
  queriesForClient.delete(cacheKey);
}

function getCachedQueriesForClient(client) {
  let queriesForClient = cachedQueriesByClient.get(client);
  if (queriesForClient == null) {
    queriesForClient = new Map();
    cachedQueriesByClient.set(client, queriesForClient);
  }
  return queriesForClient;
}

function getCacheKey(query, options) {
  return `${print(query)}@@${objToKey(options)}`;
}
