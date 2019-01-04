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
import flushEffectsAndWait from '../__testutils__/flushEffectsAndWait';
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

it('not throws in react-dom with suspense', async () => {
  const client = createMockClient();

  const { container } = render(<UserDetailsWrapper client={client} suspend />);

  expect(container).toMatchInlineSnapshot(`
<div>
  Loading with suspense
</div>
`);

  await flushEffectsAndWait();

  expect(container).toMatchInlineSnapshot(`
<div>
  James
</div>
`);
});

it('not throws in react-dom without suspense', async () => {
  const client = createMockClient();

  const { container } = render(
    <UserDetailsWrapper client={client} suspend={false} />
  );

  expect(container).toMatchInlineSnapshot(`
<div>
  Loading
</div>
`);

  await flushEffectsAndWait();

  expect(container).toMatchInlineSnapshot(`
<div>
  James
</div>
`);
});

it('not throws in react-dom/server with suspense', async () => {
  const client = createMockClient();

  await expect(
    getMarkupFromTree({
      renderFunction: renderToString,
      tree: <UserDetailsWrapper client={client} suspend />,
    })
  ).resolves.toMatchInlineSnapshot(`"James"`);
});

it('not throws in react-dom/server without suspense', async () => {
  const client = createMockClient();

  await expect(
    getMarkupFromTree({
      renderFunction: renderToString,
      tree: <UserDetailsWrapper client={client} suspend={false} />,
    })
  ).resolves.toMatchInlineSnapshot(`"James"`);
});
