'use strict';
var __rest =
  (this && this.__rest) ||
  function(s, e) {
    var t = {};
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === 'function')
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++)
        if (e.indexOf(p[i]) < 0) t[p[i]] = s[p[i]];
    return t;
  };
exports.__esModule = true;
var printer_1 = require('graphql/language/printer');
var utils_1 = require('./utils');
var cachedQueriesByClient = new WeakMap();
function getCachedObservableQuery(client, options) {
  var queriesForClient = getCachedQueriesForClient(client);
  var cacheKey = getCacheKey(options);
  var observableQuery = queriesForClient.get(cacheKey);
  if (observableQuery == null) {
    observableQuery = client.watchQuery(options);
    queriesForClient.set(cacheKey, observableQuery);
  }
  return observableQuery;
}
exports.getCachedObservableQuery = getCachedObservableQuery;
function invalidateCachedObservableQuery(client, options) {
  var queriesForClient = getCachedQueriesForClient(client);
  var cacheKey = getCacheKey(options);
  queriesForClient['delete'](cacheKey);
}
exports.invalidateCachedObservableQuery = invalidateCachedObservableQuery;
function getCachedQueriesForClient(client) {
  var queriesForClient = cachedQueriesByClient.get(client);
  if (queriesForClient == null) {
    queriesForClient = new Map();
    cachedQueriesByClient.set(client, queriesForClient);
  }
  return queriesForClient;
}
function getCacheKey(_a) {
  var query = _a.query,
    options = __rest(_a, ['query']);
  return printer_1.print(query) + '@@' + utils_1.objToKey(options);
}
