'use strict';
var __assign =
  (this && this.__assign) ||
  function() {
    __assign =
      Object.assign ||
      function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
exports.__esModule = true;
var apollo_client_1 = require('apollo-client');
var react_1 = require('react');
var ApolloContext_1 = require('./ApolloContext');
var SSRContext_1 = require('./internal/SSRContext');
var actHack_1 = require('./internal/actHack');
var queryCache_1 = require('./queryCache');
var utils_1 = require('./utils');
function useQuery(query, _a) {
  var _b = _a === void 0 ? {} : _a,
    // Hook options
    _c = _b.ssr,
    // Hook options
    ssr = _c === void 0 ? true : _c,
    _d = _b.skip,
    skip = _d === void 0 ? false : _d,
    _e = _b.suspend,
    suspend = _e === void 0 ? false : _e,
    // Watch options
    pollInterval = _b.pollInterval,
    _f = _b.notifyOnNetworkStatusChange,
    notifyOnNetworkStatusChange = _f === void 0 ? false : _f,
    // Apollo client options
    overrideClient = _b.client,
    context = _b.context,
    metadata = _b.metadata,
    variables = _b.variables,
    actualCachePolicy = _b.fetchPolicy,
    errorPolicy = _b.errorPolicy,
    fetchResults = _b.fetchResults;
  var client = ApolloContext_1.useApolloClient(overrideClient);
  var ssrManager = react_1.useContext(SSRContext_1.SSRContext);
  var ssrInUse = ssr && ssrManager;
  // Skips when `skip: true` or SSRContext passed but `ssr: false`
  var shouldSkip = skip || (ssrManager != null && !ssr);
  var fetchPolicy =
    ssrInUse &&
    // Taken from https://github.com/apollographql/react-apollo/blob/2d7e48b7d0c26e792e1ed26e98bb84d8fba5bb8a/src/Query.tsx#L167-L169
    (actualCachePolicy === 'network-only' ||
      actualCachePolicy === 'cache-and-network')
      ? 'cache-first'
      : actualCachePolicy;
  var watchQueryOptions = react_1.useMemo(
    function() {
      return utils_1.compact({
        context: context,
        errorPolicy: errorPolicy,
        fetchPolicy: fetchPolicy,
        fetchResults: fetchResults,
        metadata: metadata,
        notifyOnNetworkStatusChange: notifyOnNetworkStatusChange,
        pollInterval: pollInterval,
        query: query,
        variables: variables,
      });
    },
    [
      query,
      pollInterval,
      notifyOnNetworkStatusChange,
      context && utils_1.objToKey(context),
      metadata && utils_1.objToKey(metadata),
      variables && utils_1.objToKey(variables),
      fetchPolicy,
      errorPolicy,
      fetchResults,
    ]
  );
  var observableQuery = react_1.useMemo(
    function() {
      return queryCache_1.getCachedObservableQuery(client, watchQueryOptions);
    },
    [client, watchQueryOptions]
  );
  var _g = react_1.useState(0),
    responseId = _g[0],
    setResponseId = _g[1];
  var currentResult = react_1.useMemo(
    function() {
      var result = observableQuery.currentResult();
      return {
        data: result.data,
        error:
          result.errors && result.errors.length > 0
            ? new apollo_client_1.ApolloError({ graphQLErrors: result.errors })
            : result.error,
        errors: result.errors,
        loading: result.loading,
        // don't try to return `networkStatus` when suspense it's used
        // because it's unreliable in that case
        // https://github.com/trojanowski/react-apollo-hooks/pull/68
        networkStatus: suspend ? undefined : result.networkStatus,
        partial: result.partial,
      };
    },
    [shouldSkip, responseId, observableQuery]
  );
  react_1.useEffect(
    function() {
      if (shouldSkip) {
        return;
      }
      var invalidateCurrentResult = function() {
        // A hack to get rid React warnings during tests. The default
        // implementation of `actHack` just invokes the callback immediately.
        // In tests, it's replaced with `act` from react-testing-library.
        // A better solution welcome.
        actHack_1['default'](function() {
          setResponseId(function(x) {
            return x + 1;
          });
        });
      };
      var subscription = observableQuery.subscribe(
        invalidateCurrentResult,
        invalidateCurrentResult
      );
      queryCache_1.invalidateCachedObservableQuery(client, watchQueryOptions);
      return function() {
        subscription.unsubscribe();
      };
    },
    [shouldSkip, observableQuery]
  );
  ensureSupportedFetchPolicy(suspend, fetchPolicy);
  var helpers = {
    fetchMore: observableQuery.fetchMore.bind(observableQuery),
    refetch: observableQuery.refetch.bind(observableQuery),
    startPolling: observableQuery.startPolling.bind(observableQuery),
    stopPolling: observableQuery.stopPolling.bind(observableQuery),
    updateQuery: observableQuery.updateQuery.bind(observableQuery),
  };
  if (shouldSkip) {
    // Taken from https://github.com/apollographql/react-apollo/blob/5cb63b3625ce5e4a3d3e4ba132eaec2a38ef5d90/src/Query.tsx#L376-L381
    return __assign({}, helpers, {
      data: undefined,
      error: undefined,
      loading: false,
      networkStatus: undefined,
    });
  }
  if (currentResult.partial) {
    if (suspend) {
      // throw a promise - use the react suspense to wait until the data is
      // available
      throw observableQuery.result();
    }
    if (ssrInUse) {
      ssrManager.register(observableQuery.result());
    }
  }
  return __assign({}, helpers, currentResult);
}
exports.useQuery = useQuery;
function ensureSupportedFetchPolicy(suspend, fetchPolicy) {
  if (suspend && fetchPolicy && fetchPolicy !== 'cache-first') {
    throw new Error(
      'Fetch policy ' +
        fetchPolicy +
        " is not supported without 'suspend: false'"
    );
  }
}
