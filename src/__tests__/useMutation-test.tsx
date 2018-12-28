import gql from 'graphql-tag';
import React, { Suspense } from 'react';
import {
  cleanup,
  fireEvent,
  flushEffects,
  render,
} from 'react-testing-library';

import { ApolloProvider } from '../ApolloContext';
import createClient from '../__testutils__/createClient';
import { SAMPLE_TASKS } from '../__testutils__/data';
import noop from '../__testutils__/noop';
import waitForNextTick from '../__testutils__/waitForNextTick';
import { useMutation } from '../useMutation';
import { useQuery } from '../useQuery';

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
    const { data, error } = useQuery(TASKS_QUERY);
    const toggleTask = useMutation(TOGGLE_TASK_MUTATION);

    if (error) {
      throw error;
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
      <Suspense fallback={<div>Loading</div>}>
        <TasksWithMutation />
      </Suspense>
    </ApolloProvider>
  );

  // TODO: It doesn't pass if not invoked twice
  flushEffects();
  await waitForNextTick();
  flushEffects();
  await waitForNextTick();

  const firstCheckbox = container.querySelector<HTMLInputElement>(
    'input:checked'
  )!;
  expect(firstCheckbox.checked).toBeTruthy();

  fireEvent.click(firstCheckbox);
  await waitForNextTick();
  flushEffects();

  expect(container.querySelector('input')!.checked).toBeFalsy();
});

it('should allow to pass options forwarded to the mutation', async () => {
  function TasksWithMutation() {
    const { data, error } = useQuery(TASKS_QUERY);
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
      <Suspense fallback={<div>Loading</div>}>
        <TasksWithMutation />
      </Suspense>
    </ApolloProvider>
  );

  // TODO: It doesn't pass if not invoked twice
  flushEffects();
  await waitForNextTick();
  flushEffects();
  await waitForNextTick();

  const addTaskButton = getByTestId('add-task-button');
  fireEvent.click(addTaskButton);
  await waitForNextTick();
  flushEffects();

  expect(container.querySelectorAll('li')).toHaveLength(4);
  expect(container.querySelectorAll('li')[3].textContent).toBe('Learn Jest');
});
