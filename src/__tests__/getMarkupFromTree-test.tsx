import ApolloClient from 'apollo-client';
import { ApolloLink, Observable } from 'apollo-link';
import { MockedResponse } from 'apollo-link-mock';
import gql from 'graphql-tag';
import * as React from 'react';
import { renderToString } from 'react-dom/server';

import { ApolloProvider } from '../ApolloContext';
import createClient from '../__testutils__/createClient';
import { getMarkupFromTree } from '../getMarkupFromTree';
import { QueryHookOptions, useQuery } from '../useQuery';

const AUTH_QUERY = gql`
  {
    isAuthorized
  }
`;

interface AuthQueryResult {
  isAuthorized: boolean;
}

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
    request: { query: AUTH_QUERY },
    result: { data: { isAuthorized: true } },
  },
  {
    request: { query: USER_QUERY },
    result: { data: { currentUser: { firstName: 'James' } } },
  },
];

const linkReturningError = new ApolloLink(
  () =>
    new Observable(observer => {
      observer.error(new Error('Simulating network error'));
    })
);

function createMockClient(link?: ApolloLink) {
  return createClient({ link, mocks: MOCKS, addTypename: false });
}

function useAuthDetails(options?: QueryHookOptions<{}>) {
  const { data, loading } = useQuery<AuthQueryResult>(AUTH_QUERY, {
    ...options,
    suspend: false,
  });

  return Boolean(!loading && data && data.isAuthorized);
}

function UserDetails(props: QueryHookOptions<{}>) {
  const { data, loading } = useQuery<UserQueryResult>(USER_QUERY, {
    ...props,
    suspend: false,
  });

  return (
    <div>
      {loading || !data || !data.currentUser
        ? 'Loading user details'
        : data.currentUser.firstName}
    </div>
  );
}

interface UserWrapperProps extends QueryHookOptions<{}> {
  readonly client: ApolloClient<object>;
}

function UserDetailsWrapper({ client, ...props }: UserWrapperProps) {
  return (
    <ApolloProvider client={client}>
      <UserDetails {...props} />
    </ApolloProvider>
  );
}

it('should run through all of the queries that want SSR', async () => {
  const client = createMockClient();

  await expect(
    getMarkupFromTree({
      renderFunction: renderToString,
      tree: <UserDetailsWrapper client={client} />,
    })
  ).resolves.toMatchInlineSnapshot(`"<div>James</div>"`);
});

it('should allow network-only fetchPolicy as an option and still render prefetched data', () => {
  const client = createMockClient();

  return expect(
    getMarkupFromTree({
      renderFunction: renderToString,
      tree: <UserDetailsWrapper client={client} fetchPolicy="network-only" />,
    })
  ).resolves.toMatchInlineSnapshot(`"<div>James</div>"`);
});

it('should allow cache-and-network fetchPolicy as an option and still render prefetched data', () => {
  const client = createMockClient();

  return expect(
    getMarkupFromTree({
      renderFunction: renderToString,
      tree: (
        <UserDetailsWrapper client={client} fetchPolicy="cache-and-network" />
      ),
    })
  ).resolves.toMatchInlineSnapshot(`"<div>James</div>"`);
});

it('should pick up queries deep in the render tree', () => {
  const client = createMockClient();

  const Container = () => (
    <div>
      <span>Hi</span>
      <div>
        <UserDetailsWrapper client={client} fetchPolicy="cache-and-network" />
      </div>
    </div>
  );

  return expect(
    getMarkupFromTree({ renderFunction: renderToString, tree: <Container /> })
  ).resolves.toMatchInlineSnapshot(
    `"<div><span>Hi</span><div><div>James</div></div></div>"`
  );
});

it('should handle nested queries that depend on each other', () => {
  const client = createMockClient();

  const AuthorizedUser = () => {
    const authorized = useAuthDetails();

    return (
      <div>
        <div>Authorized: {String(authorized)}</div>

        <UserDetails skip={!authorized} />
      </div>
    );
  };

  const Container = () => {
    return (
      <ApolloProvider client={client}>
        <AuthorizedUser />
      </ApolloProvider>
    );
  };

  return expect(
    getMarkupFromTree({ renderFunction: renderToString, tree: <Container /> })
  ).resolves.toMatchInlineSnapshot(
    `"<div><div>Authorized: <!-- -->true</div><div>James</div></div>"`
  );
});

it('should return the first of multiple errors thrown by nested wrapped components', () => {
  const client = createMockClient();

  const fooError = new Error('foo');
  const BorkedComponent = () => {
    throw fooError;
  };

  const Container = () => {
    return (
      <div>
        <UserDetailsWrapper client={client} />
        <BorkedComponent />
        <BorkedComponent />
      </div>
    );
  };

  return expect(
    getMarkupFromTree({ renderFunction: renderToString, tree: <Container /> })
  ).rejects.toBe(fooError);
});

it('should handle errors thrown by queries', async () => {
  const client = createMockClient(linkReturningError);
  const tree = <UserDetailsWrapper client={client} />;

  await expect(
    getMarkupFromTree({ tree, renderFunction: renderToString })
  ).rejects.toMatchInlineSnapshot(
    `[Error: Network error: Simulating network error]`
  );

  expect(renderToString(tree)).toMatchInlineSnapshot(
    `"<div>Loading user details</div>"`
  );
});

it('should correctly skip queries', async () => {
  const client = createMockClient();

  await expect(
    getMarkupFromTree({
      renderFunction: renderToString,
      tree: <UserDetailsWrapper client={client} skip />,
    })
  ).resolves.toMatchInlineSnapshot(`"<div>Loading user details</div>"`);

  expect(client.cache.extract()).toEqual({});
});

it('should use the correct default props for a query', async () => {
  const client = createMockClient();

  await getMarkupFromTree({
    renderFunction: renderToString,
    tree: <UserDetailsWrapper client={client} />,
  });

  expect(client.cache.extract()).toMatchInlineSnapshot(`
Object {
  "$ROOT_QUERY.currentUser": Object {
    "firstName": "James",
  },
  "ROOT_QUERY": Object {
    "currentUser": Object {
      "generated": true,
      "id": "$ROOT_QUERY.currentUser",
      "type": "id",
      "typename": undefined,
    },
  },
}
`);
});

it("shouldn't run queries if ssr is turned to off", async () => {
  const client = createMockClient();

  await expect(
    getMarkupFromTree({
      renderFunction: renderToString,
      tree: <UserDetailsWrapper client={client} ssr={false} />,
    })
  ).resolves.toMatchInlineSnapshot(`"<div>Loading user details</div>"`);

  expect(client.cache.extract()).toEqual({});
});

it('should not require `ApolloProvider` to be the root component', () => {
  const client = createMockClient();

  const Root = (props: { children: React.ReactNode }) => <div {...props} />;

  return expect(
    getMarkupFromTree({
      renderFunction: renderToString,
      tree: (
        <Root>
          <UserDetailsWrapper client={client} />
        </Root>
      ),
    })
  ).resolves.toMatchInlineSnapshot(`"<div><div>James</div></div>"`);
});
