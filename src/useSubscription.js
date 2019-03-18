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
var react_1 = require('react');
var ApolloContext_1 = require('./ApolloContext');
var actHack_1 = require('./internal/actHack');
var utils_1 = require('./utils');
function useSubscription(query, _a) {
  if (_a === void 0) {
    _a = {};
  }
  var onSubscriptionData = _a.onSubscriptionData,
    overrideClient = _a.client,
    options = __rest(_a, ['onSubscriptionData', 'client']);
  var client = ApolloContext_1.useApolloClient(overrideClient);
  var onSubscriptionDataRef = react_1.useRef(null);
  var _b = react_1.useState({
      loading: true,
    }),
    result = _b[0],
    setResultBase = _b[1];
  onSubscriptionDataRef.current = onSubscriptionData;
  function setResult(newResult) {
    // A hack to get rid React warnings during tests.
    actHack_1['default'](function() {
      setResultBase(newResult);
    });
  }
  react_1.useEffect(
    function() {
      if (options.skip === true) {
        return;
      }
      var subscription = client
        .subscribe(__assign({}, options, { query: query }))
        .subscribe(
          function(nextResult) {
            var newResult = {
              data: nextResult.data,
              error: undefined,
              loading: false,
            };
            setResult(newResult);
            if (onSubscriptionDataRef.current) {
              onSubscriptionDataRef.current({
                client: client,
                subscriptionData: newResult,
              });
            }
          },
          function(error) {
            setResult({ loading: false, data: result.data, error: error });
          }
        );
      return function() {
        setResult({ loading: true });
        subscription.unsubscribe();
      };
    },
    [query, options && utils_1.objToKey(options)]
  );
  return result;
}
exports.useSubscription = useSubscription;
