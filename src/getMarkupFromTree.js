'use strict';
exports.__esModule = true;
var React = require('react');
var SSRContext_1 = require('./internal/SSRContext');
var utils_1 = require('./utils');
function getMarkupFromTree(_a) {
  var tree = _a.tree,
    onBeforeRender = _a.onBeforeRender,
    renderFunction = _a.renderFunction;
  var ssrManager = SSRContext_1.createSSRManager();
  function process() {
    try {
      if (onBeforeRender) {
        onBeforeRender();
      }
      var html = renderFunction(
        React.createElement(
          SSRContext_1.SSRContext.Provider,
          { value: ssrManager },
          tree
        )
      );
      if (!ssrManager.hasPromises()) {
        return html;
      }
    } catch (e) {
      if (!utils_1.isPromiseLike(e)) {
        throw e;
      }
      ssrManager.register(e);
    }
    return ssrManager.consumeAndAwaitPromises().then(process);
  }
  return Promise.resolve().then(process);
}
exports.getMarkupFromTree = getMarkupFromTree;
