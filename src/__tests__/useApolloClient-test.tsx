import React from 'react';
import { cleanup, render } from 'react-testing-library';

import createClient from '../__testutils__/createClient';
import { ApolloProvider } from '../ApolloContext';
import { useApolloClient } from '../ApolloContext';

afterEach(cleanup);

it('should return the provied apollo client', () => {
  expect.assertions(1);
  const client = createClient();

  function ComponentWithClient() {
    const providedClient = useApolloClient();
    expect(providedClient).toBe(client);
    return null;
  }

  render(
    <ApolloProvider client={client}>
      <ComponentWithClient />
    </ApolloProvider>
  );
});
