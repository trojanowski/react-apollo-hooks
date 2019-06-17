import { cleanup, render } from '@testing-library/react';
import { ApolloClient } from 'apollo-client';
import { DocumentNode } from 'apollo-link';
import { MockedResponse } from 'apollo-link-mock';
import { GraphQLError } from 'graphql';
import gql from 'graphql-tag';
import React from 'react';
import { ApolloProvider, QueryHookOptions, useQuery } from '..';
import createClient from '../__testutils__/createClient';
import { SAMPLE_TASKS } from '../__testutils__/data';

jest.mock('../internal/actHack');

function wait(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

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

const NETWORK_ERROR_QUERY = gql`
  query NetworkErrorQuery {
    tasks {
      id
    }
  }
`;

const FILTERED_TASKS_QUERY = gql`
  query FilteredTasksQuery($completed: Boolean!) {
    tasks(completed: $completed) {
      id
      text
      completed
    }
  }
`;

const LOADING_SNAPSHOT = `
<div>
  Loading
</div>
`;

const TASKS_SNAPSHOT = `
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
`;

const FILTERED_COMPLETED_SNAPSHOT = `
<div>
  <ul>
    <li>
      Learn GraphQL
    </li>
  </ul>
</div>
`;

const FILTERED_INCOMPLETE_SNAPSHOT = `
<div>
  <ul>
    <li>
      Learn React
    </li>
    <li>
      Learn Apollo
    </li>
  </ul>
</div>
`;

const SKIPPED_DATA_SNAPSHOT = `
<div>
  Skipped loading of data
</div>
`;

const GRAPHQL_ERROR_SNAPSHOT = `
<div>
  GraphQL error: Simulating GraphQL error
</div>
`;

const NETWORK_ERROR_SNAPSHOT = `
<div>
  Network error: Simulating network error
</div>
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

  {
    error: new Error('Simulating network error'),
    request: { query: NETWORK_ERROR_QUERY, variables: {} },
  },

  {
    request: { query: FILTERED_TASKS_QUERY, variables: { completed: true } },
    result: {
      data: {
        __typename: 'Query',
        tasks: SAMPLE_TASKS.filter(task => task.completed),
      },
    },
  },

  {
    request: { query: FILTERED_TASKS_QUERY, variables: { completed: false } },
    result: {
      data: {
        __typename: 'Query',
        tasks: SAMPLE_TASKS.filter(task => !task.completed),
      },
    },
  },
];

function createMockClient() {
  return createClient({ mocks: TASKS_MOCKS });
}

interface TasksProps<TVariables = any> extends QueryHookOptions<TVariables> {
  query: DocumentNode;
}

function TaskList({ tasks }: { tasks: Array<{ id: number; text: string }> }) {
  return (
    <ul>
      {tasks.map(task => (
        <li key={task.id}>{task.text}</li>
      ))}
    </ul>
  );
}

function Tasks({ query, ...options }: TasksProps) {
  const { data, error, loading } = useQuery(query, options);

  if (error) {
    return <>{error.message}</>;
  }

  if (loading) {
    return <>Loading</>;
  }

  if (!data) {
    return <>Skipped loading of data</>;
  }

  return <TaskList tasks={data.tasks} />;
}

interface TasksWrapperProps extends TasksProps {
  client: ApolloClient<object>;
}

function TasksWrapper({ client, ...props }: TasksWrapperProps) {
  return (
    <ApolloProvider client={client}>
      <Tasks {...props} />
    </ApolloProvider>
  );
}

afterEach(cleanup);

it('should run useQuery hook in absence of ApolloProvider', async () => {
  const { container } = render(
    <Tasks query={TASKS_QUERY} client={createMockClient()} />
  );

  expect(container).toMatchInlineSnapshot(LOADING_SNAPSHOT);

  await wait();

  expect(container).toMatchInlineSnapshot(TASKS_SNAPSHOT);
});

it('should return the query data', async () => {
  const client = createMockClient();
  const { container } = render(
    <TasksWrapper client={client} query={TASKS_QUERY} />
  );

  expect(container).toMatchInlineSnapshot(LOADING_SNAPSHOT);

  await wait();

  expect(container).toMatchInlineSnapshot(TASKS_SNAPSHOT);
});

it('should support updating query variables', async () => {
  const client = createMockClient();
  const { container, rerender } = render(
    <TasksWrapper
      client={client}
      query={FILTERED_TASKS_QUERY}
      variables={{ completed: true }}
    />
  );

  expect(container).toMatchInlineSnapshot(LOADING_SNAPSHOT);

  await wait();

  expect(container).toMatchInlineSnapshot(FILTERED_COMPLETED_SNAPSHOT);

  rerender(
    <TasksWrapper
      client={client}
      query={FILTERED_TASKS_QUERY}
      variables={{ completed: false }}
    />
  );

  expect(container).toMatchInlineSnapshot(LOADING_SNAPSHOT);

  await wait();

  expect(container).toMatchInlineSnapshot(FILTERED_INCOMPLETE_SNAPSHOT);

  rerender(
    <TasksWrapper
      client={client}
      query={FILTERED_TASKS_QUERY}
      variables={{ completed: true }}
    />
  );

  expect(container).toMatchInlineSnapshot(FILTERED_COMPLETED_SNAPSHOT);
});

it('should allow a query with non-standard fetch policy', async () => {
  const client = createMockClient();
  const { container } = render(
    <TasksWrapper
      client={client}
      query={TASKS_QUERY}
      fetchPolicy="cache-and-network"
    />
  );

  expect(container).toMatchInlineSnapshot(LOADING_SNAPSHOT);

  await wait();

  expect(container).toMatchInlineSnapshot(TASKS_SNAPSHOT);
});

it('skips query', async () => {
  const client = createMockClient();
  const { container } = render(
    <TasksWrapper client={client} skip query={TASKS_QUERY} />
  );

  expect(container).toMatchInlineSnapshot(SKIPPED_DATA_SNAPSHOT);

  await wait();

  expect(container).toMatchInlineSnapshot(SKIPPED_DATA_SNAPSHOT);
});

it('handles network error', async () => {
  const client = createMockClient();
  const { container } = render(
    <TasksWrapper client={client} query={NETWORK_ERROR_QUERY} />
  );

  expect(container).toMatchInlineSnapshot(LOADING_SNAPSHOT);

  await wait();

  expect(container).toMatchInlineSnapshot(NETWORK_ERROR_SNAPSHOT);
});

it('handles GraphQL error', async () => {
  const client = createMockClient();
  const { container } = render(
    <TasksWrapper client={client} query={GRAPQHL_ERROR_QUERY} />
  );

  expect(container).toMatchInlineSnapshot(LOADING_SNAPSHOT);

  await wait();

  expect(container).toMatchInlineSnapshot(GRAPHQL_ERROR_SNAPSHOT);
});
