import { cleanup, render } from '@testing-library/react';
import React from 'react';

import { ApolloProvider, useApolloClient } from '..';
import createClient from '../__testutils__/createClient';

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
