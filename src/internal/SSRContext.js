'use strict';
exports.__esModule = true;
var react_1 = require('react');
function createSSRManager() {
  var promiseSet = new Set();
  return {
    hasPromises: function() {
      return promiseSet.size > 0;
    },
    register: function(promise) {
      promiseSet.add(promise);
    },
    consumeAndAwaitPromises: function() {
      var promises = Array.from(promiseSet);
      promiseSet.clear();
      return Promise.all(promises);
    },
  };
}
exports.createSSRManager = createSSRManager;
exports.SSRContext = react_1.createContext(null);
