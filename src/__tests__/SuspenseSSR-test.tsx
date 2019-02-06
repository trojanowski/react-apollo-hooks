import ApolloClient from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { MockedResponse } from 'apollo-link-mock';
import gql from 'graphql-tag';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { render } from 'react-testing-library';

import { ApolloProvider } from '../ApolloContext';
import { unstable_SuspenseSSR as SuspenseSSR } from '../SuspenseSSR';
import createClient from '../__testutils__/createClient';
import flushRequests from '../__testutils__/flushRequests';
import { getMarkupFromTree } from '../getMarkupFromTree';
import { QueryHookOptions, useQuery } from '../useQuery';

const USER_QUERY = gql`
  {
    currentUser {
      firstName
    }
  }
`;

interface UserQueryResult {
  currentUser: { firstName: string };
}

const MOCKS: MockedResponse[] = [
  {
    request: { query: USER_QUERY },
    result: { data: { currentUser: { firstName: 'James' } } },
  },
];

function createMockClient(link?: ApolloLink) {
  return createClient({ link, mocks: MOCKS, addTypename: false });
}

function UserDetails(props: QueryHookOptions<{}>) {
  const { data, loading } = useQuery<UserQueryResult>(USER_QUERY, props);

  return (
    <>
      {loading
        ? 'Loading'
        : !data
        ? 'No Data'
        : !data.currentUser
        ? 'No Current User'
        : data.currentUser.firstName}
    </>
  );
}

interface UserWrapperProps extends QueryHookOptions<{}> {
  readonly client: ApolloClient<object>;
}

function UserDetailsWrapper({ client, ...props }: UserWrapperProps) {
  return (
    <ApolloProvider client={client}>
      <SuspenseSSR fallback={<>Loading with suspense</>}>
        <UserDetails {...props} />
      </SuspenseSSR>
    </ApolloProvider>
  );
}

describe.each([[true], [false]])('SuspenseSSR with "suspend: %s"', suspend => {
  it('not throws in react-dom', async () => {
    jest.useFakeTimers();

    const client = createMockClient();

    const { container } = render(
      <UserDetailsWrapper client={client} suspend={suspend} />
    );

    if (suspend) {
      expect(container).toMatchInlineSnapshot(`
<div>
  Loading with suspense
</div>
`);
    } else {
      expect(container).toMatchInlineSnapshot(`
<div>
  Loading
</div>
`);
    }

    await flushRequests();

    expect(container).toMatchInlineSnapshot(`
<div>
  James
</div>
`);

    jest.useRealTimers();
  });

  it('not throws in react-dom/server', async () => {
    const client = createMockClient();

    await expect(
      getMarkupFromTree({
        renderFunction: renderToString,
        tree: <UserDetailsWrapper client={client} suspend={suspend} />,
      })
    ).resolves.toMatchInlineSnapshot(`"James"`);
  });
});
