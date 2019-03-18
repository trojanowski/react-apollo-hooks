'use strict';
exports.__esModule = true;
var utils_1 = require('../utils');
describe('compact', function() {
  it('returns a new object omitting any keys with an undefined value', function() {
    var compacted = utils_1.compact({ a: 'value', b: 1, c: undefined });
    expect(compacted.hasOwnProperty('c')).toBe(false);
  });
});
