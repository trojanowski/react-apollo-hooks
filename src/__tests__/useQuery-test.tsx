import { DocumentNode, ApolloLink, Observable } from 'apollo-link';
import gql from 'graphql-tag';
import React, { Suspense, useRef } from 'react';
import { cleanup, flushEffects, render } from 'react-testing-library';

import { ApolloProvider } from '../ApolloContext';
import createClient from '../__testutils__/createClient';
import { SAMPLE_TASKS } from '../__testutils__/data';
import waitForNextTick from '../__testutils__/waitForNextTick';
import { useQuery, QueryHookOptions } from '../useQuery';
import { withProfiler } from 'jest-react-profiler';

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

function flushAndWait() {
  flushEffects();

  return waitForNextTick();
}

const linkReturningError = new ApolloLink(
  () =>
    new Observable(observer => {
      observer.error(new Error('Simulating network error'));
    })
);

class ErrorBoundary extends React.Component<{}, { error: null | Error }> {
  constructor(props: {}) {
    super(props);

    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <div data-testid="error-boundary">{this.state.error.message}</div>;
    }

    return this.props.children;
  }
}

interface TasksProps<TVariables = any> extends QueryHookOptions<TVariables> {
  query: DocumentNode;
}

function TaskList({ tasks }: { tasks: Array<{ id: number; text: string }> }) {
  return (
    <ul data-testid="task-list">
      {tasks.map(task => (
        <li key={task.id} data-testid="task-list-item">
          {task.text}
        </li>
      ))}
    </ul>
  );
}

function Tasks({ query, ...options }: TasksProps) {
  const { data, error, errors, loading } = useQuery(query, options);

  if (error) {
    return <div data-testid="error">{error.message}</div>;
  }

  if (errors) {
    return (
      <div data-testid="errors">
        {errors.map(x => (
          <div key={x.message} data-testid="errors-item">
            {x.message}
          </div>
        ))}
      </div>
    );
  }

  if (loading) {
    return (
      <div data-testid="loading-without-suspense">Loading without suspense</div>
    );
  }

  if (!data) {
    return <div data-testid="skipped-loading">Skipped loading of data</div>;
  }

  return <TaskList tasks={data.tasks} />;
}

interface TasksWrapperProps extends TasksProps {
  link?: ApolloLink;
}

function TasksWrapper({ link, ...props }: TasksWrapperProps) {
  const client = useRef(createClient({ link, mocks: TASKS_MOCKS }));

  return (
    <ErrorBoundary>
      <ApolloProvider client={client.current}>
        <Suspense fallback={<div data-testid="loading">Loading</div>}>
          <Tasks {...props} />
        </Suspense>
      </ApolloProvider>
    </ErrorBoundary>
  );
}

afterEach(cleanup);

it('should return the query data', async () => {
  const { queryByTestId, queryAllByTestId } = render(
    <TasksWrapper query={TASKS_QUERY} />
  );

  expect(queryByTestId('loading')).toBeVisible();

  await flushAndWait();

  expect(queryByTestId('task-list')).toBeVisible();
  expect(queryAllByTestId('task-list-item')).toHaveLength(3);
});

it('should work with suspense disabled', async () => {
  const { queryByTestId, queryAllByTestId } = render(
    <TasksWrapper suspend={false} query={TASKS_QUERY} />
  );

  expect(queryByTestId('loading-without-suspense')).toBeVisible();

  await flushAndWait();

  expect(queryByTestId('task-list')).toBeVisible();
  expect(queryAllByTestId('task-list-item')).toHaveLength(3);
});

it('should support query variables', async () => {
  const { queryByTestId, queryAllByTestId } = render(
    <TasksWrapper
      query={FILTERED_TASKS_QUERY}
      variables={{ completed: true }}
    />
  );

  expect(queryByTestId('loading')).toBeVisible();

  await flushAndWait();

  expect(queryByTestId('task-list')).toBeVisible();
  expect(queryAllByTestId('task-list-item')).toHaveLength(1);
});

it('should support updating query variables', async () => {
  const { rerender, queryByTestId, queryAllByTestId } = render(
    <TasksWrapper
      query={FILTERED_TASKS_QUERY}
      variables={{ completed: true }}
    />
  );

  expect(queryByTestId('loading')).toBeVisible();

  await flushAndWait();

  expect(queryByTestId('task-list')).toBeVisible();
  expect(queryAllByTestId('task-list-item')).toHaveLength(1);

  rerender(
    <TasksWrapper
      query={FILTERED_TASKS_QUERY}
      variables={{ completed: false }}
    />
  );

  expect(queryByTestId('loading')).toBeVisible();

  await flushAndWait();

  expect(queryByTestId('task-list')).toBeVisible();
  expect(queryAllByTestId('task-list-item')).toHaveLength(2);

  rerender(
    <TasksWrapper
      query={FILTERED_TASKS_QUERY}
      variables={{ completed: true }}
    />
  );

  expect(queryByTestId('task-list')).toBeVisible();
  expect(queryAllByTestId('task-list-item')).toHaveLength(1);
});

it("shouldn't suspend if the data is already cached", async () => {
  const { rerender, queryByTestId, queryAllByTestId } = render(
    <TasksWrapper
      query={FILTERED_TASKS_QUERY}
      variables={{ completed: true }}
    />
  );

  await flushAndWait();

  rerender(
    <TasksWrapper
      query={FILTERED_TASKS_QUERY}
      variables={{ completed: false }}
    />
  );

  await flushAndWait();

  rerender(
    <TasksWrapper
      query={FILTERED_TASKS_QUERY}
      variables={{ completed: true }}
    />
  );

  expect(queryByTestId('task-list')).toBeVisible();
  expect(queryAllByTestId('task-list-item')).toHaveLength(1);
});

it("shouldn't allow a query with non-standard fetch policy with suspense", async () => {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

  const { getByTestId } = render(
    <TasksWrapper query={TASKS_QUERY} fetchPolicy="cache-and-network" />
  );

  expect(spy).toBeCalledTimes(1);
  expect(spy.mock.calls[0][1]).toEqual(
    new Error(
      "Fetch policy cache-and-network is not supported without 'suspend: false'"
    )
  );

  expect(getByTestId('error-boundary')).toHaveTextContent(
    "Fetch policy cache-and-network is not supported without 'suspend: false'"
  );

  spy.mockRestore();
});

it('should forward apollo errors', async () => {
  const { getByTestId } = render(
    <TasksWrapper query={TASKS_QUERY} link={linkReturningError} />
  );

  expect(getByTestId('loading')).toBeVisible();

  await flushAndWait();

  expect(getByTestId('error')).toHaveTextContent(
    'Network error: Simulating network error'
  );
});

it('should ignore apollo errors by default in non-suspense mode', async () => {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

  const { getByTestId } = render(
    <TasksWrapper
      suspend={false}
      query={TASKS_QUERY}
      link={linkReturningError}
    />
  );

  expect(getByTestId('loading-without-suspense')).toBeVisible();

  await flushAndWait();

  expect(getByTestId('error')).toHaveTextContent(
    'Network error: Simulating network error'
  );

  expect(spy).toBeCalledTimes(0);

  spy.mockRestore();
});

it('should allow a query with non-standard fetch policy without suspense', async () => {
  const { getByTestId, getAllByTestId } = render(
    <TasksWrapper suspend={false} query={TASKS_QUERY} />
  );

  expect(getByTestId('loading-without-suspense')).toBeVisible();

  await flushAndWait();

  expect(getByTestId('task-list')).toBeVisible();
  expect(getAllByTestId('task-list-item')).toHaveLength(3);
});

it('skips query in suspense mode', async () => {
  const { getByTestId } = render(
    <TasksWrapper skip={true} query={TASKS_QUERY} />
  );

  expect(getByTestId('skipped-loading')).toBeVisible();

  await flushAndWait();

  expect(getByTestId('skipped-loading')).toBeVisible();
});

it('skips query in non-suspense mode', async () => {
  const { getByTestId } = render(
    <TasksWrapper skip={true} suspend={false} query={TASKS_QUERY} />
  );

  expect(getByTestId('skipped-loading')).toBeVisible();

  await flushAndWait();

  expect(getByTestId('skipped-loading')).toBeVisible();
});

it('starts skipped query in suspense mode', async () => {
  const { rerender, getByTestId, getAllByTestId } = render(
    <TasksWrapper skip={true} query={TASKS_QUERY} />
  );

  expect(getByTestId('skipped-loading')).toBeVisible();

  await flushAndWait();

  expect(getByTestId('skipped-loading')).toBeVisible();

  rerender(<TasksWrapper skip={false} query={TASKS_QUERY} />);

  expect(getByTestId('loading')).toBeVisible();

  await flushAndWait();

  expect(getByTestId('task-list')).toBeVisible();
  expect(getAllByTestId('task-list-item')).toHaveLength(3);
});

it('starts skipped query in non-suspense mode', async () => {
  const { rerender, getByTestId, getAllByTestId } = render(
    <TasksWrapper skip={true} suspend={false} query={TASKS_QUERY} />
  );

  expect(getByTestId('skipped-loading')).toBeVisible();

  await flushAndWait();

  expect(getByTestId('skipped-loading')).toBeVisible();

  rerender(<TasksWrapper skip={false} suspend={false} query={TASKS_QUERY} />);

  expect(getByTestId('loading-without-suspense')).toBeVisible();

  await flushAndWait();

  expect(getByTestId('task-list')).toBeVisible();
  expect(getAllByTestId('task-list-item')).toHaveLength(3);
});

it('not makes obsolete renders in suspense mode', async () => {
  const TasksWrapperWithProfiler = withProfiler(TasksWrapper);

  const { rerender, getByTestId, getAllByTestId } = render(
    <TasksWrapperWithProfiler
      query={FILTERED_TASKS_QUERY}
      variables={{ completed: true }}
    />
  );

  expect(getByTestId('loading')).toBeVisible();

  expect(TasksWrapperWithProfiler).toHaveCommittedTimes(1);

  await flushAndWait();

  expect(getByTestId('task-list')).toBeVisible();
  expect(getAllByTestId('task-list-item')).toHaveLength(1);

  expect(TasksWrapperWithProfiler).toHaveCommittedTimes(1);

  rerender(
    <TasksWrapperWithProfiler
      query={FILTERED_TASKS_QUERY}
      variables={{ completed: false }}
    />
  );

  expect(getByTestId('loading')).toBeVisible();
  expect(TasksWrapperWithProfiler).toHaveCommittedTimes(1);

  await flushAndWait();

  expect(getByTestId('task-list')).toBeVisible();
  expect(getAllByTestId('task-list-item')).toHaveLength(2);

  expect(TasksWrapperWithProfiler).toHaveCommittedTimes(
    2 // TODO: Figure out why.
  );

  rerender(
    <TasksWrapperWithProfiler
      query={FILTERED_TASKS_QUERY}
      variables={{ completed: true }}
    />
  );

  expect(TasksWrapperWithProfiler).toHaveCommittedTimes(1);

  expect(getByTestId('task-list')).toBeVisible();
  expect(getAllByTestId('task-list-item')).toHaveLength(1);

  await flushAndWait();

  expect(TasksWrapperWithProfiler).toHaveCommittedTimes(1);
});
