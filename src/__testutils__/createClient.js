'use strict';
exports.__esModule = true;
var apollo_cache_inmemory_1 = require('apollo-cache-inmemory');
var apollo_client_1 = require('apollo-client');
var apollo_link_mock_1 = require('apollo-link-mock');
function createClient(_a) {
  var _b = _a === void 0 ? {} : _a,
    link = _b.link,
    _c = _b.mocks,
    mocks = _c === void 0 ? [] : _c,
    _d = _b.addTypename,
    addTypename = _d === void 0 ? true : _d;
  return new apollo_client_1.ApolloClient({
    cache: new apollo_cache_inmemory_1.InMemoryCache({
      addTypename: addTypename,
    }),
    link: link ? link : new apollo_link_mock_1.MockLink(mocks),
  });
}
exports['default'] = createClient;
