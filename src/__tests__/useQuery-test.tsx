import { ApolloLink, DocumentNode, Observable } from 'apollo-link';
import gql from 'graphql-tag';
import React, { ReactElement, Suspense } from 'react';
import { cleanup, flushEffects, render } from 'react-testing-library';

import { ApolloProvider, QueryHookOptions, useQuery } from '..';
import createClient from '../__testutils__/createClient';
import { SAMPLE_TASKS } from '../__testutils__/data';
import { noop } from '../__testutils__/noop';
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
        __typename: 'Query',
        tasks: [...SAMPLE_TASKS],
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
        __typename: 'Query',
        tasks: SAMPLE_TASKS.filter(task => task.completed),
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
        __typename: 'Query',
        tasks: SAMPLE_TASKS.filter(task => !task.completed),
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

function TaskList({ tasks }: { tasks: Array<{ id: number; text: string }> }) {
  return (
    <ul data-testid="task-list">
      {tasks.map(task => (
        <li key={task.id}>{task.text}</li>
      ))}
    </ul>
  );
}

function TasksLoader({
  query,
  ...restOptions
}: { query: DocumentNode } & QueryHookOptions<any>) {
  const { data, error } = useQuery(query, restOptions);
  if (error) {
    throw error;
  }

  return <TaskList tasks={data.tasks} />;
}

function TasksLoaderWithoutSuspense({
  query,
  ...restOptions
}: { query: DocumentNode } & QueryHookOptions<any>): ReactElement<object> {
  const { data, error, errors, loading } = useQuery(query, {
    ...restOptions,
    suspend: false,
  });

  if (error) {
    throw error;
  }
  if (errors) {
    throw new Error('Errors');
  }
  if (loading) {
    return <>Loading without suspense</>;
  }
  return <TaskList tasks={data.tasks} />;
}

afterEach(cleanup);

it('should return the query data', async () => {
  const client = createClient({ mocks: TASKS_MOCKS });
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
  expect(container.querySelector('li')!.textContent).toBe('Learn GraphQL');
});

it('should work with suspense disabled', async () => {
  const client = createClient({ mocks: TASKS_MOCKS });
  const { container } = render(
    <ApolloProvider client={client}>
      <TasksLoaderWithoutSuspense query={TASKS_QUERY} />
    </ApolloProvider>
  );
  expect(container.textContent).toBe('Loading without suspense');

  flushEffects();
  await waitForNextTick();

  expect(container.querySelectorAll('li')).toHaveLength(3);
  expect(container.querySelector('li')!.textContent).toBe('Learn GraphQL');
});

it('should support query variables', async () => {
  const client = createClient({ mocks: TASKS_MOCKS });
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
  expect(container.querySelector('li')!.textContent).toBe('Learn GraphQL');
});

it('should support updating query variables', async () => {
  const client = createClient({ mocks: TASKS_MOCKS });
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
  expect(container.querySelector('li')!.textContent).toBe('Learn React');
});

it("shouldn't suspend if the data is already cached", async () => {
  const client = createClient({ mocks: TASKS_MOCKS });
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
  expect(container.querySelector('li')!.textContent).toBe('Learn GraphQL');
});

it("shouldn't allow a query with non-standard fetch policy with suspense", async () => {
  const client = createClient({ mocks: TASKS_MOCKS });
  const consoleErrorMock = jest
    .spyOn(console, 'error')
    .mockImplementation(noop);

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

  consoleErrorMock.mockRestore();
});

it('should forward apollo errors', async () => {
  class ErrorBoundary extends React.Component<{}, { error: null | Error }> {
    static getDerivedStateFromError(error: Error) {
      return { error };
    }
    constructor(props: {}) {
      super(props);

      this.state = { error: null };
    }

    render() {
      if (this.state.error) {
        return <p>Error occured: {this.state.error.message}</p>;
      }

      return this.props.children;
    }
  }

  const consoleErrorMock = jest
    .spyOn(console, 'error')
    .mockImplementation(noop);

  const linkReturningError = new ApolloLink(() => {
    return new Observable(observer => {
      observer.error(new Error('Simulating network error'));
    });
  });
  const client = createClient({ link: linkReturningError });

  const { container } = render(
    <ErrorBoundary>
      <ApolloProvider client={client}>
        <Suspense fallback={<div>Loading</div>}>
          <TasksLoader query={TASKS_QUERY} />
        </Suspense>
      </ApolloProvider>
    </ErrorBoundary>
  );
  expect(container.textContent).toBe('Loading');
  flushEffects();
  await waitForNextTick();
  expect(container.textContent).toBe(
    'Error occured: Network error: Simulating network error'
  );

  consoleErrorMock.mockRestore();
});

it('should ignore apollo errors by default in non-suspense mode', async () => {
  const consoleErrorMock = jest
    .spyOn(console, 'error')
    .mockImplementation(noop);

  const linkReturningError = new ApolloLink(() => {
    return new Observable(observer => {
      observer.error(new Error('Simulating network error'));
    });
  });
  const client = createClient({ link: linkReturningError });
  const { container } = render(
    <ApolloProvider client={client}>
      <TasksLoaderWithoutSuspense query={TASKS_QUERY} />
    </ApolloProvider>
  );
  expect(container.textContent).toBe('Loading without suspense');
  flushEffects();
  await waitForNextTick();

  expect(consoleErrorMock).toHaveBeenCalledTimes(1);
  expect(consoleErrorMock.mock.calls[0][1]).toBe(
    'Network error: Simulating network error'
  );
  consoleErrorMock.mockRestore();
});

it('shouldn allow a query with non-standard fetch policy without suspense', async () => {
  const client = createClient({ mocks: TASKS_MOCKS });
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
