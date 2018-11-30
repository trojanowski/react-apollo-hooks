import gql from 'graphql-tag';
import React, { Suspense } from 'react';
import {
  cleanup,
  flushEffects,
  render,
} from 'react-testing-library';

import { ApolloProvider, useQuery } from '..';
import createClient from '../__testutils__/createClient';
import { SAMPLE_TASKS } from '../__testutils__/data';
import waitForNextTick from '../__testutils__/waitForNextTick';

const TASKS_MOCKS = [
  {
    request: {
      query: gql`
        query TasksQuery {
          tasks {
            id
            text
            completed
            __typename
          }
        }
      `,
      variables: {},
    },
    result: {
      data: {
        tasks: [...SAMPLE_TASKS],
        __typename: 'Query',
      },
    },
  },

  {
    request: {
      query: gql`
        query FilteredTasksQuery($completed: Boolean!) {
          tasks(completed: $completed) {
            id
            text
            completed
            __typename
          }
        }
      `,
      variables: {
        completed: true,
      },
    },
    result: {
      data: {
        tasks: SAMPLE_TASKS.filter(task => task.completed),
        __typename: 'Query',
      },
    },
  },

  {
    request: {
      query: gql`
        query FilteredTasksQuery($completed: Boolean!) {
          tasks(completed: $completed) {
            id
            text
            completed
            __typename
          }
        }
      `,
      variables: {
        completed: false,
      },
    },
    result: {
      data: {
        tasks: SAMPLE_TASKS.filter(task => !task.completed),
        __typename: 'Query',
      },
    },
  },
];

const TASKS_QUERY = gql`
  query TasksQuery {
    tasks {
      id
      text
      completed
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

function TaskList({ tasks }) {
  return (
    <ul data-testid="task-list">
      {tasks.map(task => (
        <li key={task.id}>{task.text}</li>
      ))}
    </ul>
  );
}

function TasksLoader({ query, ...restOptions }) {
  const { data, error } = useQuery(query, restOptions);
  if (error) {
    throw error;
  }

  return <TaskList tasks={data.tasks} />;
}

function TasksLoaderWithoutSuspense({ query, ...restOptions }) {
  const { data, error, loading } = useQuery(query, {
    ...restOptions,
    suspend: false,
  });
  if (error) {
    throw error;
  }
  if (loading) {
    return 'Loading without suspense';
  }
  return <TaskList tasks={data.tasks} />;
}

afterEach(cleanup);

it('should return the query data', async () => {
  const client = createClient(TASKS_MOCKS);
  const { container } = render(
    <ApolloProvider client={client}>
      <Suspense fallback={<div>Loading</div>}>
        <TasksLoader query={TASKS_QUERY} />
      </Suspense>
    </ApolloProvider>
  );
  expect(container.textContent).toBe('Loading');

  flushEffects();
  await waitForNextTick();

  expect(container.querySelectorAll('li')).toHaveLength(3);
  expect(container.querySelector('li').textContent).toBe('Learn GraphQL');
});

it('should work with suspense disabled', async () => {
  const client = createClient(TASKS_MOCKS);
  const { container } = render(
    <ApolloProvider client={client}>
      <TasksLoaderWithoutSuspense query={TASKS_QUERY} />
    </ApolloProvider>
  );
  expect(container.textContent).toBe('Loading without suspense');

  flushEffects();
  await waitForNextTick();

  expect(container.querySelectorAll('li')).toHaveLength(3);
  expect(container.querySelector('li').textContent).toBe('Learn GraphQL');
});

it('should support query variables', async () => {
  const client = createClient(TASKS_MOCKS);
  const { container } = render(
    <ApolloProvider client={client}>
      <Suspense fallback={<div>Loading</div>}>
        <TasksLoader
          query={FILTERED_TASKS_QUERY}
          variables={{ completed: true }}
        />
      </Suspense>
    </ApolloProvider>
  );

  flushEffects();
  await waitForNextTick();

  expect(container.querySelectorAll('li')).toHaveLength(1);
  expect(container.querySelector('li').textContent).toBe('Learn GraphQL');
});

it('should support updating query variables', async () => {
  const client = createClient(TASKS_MOCKS);
  const { container, getByTestId, queryByTestId, rerender } = render(
    <ApolloProvider client={client}>
      <Suspense fallback={<div data-testid="loading">Loading</div>}>
        <TasksLoader
          query={FILTERED_TASKS_QUERY}
          variables={{ completed: true }}
        />
      </Suspense>
    </ApolloProvider>
  );

  flushEffects();
  await waitForNextTick();

  rerender(
    <ApolloProvider client={client}>
      <Suspense fallback={<div data-testid="loading">Loading</div>}>
        <TasksLoader
          query={FILTERED_TASKS_QUERY}
          variables={{ completed: false }}
        />
      </Suspense>
    </ApolloProvider>
  );

  expect(getByTestId('loading')).toBeVisible();
  expect(getByTestId('task-list')).not.toBeVisible();

  // TODO: It doesn't pass if not invoked twice
  flushEffects();
  await waitForNextTick();
  flushEffects();
  await waitForNextTick();

  expect(queryByTestId('loading')).toBeNull();
  expect(getByTestId('task-list')).toBeVisible();
  expect(container.querySelectorAll('li')).toHaveLength(2);
  expect(container.querySelector('li').textContent).toBe('Learn React');
});

it("shouldn't suspend if the data is already cached", async () => {
  const client = createClient(TASKS_MOCKS);
  const { container, getByTestId, queryByTestId, rerender } = render(
    <ApolloProvider client={client}>
      <Suspense fallback={<div>Loading</div>}>
        <TasksLoader
          query={FILTERED_TASKS_QUERY}
          variables={{ completed: true }}
        />
      </Suspense>
    </ApolloProvider>
  );

  flushEffects();
  await waitForNextTick();

  rerender(
    <ApolloProvider client={client}>
      <Suspense fallback={<div data-testid="loading">Loading</div>}>
        <TasksLoader
          query={FILTERED_TASKS_QUERY}
          variables={{ completed: false }}
        />
      </Suspense>
    </ApolloProvider>
  );

  // TODO: It doesn't pass if not invoked twice
  flushEffects();
  await waitForNextTick();
  flushEffects();
  await waitForNextTick();

  rerender(
    <ApolloProvider client={client}>
      <Suspense fallback={<div data-testid="loading">Loading</div>}>
        <TasksLoader
          query={FILTERED_TASKS_QUERY}
          variables={{ completed: true }}
        />
      </Suspense>
    </ApolloProvider>
  );

  expect(queryByTestId('loading')).toBeNull();
  expect(getByTestId('task-list')).toBeVisible();
  expect(container.querySelectorAll('li')).toHaveLength(1);
  expect(container.querySelector('li').textContent).toBe('Learn GraphQL');
});

it("shouldn't allow a query with non-standard fetch policy with suspense", async () => {
  const client = createClient(TASKS_MOCKS);
  /* eslint-disable no-console */
  const origConsoleError = console.error;
  console.error = jest.fn();
  expect(() => {
    render(
      <ApolloProvider client={client}>
        <Suspense fallback={<div>Loading</div>}>
          <TasksLoader fetchPolicy="cache-and-network" query={TASKS_QUERY} />
        </Suspense>
      </ApolloProvider>
    );
  }).toThrowError(
    "Fetch policy cache-and-network is not supported without 'suspend: false'"
  );
  console.error = origConsoleError;
  /* eslint-enable no-console */
});

it('shouldn allow a query with non-standard fetch policy without suspense', async () => {
  const client = createClient(TASKS_MOCKS);
  const { container } = render(
    <ApolloProvider client={client}>
      <TasksLoaderWithoutSuspense
        fetchPolicy="cache-and-network"
        query={TASKS_QUERY}
      />
    </ApolloProvider>
  );

  expect(container.textContent).toBe('Loading without suspense');

  flushEffects();
  await waitForNextTick();

  expect(container.querySelectorAll('li')).toHaveLength(3);
});
