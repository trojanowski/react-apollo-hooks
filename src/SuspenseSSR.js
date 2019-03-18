'use strict';
exports.__esModule = true;
var react_1 = require('react');
var SSRContext_1 = require('./internal/SSRContext');
function unstable_SuspenseSSR(_a) {
  var children = _a.children,
    fallback = _a.fallback;
  var ssrManager = react_1.useContext(SSRContext_1.SSRContext);
  return ssrManager
    ? react_1['default'].createElement(
        react_1['default'].Fragment,
        null,
        children
      )
    : react_1['default'].createElement(
        react_1.Suspense,
        { fallback: fallback },
        children
      );
}
exports.unstable_SuspenseSSR = unstable_SuspenseSSR;
