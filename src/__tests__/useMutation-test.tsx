import gql from 'graphql-tag';
import mockConsole from 'jest-mock-console';
import React from 'react';
import {
  act,
  cleanup,
  fireEvent,
  render,
  testHook,
} from 'react-testing-library';

import { GraphQLError } from 'graphql';
import { ApolloProvider, useMutation, useQuery } from '..';
import { ApolloOperationError, isMutationError } from '../ApolloOperationError';
import { SillyErrorBoundary } from '../SillyErrorBoundary';
import createClient from '../__testutils__/createClient';
import { SAMPLE_TASKS } from '../__testutils__/data';
import noop from '../__testutils__/noop';
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

const TASKS_QUERY_MOCK = {
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
};

const TOGGLE_TASK_MUTATION = gql`
  mutation ToggleTaskMutation($taskId: ID!) {
    toggleTask(taskId: $taskId) {
      id
      completed
    }
  }
`;

const TOGGLE_TASK_MUTATION_MOCK = {
  request: {
    query: gql`
      mutation ToggleTaskMutation($taskId: ID!) {
        toggleTask(taskId: $taskId) {
          id
          completed
          __typename
        }
      }
    `,
    variables: { taskId: '1' },
  },
  result: {
    data: {
      __typename: 'Mutation',
      toggleTask: {
        __typename: 'Task',
        completed: false,
        id: '1',
      },
    },
  },
};

const ADD_TASK_MUTATION = gql`
  mutation AddTaskMutation($input: AddTaskMutationInput!) {
    addTask(input: $input) {
      id
      text
      completed
    }
  }
`;

const ADD_TASK_MUTATION_MOCK = {
  request: {
    query: gql`
      mutation AddTaskMutation($input: AddTaskMutationInput!) {
        addTask(input: $input) {
          id
          text
          completed
          __typename
        }
      }
    `,
    variables: { input: { text: 'Learn Jest' } },
  },
  result: {
    data: {
      __typename: 'Mutation',
      addTask: {
        __typename: 'Task',
        completed: false,
        id: '4',
        text: 'Learn Jest',
      },
    },
  },
};

const TASKS_MOCKS = [
  TASKS_QUERY_MOCK,
  TOGGLE_TASK_MUTATION_MOCK,
  ADD_TASK_MUTATION_MOCK,
];

interface TaskFragment {
  id: number;
  text: string;
  completed: boolean;
}

function Task({
  onChange,
  task,
}: {
  task: TaskFragment;
  onChange: (task: TaskFragment) => void;
}) {
  return (
    <li>
      <input
        checked={task.completed}
        onChange={() => onChange(task)}
        type="checkbox"
      />
      {task.text}
    </li>
  );
}

function TaskList({
  onChange,
  tasks,
}: {
  tasks: TaskFragment[];
  onChange: (task: TaskFragment) => void;
}) {
  return (
    <ul>
      {tasks.map(task => (
        <Task key={task.id} onChange={onChange} task={task} />
      ))}
    </ul>
  );
}

afterEach(cleanup);

it('should create a function to perform mutations', async () => {
  function TasksWithMutation() {
    const { data, error, loading } = useQuery(TASKS_QUERY);
    const [toggleTask] = useMutation(TOGGLE_TASK_MUTATION);

    if (error) {
      throw error;
    }

    if (loading) {
      return <>Loading</>;
    }

    return (
      <TaskList
        onChange={task => toggleTask({ variables: { taskId: task.id } })}
        tasks={data.tasks}
      />
    );
  }

  const client = createClient({ mocks: TASKS_MOCKS });
  const { container } = render(
    <ApolloProvider client={client}>
      <TasksWithMutation />
    </ApolloProvider>
  );

  await wait();

  const firstCheckbox = container.querySelector<HTMLInputElement>(
    'input:checked'
  )!;
  expect(firstCheckbox.checked).toBeTruthy();

  fireEvent.click(firstCheckbox);
  await wait();

  expect(container.querySelector('input')!.checked).toBeFalsy();
});

it('should allow to pass options forwarded to the mutation', async () => {
  function TasksWithMutation() {
    const { data, error, loading } = useQuery(TASKS_QUERY);
    const [addTask] = useMutation<any, { input: Partial<TaskFragment> }>(
      ADD_TASK_MUTATION,
      {
        update: (proxy, mutationResult) => {
          const previousData = proxy.readQuery<{ tasks: TaskFragment[] }>({
            query: TASKS_QUERY,
          });
          previousData!.tasks.push(mutationResult!.data!.addTask);
          proxy.writeQuery({ data: previousData, query: TASKS_QUERY });
        },
        variables: {
          input: {
            text: 'Learn Jest',
          },
        },
      }
    );

    if (error) {
      throw error;
    }

    if (loading) {
      return <>Loading</>;
    }

    return (
      <>
        <TaskList onChange={noop} tasks={data.tasks} />
        <button data-testid="add-task-button" onClick={() => addTask()}>
          Add new task
        </button>
      </>
    );
  }

  const client = createClient({ mocks: TASKS_MOCKS });
  const { container, getByTestId } = render(
    <ApolloProvider client={client}>
      <TasksWithMutation />
    </ApolloProvider>
  );

  await wait();

  const addTaskButton = getByTestId('add-task-button');
  fireEvent.click(addTaskButton);
  await wait();

  expect(container.querySelectorAll('li')).toHaveLength(4);
  expect(container.querySelectorAll('li')[3].textContent).toBe('Learn Jest');
});

it('should provide called property for the first time call', async () => {
  const client = createClient({ mocks: TASKS_MOCKS });

  const { result } = testHook(
    () =>
      useMutation<any, { input: Partial<TaskFragment> }>(ADD_TASK_MUTATION, {
        variables: {
          input: {
            text: 'Learn Jest',
          },
        },
      }),
    {
      wrapper: ({ children }) => (
        <ApolloProvider client={client}>{children}</ApolloProvider>
      ),
    }
  );

  const [addTask, initialState] = result.current;
  expect(initialState.called).toBe(false);

  act(() => {
    addTask();
  });

  const [, calledState] = result.current;
  expect(calledState.called).toBe(true);

  await wait();

  const [, loadedState] = result.current;
  expect(loadedState.called).toBe(true);
});

it('should provide loading property during the mutation processing', async () => {
  const client = createClient({ mocks: TASKS_MOCKS });

  const { result } = testHook(
    () =>
      useMutation<any, { input: Partial<TaskFragment> }>(ADD_TASK_MUTATION, {
        variables: {
          input: {
            text: 'Learn Jest',
          },
        },
      }),
    {
      wrapper: ({ children }) => (
        <ApolloProvider client={client}>{children}</ApolloProvider>
      ),
    }
  );

  const [addTask, initialState] = result.current;
  expect(initialState.loading).toBe(false);

  act(() => {
    addTask();
  });

  const [, calledState] = result.current;
  expect(calledState.loading).toBe(true);

  await wait();

  const [, loadedState] = result.current;
  expect(loadedState.loading).toBe(false);
});

it('should provide error and hasError properties for network error', async () => {
  const mocks = [
    { ...ADD_TASK_MUTATION_MOCK, error: new Error('Network has failed') },
  ];
  const client = createClient({ mocks });

  const { result } = testHook(
    () =>
      useMutation<any, { input: Partial<TaskFragment> }>(ADD_TASK_MUTATION, {
        rethrow: false,
        variables: {
          input: {
            text: 'Learn Jest',
          },
        },
      }),
    {
      wrapper: ({ children }) => (
        <ApolloProvider client={client}>{children}</ApolloProvider>
      ),
    }
  );

  const [addTask, initialState] = result.current;
  expect(initialState.error).toBe(undefined);
  expect(initialState.hasError).toBe(false);

  act(() => {
    addTask();
  });

  await wait();

  const [, calledState] = result.current;
  expect(calledState.hasError).toBe(true);
  expect(isMutationError(calledState.error!)).toBe(true);
  expect((calledState.error! as ApolloOperationError).operationDoc).toBe(
    ADD_TASK_MUTATION
  );
  expect(calledState.error!.message).toMatchInlineSnapshot(
    `"Network error: Network has failed"`
  );

  await wait();

  const [, laterState] = result.current;
  expect(laterState.hasError).toBe(true);
});

it('should provide error and hasError properties for graphql errors', async () => {
  const mocks = [
    {
      ...ADD_TASK_MUTATION_MOCK,
      result: {
        errors: [
          { message: 'I am the error' },
          { message: 'I am another error' },
        ] as GraphQLError[],
        ...ADD_TASK_MUTATION_MOCK.result,
      },
    },
  ];
  const client = createClient({ mocks });

  const { result } = testHook(
    () =>
      useMutation<any, { input: Partial<TaskFragment> }>(ADD_TASK_MUTATION, {
        rethrow: false,
        variables: {
          input: {
            text: 'Learn Jest',
          },
        },
      }),
    {
      wrapper: ({ children }) => (
        <ApolloProvider client={client}>{children}</ApolloProvider>
      ),
    }
  );

  const [addTask, initialState] = result.current;
  expect(initialState.error).toBe(undefined);
  expect(initialState.hasError).toBe(false);

  act(() => {
    addTask();
  });

  await wait();

  const [, calledState] = result.current;
  expect(calledState.hasError).toBe(true);
  expect(isMutationError(calledState.error!)).toBe(true);
  expect((calledState.error! as ApolloOperationError).operationDoc).toBe(
    ADD_TASK_MUTATION
  );
  expect(calledState.error!.graphQLErrors).toMatchInlineSnapshot(`
Array [
  Object {
    "message": "I am the error",
  },
  Object {
    "message": "I am another error",
  },
]
`);

  await wait();

  const [, laterState] = result.current;
  expect(laterState.hasError).toBe(true);
});

it('should not throw error with rethrow = false', async () => {
  const mocks = [
    { ...ADD_TASK_MUTATION_MOCK, error: new Error('Network has failed') },
  ];
  const client = createClient({ mocks });

  const onError = jest.fn();

  const { result } = testHook(
    () =>
      useMutation<any, { input: Partial<TaskFragment> }>(ADD_TASK_MUTATION, {
        rethrow: false,
        variables: {
          input: {
            text: 'Learn Jest',
          },
        },
      }),
    {
      wrapper: ({ children }) => (
        <ApolloProvider client={client}>
          <SillyErrorBoundary onError={onError}>{children}</SillyErrorBoundary>
        </ApolloProvider>
      ),
    }
  );

  const [addTask] = result.current;

  let caughtError;
  try {
    addTask();
  } catch (err) {
    caughtError = err;
  }

  await wait();

  expect(caughtError).toBeFalsy();
  expect(onError).toHaveBeenCalledTimes(0);
});

it('should throw error asynchronously with rethrow = true', async () => {
  const mocks = [ADD_TASK_MUTATION_MOCK];
  const client = createClient({ mocks });

  const onError = jest.fn();

  const { result } = testHook(
    () =>
      useMutation<any, { input: Partial<TaskFragment> }>(ADD_TASK_MUTATION, {
        variables: {
          input: {
            text: 'I am the error',
          },
        },
      }),
    {
      wrapper: ({ children }) => (
        <ApolloProvider client={client}>
          <SillyErrorBoundary onError={onError}>{children}</SillyErrorBoundary>
        </ApolloProvider>
      ),
    }
  );

  const [addTask] = result.current;

  let caughtError;
  try {
    await addTask();
  } catch (err) {
    caughtError = err;
  }

  expect(caughtError).toBeTruthy();
  expect(onError).toHaveBeenCalledTimes(0);
});
