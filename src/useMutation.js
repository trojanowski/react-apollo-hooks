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
var lodash_1 = require('lodash');
var react_1 = require('react');
var ApolloContext_1 = require('./ApolloContext');
function useMutation(mutation, _a) {
  if (_a === void 0) {
    _a = {};
  }
  var overrideClient = _a.client,
    baseOptions = __rest(_a, ['client']);
  var client = ApolloContext_1.useApolloClient(overrideClient);
  var baseOptionsRef = react_1.useRef(baseOptions);
  if (!lodash_1.isEqual(baseOptionsRef.current, baseOptions)) {
    baseOptionsRef.current = baseOptions;
  }
  return react_1.useCallback(
    function(options) {
      return client.mutate(
        __assign({ mutation: mutation }, baseOptionsRef.current, options)
      );
    },
    [client, mutation, baseOptionsRef.current]
  );
}
exports.useMutation = useMutation;
