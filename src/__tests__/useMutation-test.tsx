import { cleanup, fireEvent, render } from '@testing-library/react';
import gql from 'graphql-tag';
import React from 'react';

import { ApolloProvider, useMutation, useQuery } from '..';
import createClient from '../__testutils__/createClient';
import { SAMPLE_TASKS } from '../__testutils__/data';
import noop from '../__testutils__/noop';
import wait from '../__testutils__/wait';

jest.mock('../internal/actHack');

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
  },

  {
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

const TOGGLE_TASK_MUTATION = gql`
  mutation ToggleTaskMutation($taskId: ID!) {
    toggleTask(taskId: $taskId) {
      id
      completed
    }
  }
`;

const ADD_TASK_MUTATION = gql`
  mutation AddTaskMutation($input: AddTaskMutationInput!) {
    addTask(input: $input) {
      id
      text
      completed
    }
  }
`;

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
    const toggleTask = useMutation(TOGGLE_TASK_MUTATION);

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
    const addTask = useMutation<any, { input: Partial<TaskFragment> }>(
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
