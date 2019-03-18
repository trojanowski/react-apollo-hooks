'use strict';
exports.__esModule = true;
function wait() {
  return new Promise(function(resolve) {
    return setTimeout(resolve, 10);
  });
}
exports['default'] = wait;
