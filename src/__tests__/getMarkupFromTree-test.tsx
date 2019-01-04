import ApolloClient from 'apollo-client';
import { ApolloLink, Observable } from 'apollo-link';
import { MockedResponse } from 'apollo-link-mock';
import gql from 'graphql-tag';
import * as React from 'react';
import { renderToString } from 'react-dom/server';

import { ApolloProvider } from '../ApolloContext';
import { TestErrorBoundary } from '../__testutils__/TestErrorBoundary';
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
  const { data, loading } = useQuery<AuthQueryResult>(AUTH_QUERY, options);

  return Boolean(!loading && data && data.isAuthorized);
}

function UserDetails(props: QueryHookOptions<{}>) {
  const { data, loading } = useQuery<UserQueryResult>(USER_QUERY, props);

  return (
    <>
      {loading
        ? 'Loading'
        : !data
        ? 'No Data (skipped)'
        : !data.currentUser
        ? 'No Current User (failed)'
        : data.currentUser.firstName}
    </>
  );
}

interface UserWrapperProps extends QueryHookOptions<{}> {
  readonly client: ApolloClient<object>;
}

function UserDetailsWrapper({ client, ...props }: UserWrapperProps) {
  return (
    <TestErrorBoundary>
      <ApolloProvider client={client}>
        <UserDetails {...props} />
      </ApolloProvider>
    </TestErrorBoundary>
  );
}

it('should run through all of the queries that want SSR with suspense', async () => {
  const client = createMockClient();

  await expect(
    getMarkupFromTree({
      renderFunction: renderToString,
      tree: <UserDetailsWrapper client={client} suspend />,
    })
  ).resolves.toMatchInlineSnapshot(`"James"`);
});

it('should run through all of the queries that want SSR without suspense', async () => {
  const client = createMockClient();

  await expect(
    getMarkupFromTree({
      renderFunction: renderToString,
      tree: <UserDetailsWrapper client={client} suspend={false} />,
    })
  ).resolves.toMatchInlineSnapshot(`"James"`);
});

it('should allow network-only fetchPolicy as an option and still render prefetched data with suspense', async () => {
  const client = createMockClient();

  await expect(
    getMarkupFromTree({
      renderFunction: renderToString,
      tree: (
        <UserDetailsWrapper
          client={client}
          suspend
          fetchPolicy="network-only"
        />
      ),
    })
  ).resolves.toMatchInlineSnapshot(`"James"`);
});

it('should allow network-only fetchPolicy as an option and still render prefetched data without suspense', async () => {
  const client = createMockClient();

  await expect(
    getMarkupFromTree({
      renderFunction: renderToString,
      tree: (
        <UserDetailsWrapper
          client={client}
          suspend={false}
          fetchPolicy="network-only"
        />
      ),
    })
  ).resolves.toMatchInlineSnapshot(`"James"`);
});

it('should allow cache-and-network fetchPolicy as an option and still render prefetched data with suspense', async () => {
  const client = createMockClient();

  await expect(
    getMarkupFromTree({
      renderFunction: renderToString,
      tree: (
        <UserDetailsWrapper
          client={client}
          suspend
          fetchPolicy="cache-and-network"
        />
      ),
    })
  ).resolves.toMatchInlineSnapshot(`"James"`);
});

it('should allow cache-and-network fetchPolicy as an option and still render prefetched data without suspense', async () => {
  const client = createMockClient();

  await expect(
    getMarkupFromTree({
      renderFunction: renderToString,
      tree: (
        <UserDetailsWrapper
          client={client}
          suspend={false}
          fetchPolicy="cache-and-network"
        />
      ),
    })
  ).resolves.toMatchInlineSnapshot(`"James"`);
});

it('should pick up queries deep in the render tree with suspense', async () => {
  const client = createMockClient();

  const Container = () => (
    <div>
      <span>Hi</span>
      <div>
        <UserDetailsWrapper
          client={client}
          suspend
          fetchPolicy="cache-and-network"
        />
      </div>
    </div>
  );

  await expect(
    getMarkupFromTree({ renderFunction: renderToString, tree: <Container /> })
  ).resolves.toMatchInlineSnapshot(
    `"<div><span>Hi</span><div>James</div></div>"`
  );
});

it('should pick up queries deep in the render tree without suspense', async () => {
  const client = createMockClient();

  const Container = () => (
    <div>
      <span>Hi</span>
      <div>
        <UserDetailsWrapper
          client={client}
          suspend={false}
          fetchPolicy="cache-and-network"
        />
      </div>
    </div>
  );

  await expect(
    getMarkupFromTree({ renderFunction: renderToString, tree: <Container /> })
  ).resolves.toMatchInlineSnapshot(
    `"<div><span>Hi</span><div>James</div></div>"`
  );
});

it('should handle nested queries that depend on each other with suspense', async () => {
  const client = createMockClient();

  const AuthorizedUser = () => {
    const authorized = useAuthDetails({ suspend: true });

    return (
      <div>
        <div>Authorized: {String(authorized)}</div>

        <UserDetails suspend skip={!authorized} />
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

  await expect(
    getMarkupFromTree({
      renderFunction: renderToString,
      tree: <Container />,
    })
  ).resolves.toMatchInlineSnapshot(
    `"<div><div>Authorized: <!-- -->true</div>James</div>"`
  );
});

it('should handle nested queries that depend on each other without suspense', async () => {
  const client = createMockClient();

  const AuthorizedUser = () => {
    const authorized = useAuthDetails({ suspend: false });

    return (
      <div>
        <div>Authorized: {String(authorized)}</div>

        <UserDetails suspend={false} skip={!authorized} />
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

  await expect(
    getMarkupFromTree({
      renderFunction: renderToString,
      tree: <Container />,
    })
  ).resolves.toMatchInlineSnapshot(
    `"<div><div>Authorized: <!-- -->true</div>James</div>"`
  );
});

it('should return the first of multiple errors thrown by nested wrapped components', async () => {
  const client = createMockClient();

  const fooError = new Error('foo');
  const BorkedComponent = () => {
    throw fooError;
  };

  const Container = (props: QueryHookOptions<{}>) => (
    <div>
      <UserDetailsWrapper {...props} client={client} />
      <BorkedComponent />
      <BorkedComponent />
    </div>
  );

  await expect(
    getMarkupFromTree({
      renderFunction: renderToString,
      tree: <Container suspend />,
    })
  ).rejects.toBe(fooError);

  await expect(
    getMarkupFromTree({
      renderFunction: renderToString,
      tree: <Container suspend={false} />,
    })
  ).rejects.toBe(fooError);
});

it('should handle errors thrown by queries with suspense', async () => {
  const client = createMockClient(linkReturningError);
  const tree = <UserDetailsWrapper client={client} suspend />;

  await expect(
    getMarkupFromTree({ tree, renderFunction: renderToString })
  ).rejects.toMatchInlineSnapshot(
    `[Error: Network error: Simulating network error]`
  );

  expect(renderToString(tree)).toMatchInlineSnapshot(
    `"No Current User (failed)"`
  );
});

it('should handle errors thrown by queries without suspense', async () => {
  const client = createMockClient(linkReturningError);
  const tree = <UserDetailsWrapper client={client} suspend={false} />;

  await expect(
    getMarkupFromTree({ tree, renderFunction: renderToString })
  ).rejects.toMatchInlineSnapshot(
    `[Error: Network error: Simulating network error]`
  );

  expect(renderToString(tree)).toMatchInlineSnapshot(
    `"No Current User (failed)"`
  );
});

it('should handle errors thrown by queries with suspense', async () => {
  const client = createMockClient(linkReturningError);
  const tree = <UserDetailsWrapper client={client} suspend />;

  await expect(
    getMarkupFromTree({ tree, renderFunction: renderToString })
  ).rejects.toMatchInlineSnapshot(
    `[Error: Network error: Simulating network error]`
  );

  expect(renderToString(tree)).toMatchInlineSnapshot(
    `"No Current User (failed)"`
  );
});

it('should correctly skip queries with suspense', async () => {
  const client = createMockClient();

  await expect(
    getMarkupFromTree({
      renderFunction: renderToString,
      tree: <UserDetailsWrapper client={client} skip suspend />,
    })
  ).resolves.toMatchInlineSnapshot(`"No Data (skipped)"`);

  expect(client.cache.extract()).toEqual({});
});

it('should correctly skip queries without suspense', async () => {
  const client = createMockClient();

  await expect(
    getMarkupFromTree({
      renderFunction: renderToString,
      tree: <UserDetailsWrapper client={client} skip suspend={false} />,
    })
  ).resolves.toMatchInlineSnapshot(`"No Data (skipped)"`);

  expect(client.cache.extract()).toEqual({});
});

it('should use the correct default props for a query with suspense', async () => {
  const client = createMockClient();

  await getMarkupFromTree({
    renderFunction: renderToString,
    tree: <UserDetailsWrapper client={client} suspend />,
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

it('should use the correct default props for a query without suspense', async () => {
  const client = createMockClient();

  await getMarkupFromTree({
    renderFunction: renderToString,
    tree: <UserDetailsWrapper client={client} suspend={false} />,
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

it("shouldn't run queries if ssr is turned to off with suspense", async () => {
  const client = createMockClient();

  await expect(
    getMarkupFromTree({
      renderFunction: renderToString,
      tree: <UserDetailsWrapper client={client} ssr={false} suspend />,
    })
  ).resolves.toMatchInlineSnapshot(`"No Data (skipped)"`);

  expect(client.cache.extract()).toEqual({});
});

it("shouldn't run queries if ssr is turned to off without suspense", async () => {
  const client = createMockClient();

  await expect(
    getMarkupFromTree({
      renderFunction: renderToString,
      tree: <UserDetailsWrapper client={client} ssr={false} suspend={false} />,
    })
  ).resolves.toMatchInlineSnapshot(`"No Data (skipped)"`);

  expect(client.cache.extract()).toEqual({});
});

it('should not require `ApolloProvider` to be the root component with suspense', async () => {
  const client = createMockClient();

  const Root = (props: { children: React.ReactNode }) => <div {...props} />;

  return expect(
    getMarkupFromTree({
      renderFunction: renderToString,
      tree: (
        <Root>
          <UserDetailsWrapper client={client} suspend />
        </Root>
      ),
    })
  ).resolves.toMatchInlineSnapshot(`"<div>James</div>"`);
});

it('should not require `ApolloProvider` to be the root component without suspense', async () => {
  const client = createMockClient();

  const Root = (props: { children: React.ReactNode }) => <div {...props} />;

  return expect(
    getMarkupFromTree({
      renderFunction: renderToString,
      tree: (
        <Root>
          <UserDetailsWrapper client={client} suspend={false} />
        </Root>
      ),
    })
  ).resolves.toMatchInlineSnapshot(`"<div>James</div>"`);
});
