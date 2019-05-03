import { ApolloClient } from 'apollo-client';
import { DocumentNode } from 'apollo-link';
import { MockedResponse } from 'apollo-link-mock';
import gql from 'graphql-tag';
import React from 'react';
import { cleanup, render } from 'react-testing-library';

import { GraphQLError } from 'graphql';
import { ApolloProvider, useQueryLoader } from '..';
import createClient from '../__testutils__/createClient';
import { SAMPLE_TASKS } from '../__testutils__/data';
import wait from '../__testutils__/wait';

jest.mock('../internal/actHack');

const TASKS_QUERY = gql`
  query TasksQuery {
    tasks {
      id
      text
      completed
    }
  }
`;

const GRAPQHL_ERROR_QUERY = gql`
  query GrapqhlErrorQuery {
    tasks {
      guid
    }
  }
`;

const TASKS_MOCKS: MockedResponse[] = [
  {
    request: { query: TASKS_QUERY, variables: {} },
    result: {
      data: { __typename: 'Query', tasks: [...SAMPLE_TASKS] },
    },
  },
  {
    request: { query: GRAPQHL_ERROR_QUERY, variables: {} },
    result: {
      data: { __typename: 'Query' },
      errors: [new GraphQLError('Simulating GraphQL error')],
    },
  },
];

function createMockClient() {
  return createClient({ mocks: TASKS_MOCKS });
}

function Loader() {
  return <>Loading</>;
}

function ErrorMessage({ errorObject }: { errorObject: Error }) {
  return (
    <>
      <h3>Error</h3>
      {errorObject.message}
    </>
  );
}

interface TasksProps {
  query: DocumentNode;
}

function Tasks({ query }: TasksProps) {
  return useQueryLoader(query)(({ data }) => {
    const { tasks }: { tasks: Array<{ id: number; text: string }> } = data;
    return (
      <ul>
        {tasks.map(task => (
          <li key={task.id}>{task.text}</li>
        ))}
      </ul>
    );
  });
}

interface TasksWrapperProps extends TasksProps {
  client: ApolloClient<object>;
}

function TasksWrapper({ client, ...props }: TasksWrapperProps) {
  return (
    <ApolloProvider
      client={client}
      defaultLoadingComponent={Loader}
      defaultErrorComponent={ErrorMessage}
    >
      <Tasks {...props} />
    </ApolloProvider>
  );
}

describe('useQueryLoader', () => {
  afterEach(cleanup);

  it('should return results of successful queries', async () => {
    const client = createMockClient();
    const { container } = render(
      <TasksWrapper client={client} query={TASKS_QUERY} />
    );

    expect(container).toMatchInlineSnapshot(`
<div>
  Loading
</div>
`);

    await wait();

    expect(container).toMatchInlineSnapshot(`
<div>
  <ul>
    <li>
      Learn GraphQL
    </li>
    <li>
      Learn React
    </li>
    <li>
      Learn Apollo
    </li>
  </ul>
</div>
`);
  });

  it('should use the provided defaultErrorComponent', async () => {
    const client = createMockClient();
    const { container } = render(
      <TasksWrapper client={client} query={GRAPQHL_ERROR_QUERY} />
    );

    expect(container).toMatchInlineSnapshot(`
<div>
  Loading
</div>
`);

    await wait();

    expect(container).toMatchInlineSnapshot(`
<div>
  <h3>
    Error
  </h3>
  GraphQL error: Simulating GraphQL error
</div>
`);
  });
});
