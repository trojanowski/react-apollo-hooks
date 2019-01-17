import ApolloClient from 'apollo-client';
import { DocumentNode } from 'apollo-link';
import { MockedResponse } from 'apollo-link-mock';
import gql from 'graphql-tag';
import * as React from 'react';
import { renderToString } from 'react-dom/server';

import { GraphQLError } from 'graphql';
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

const GRAPQHL_ERROR_QUERY = gql`
  query GrapqhlErrorQuery {
    authorized
  }
`;

const NETWORK_ERROR_QUERY = gql`
  query NetworkErrorQuery {
    isAuthorized
  }
`;

const MOCKS: MockedResponse[] = [
  {
    request: { query: AUTH_QUERY },
    result: { data: { isAuthorized: true } },
  },

  {
    request: { query: USER_QUERY },
    result: { data: { currentUser: { firstName: 'James' } } },
  },

  {
    request: { query: GRAPQHL_ERROR_QUERY, variables: {} },
    result: {
      data: { __typename: 'Query' },
      errors: [new GraphQLError('Simulating GraphQL error')],
    },
  },

  {
    error: new Error('Simulating network error'),
    request: { query: NETWORK_ERROR_QUERY, variables: {} },
  },
];

function createMockClient() {
  return createClient({ mocks: MOCKS, addTypename: false });
}

function useAuthDetails(options?: QueryHookOptions<{}>) {
  const { data, loading } = useQuery<AuthQueryResult>(AUTH_QUERY, options);

  return Boolean(!loading && data && data.isAuthorized);
}

interface UserDetailsProps extends QueryHookOptions<{}> {
  readonly query?: DocumentNode;
}

function UserDetails({ query = USER_QUERY, ...props }: UserDetailsProps) {
  const { data, loading } = useQuery<UserQueryResult>(query, props);

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

interface UserWrapperProps extends UserDetailsProps {
  readonly client: ApolloClient<object>;
}

function UserDetailsWrapper({ client, ...props }: UserWrapperProps) {
  return (
    <ApolloProvider client={client}>
      <UserDetails {...props} />
    </ApolloProvider>
  );
}

describe.each([[true], [false]])(
  'getMarkupFromTree with "suspend: %s"',
  suspend => {
    it('should run through all of the queries that want SSR', async () => {
      const client = createMockClient();

      await expect(
        getMarkupFromTree({
          renderFunction: renderToString,
          tree: <UserDetailsWrapper client={client} suspend={suspend} />,
        })
      ).resolves.toMatchInlineSnapshot(`"James"`);
    });

    it('should allow network-only fetchPolicy as an option and still render prefetched data', async () => {
      const client = createMockClient();

      await expect(
        getMarkupFromTree({
          renderFunction: renderToString,
          tree: (
            <UserDetailsWrapper
              client={client}
              suspend={suspend}
              fetchPolicy="network-only"
            />
          ),
        })
      ).resolves.toMatchInlineSnapshot(`"James"`);
    });

    it('should allow cache-and-network fetchPolicy as an option and still render prefetched data', async () => {
      const client = createMockClient();

      await expect(
        getMarkupFromTree({
          renderFunction: renderToString,
          tree: (
            <UserDetailsWrapper
              client={client}
              suspend={suspend}
              fetchPolicy="cache-and-network"
            />
          ),
        })
      ).resolves.toMatchInlineSnapshot(`"James"`);
    });

    it('should pick up queries deep in the render tree', async () => {
      const client = createMockClient();

      const Container = () => (
        <div>
          <span>Hi</span>
          <div>
            <UserDetailsWrapper
              client={client}
              suspend={suspend}
              fetchPolicy="cache-and-network"
            />
          </div>
        </div>
      );

      await expect(
        getMarkupFromTree({
          renderFunction: renderToString,
          tree: <Container />,
        })
      ).resolves.toMatchInlineSnapshot(
        `"<div><span>Hi</span><div>James</div></div>"`
      );
    });

    it('should handle nested queries that depend on each other', async () => {
      const client = createMockClient();

      const AuthorizedUser = () => {
        const authorized = useAuthDetails({ suspend });

        return (
          <div>
            <div>Authorized: {String(authorized)}</div>

            <UserDetails suspend={suspend} skip={!authorized} />
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
          tree: <Container suspend={suspend} />,
        })
      ).rejects.toBe(fooError);
    });

    it('should handle network errors thrown by queries', async () => {
      const client = createMockClient();
      const tree = (
        <UserDetailsWrapper
          client={client}
          suspend={suspend}
          query={NETWORK_ERROR_QUERY}
        />
      );

      await expect(
        getMarkupFromTree({ tree, renderFunction: renderToString })
      ).rejects.toMatchInlineSnapshot(
        `[Error: Network error: Simulating network error]`
      );

      expect(renderToString(tree)).toMatchInlineSnapshot(
        `"No Current User (failed)"`
      );
    });

    it('should handle GraphQL errors thrown by queries', async () => {
      const client = createMockClient();
      const tree = (
        <UserDetailsWrapper
          client={client}
          suspend={suspend}
          query={GRAPQHL_ERROR_QUERY}
        />
      );

      await expect(
        getMarkupFromTree({ tree, renderFunction: renderToString })
      ).rejects.toMatchInlineSnapshot(
        `[Error: GraphQL error: Simulating GraphQL error]`
      );

      expect(renderToString(tree)).toMatchInlineSnapshot(
        `"No Current User (failed)"`
      );
    });

    it('should correctly skip queries', async () => {
      const client = createMockClient();

      await expect(
        getMarkupFromTree({
          renderFunction: renderToString,
          tree: <UserDetailsWrapper client={client} skip suspend={suspend} />,
        })
      ).resolves.toMatchInlineSnapshot(`"No Data (skipped)"`);

      expect(client.cache.extract()).toEqual({});
    });

    it('should use the correct default props for a query', async () => {
      const client = createMockClient();

      await getMarkupFromTree({
        renderFunction: renderToString,
        tree: <UserDetailsWrapper client={client} suspend={suspend} />,
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
          tree: (
            <UserDetailsWrapper client={client} ssr={false} suspend={suspend} />
          ),
        })
      ).resolves.toMatchInlineSnapshot(`"No Data (skipped)"`);

      expect(client.cache.extract()).toEqual({});
    });

    it('should not require `ApolloProvider` to be the root component', async () => {
      const client = createMockClient();

      const Root = (props: { children: React.ReactNode }) => <div {...props} />;

      return expect(
        getMarkupFromTree({
          renderFunction: renderToString,
          tree: (
            <Root>
              <UserDetailsWrapper client={client} suspend={suspend} />
            </Root>
          ),
        })
      ).resolves.toMatchInlineSnapshot(`"<div>James</div>"`);
    });
  }
);
