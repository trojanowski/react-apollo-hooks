'use strict';
exports.__esModule = true;
var react_1 = require('react');
var ApolloContext = react_1['default'].createContext(null);
function ApolloProvider(_a) {
  var client = _a.client,
    children = _a.children;
  return react_1['default'].createElement(
    ApolloContext.Provider,
    { value: client },
    children
  );
}
exports.ApolloProvider = ApolloProvider;
function useApolloClient(overrideClient) {
  var client = react_1.useContext(ApolloContext);
  // Ensures that the number of hooks called from one render to another remains
  // constant, despite the Apollo client read from context being swapped for
  // one passed directly as prop.
  if (overrideClient) {
    return overrideClient;
  }
  if (!client) {
    // https://github.com/apollographql/react-apollo/blob/5cb63b3625ce5e4a3d3e4ba132eaec2a38ef5d90/src/component-utils.tsx#L19-L22
    throw new Error(
      'Could not find "client" in the context or passed in as a prop. ' +
        'Wrap the root component in an <ApolloProvider>, or pass an ' +
        'ApolloClient instance in via props.'
    );
  }
  return client;
}
exports.useApolloClient = useApolloClient;
