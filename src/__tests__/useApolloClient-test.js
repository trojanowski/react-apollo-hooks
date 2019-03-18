'use strict';
exports.__esModule = true;
var react_1 = require('react');
var react_testing_library_1 = require('react-testing-library');
var __1 = require('..');
var createClient_1 = require('../__testutils__/createClient');
afterEach(react_testing_library_1.cleanup);
it('should return the provied apollo client', function() {
  expect.assertions(1);
  var client = createClient_1['default']();
  function ComponentWithClient() {
    var providedClient = __1.useApolloClient();
    expect(providedClient).toBe(client);
    return null;
  }
  react_testing_library_1.render(
    react_1['default'].createElement(
      __1.ApolloProvider,
      { client: client },
      react_1['default'].createElement(ComponentWithClient, null)
    )
  );
});
