import gql from 'graphql-tag';
import React, { Suspense } from 'react';
import {
  cleanup,
  fireEvent,
  flushEffects,
  render,
} from 'react-testing-library';

import { ApolloProvider, useMutation, useQuery } from '..';
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
        toggleTask: {
          id: '1',
          completed: false,
          __typename: 'Task',
        },
        __typename: 'Mutation',
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
        addTask: {
          id: '4',
          completed: false,
          text: 'Learn Jest',
          __typename: 'Task',
        },
        __typename: 'Mutation',
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

function Task({ onChange, task }) {
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

function TaskList({ onChange, tasks }) {
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

  const client = createClient(TASKS_MOCKS);
  const { container } = render(
    <ApolloProvider client={client}>
      <Suspense fallback={<div>Loading</div>}>
        <TasksWithMutation query={TASKS_QUERY} />
      </Suspense>
    </ApolloProvider>
  );

  // TODO: It doesn't pass if not invoked twice
  flushEffects();
  await waitForNextTick();
  flushEffects();
  await waitForNextTick();

  const firstCheckbox = container.querySelector('input:checked');
  expect(firstCheckbox.checked).toBeTruthy();

  fireEvent.click(firstCheckbox);
  await waitForNextTick();
  flushEffects();

  expect(container.querySelector('input').checked).toBeFalsy();
});

it('should allow to pass options forwarded to the mutation', async () => {
  function TasksWithMutation() {
    const { data, error } = useQuery(TASKS_QUERY);
    const addTask = useMutation(ADD_TASK_MUTATION, {
      update: (proxy, mutationResult) => {
        const previousData = proxy.readQuery({ query: TASKS_QUERY });
        previousData.tasks.push(mutationResult.data.addTask);
        proxy.writeQuery({ data: previousData, query: TASKS_QUERY });
      },
      variables: {
        input: {
          text: 'Learn Jest',
        },
      },
    });
    const onChange = () => {};

    if (error) {
      throw error;
    }

    return (
      <>
        <TaskList onChange={onChange} tasks={data.tasks} />
        <button data-testid="add-task-button" onClick={addTask}>
          Add new task
        </button>
      </>
    );
  }

  const client = createClient(TASKS_MOCKS);
  const { container, getByTestId } = render(
    <ApolloProvider client={client}>
      <Suspense fallback={<div>Loading</div>}>
        <TasksWithMutation query={TASKS_QUERY} />
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
