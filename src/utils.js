'use strict';
exports.__esModule = true;
var isPlainObject_1 = require('lodash/isPlainObject');
function objToKey(obj) {
  if (!isPlainObject_1['default'](obj)) {
    return obj;
  }
  var sortedObj = Object.keys(obj)
    .sort()
    .reduce(function(result, key) {
      result[key] = objToKey(obj[key]);
      return result;
    }, {});
  return JSON.stringify(sortedObj);
}
exports.objToKey = objToKey;
function isPromiseLike(value) {
  return value != null && typeof value.then === 'function';
}
exports.isPromiseLike = isPromiseLike;
function compact(obj) {
  return Object.keys(obj).reduce(function(acc, key) {
    if (obj[key] !== undefined) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
}
exports.compact = compact;
