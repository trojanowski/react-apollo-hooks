import { ApolloClient } from 'apollo-client';
import { DocumentNode } from 'apollo-link';
import { MockedResponse } from 'apollo-link-mock';
import gql from 'graphql-tag';
import { withProfiler } from 'jest-react-profiler';
import React, { Suspense, SuspenseProps } from 'react';
import { cleanup, render } from 'react-testing-library';

import { GraphQLError } from 'graphql';
import { ApolloProvider, QueryHookOptions, useQuery } from '..';
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
    return <>Loading without suspense</>;
  }

  if (!data) {
    return <>Skipped loading of data</>;
  }

  return <TaskList tasks={data.tasks} />;
}

interface TasksWrapperProps extends TasksProps {
  client?: ApolloClient<object>;
  TasksComponent?: React.FC<any>;
}

const SuspenseCompat = ({ children }: SuspenseProps) => <>{children}</>;

function TasksWrapper({
  client,
  TasksComponent = Tasks,
  ...props
}: TasksWrapperProps) {
  const SuspenseComponent = props.suspend !== false ? Suspense : SuspenseCompat;

  const inner = (
    <SuspenseComponent fallback={<>Loading with suspense</>}>
      <TasksComponent {...props} />
    </SuspenseComponent>
  );

  if (client) {
    return <ApolloProvider client={client}>{inner}</ApolloProvider>;
  }

  return inner;
}

afterEach(cleanup);

it('should return the query data', async () => {
  const client = createMockClient();
  const { container } = render(
    <TasksWrapper client={client} query={TASKS_QUERY} />
  );

  expect(container).toMatchInlineSnapshot(`
<div>
  Loading without suspense
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

it('should accept a client option', async () => {
  const client = createMockClient();
  const { container } = render(
    <TasksWrapper query={TASKS_QUERY} client={client} />
  );

  expect(container).toMatchInlineSnapshot(`
<div>
  Loading without suspense
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

it('should work with suspense enabled', async () => {
  const client = createMockClient();
  const { container } = render(
    <TasksWrapper client={client} query={TASKS_QUERY} suspend />
  );

  expect(container).toMatchInlineSnapshot(`
<div>
  Loading with suspense
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

it.each([false, true])(
  'should support query variables with with "suspend: %s"',
  async suspend => {
    const client = createMockClient();
    const { container } = render(
      <TasksWrapper
        client={client}
        query={FILTERED_TASKS_QUERY}
        suspend={suspend}
        variables={{ completed: true }}
      />
    );

    if (suspend) {
      expect(container).toMatchInlineSnapshot(`
<div>
  Loading with suspense
</div>
`);
    } else {
      expect(container).toMatchInlineSnapshot(`
<div>
  Loading without suspense
</div>
`);
    }

    await wait();

    expect(container).toMatchInlineSnapshot(`
<div>
  <ul>
    <li>
      Learn GraphQL
    </li>
  </ul>
</div>
`);
  }
);

it('should support updating query variables without suspense', async () => {
  const client = createMockClient();
  const { container, rerender } = render(
    <TasksWrapper
      client={client}
      query={FILTERED_TASKS_QUERY}
      variables={{ completed: true }}
    />
  );

  expect(container).toMatchInlineSnapshot(`
<div>
  Loading without suspense
</div>
`);

  await wait();

  expect(container).toMatchInlineSnapshot(`
<div>
  <ul>
    <li>
      Learn GraphQL
    </li>
  </ul>
</div>
`);

  rerender(
    <TasksWrapper
      client={client}
      query={FILTERED_TASKS_QUERY}
      variables={{ completed: false }}
    />
  );

  expect(container).toMatchInlineSnapshot(`
<div>
  Loading without suspense
</div>
`);

  await wait();

  expect(container).toMatchInlineSnapshot(`
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
`);

  rerender(
    <TasksWrapper
      client={client}
      query={FILTERED_TASKS_QUERY}
      variables={{ completed: true }}
    />
  );

  expect(container).toMatchInlineSnapshot(`
<div>
  <ul>
    <li>
      Learn GraphQL
    </li>
  </ul>
</div>
`);
});

it('should support updating query variables with suspense', async () => {
  const client = createMockClient();
  const { container, rerender } = render(
    <TasksWrapper
      client={client}
      query={FILTERED_TASKS_QUERY}
      suspend
      variables={{ completed: true }}
    />
  );

  expect(container).toMatchInlineSnapshot(`
<div>
  Loading with suspense
</div>
`);

  await wait();

  expect(container).toMatchInlineSnapshot(`
<div>
  <ul>
    <li>
      Learn GraphQL
    </li>
  </ul>
</div>
`);

  rerender(
    <TasksWrapper
      client={client}
      query={FILTERED_TASKS_QUERY}
      suspend
      variables={{ completed: false }}
    />
  );

  expect(container).toMatchInlineSnapshot(`
<div>
  <ul
    style="display: none;"
  >
    <li>
      Learn GraphQL
    </li>
  </ul>
  Loading with suspense
</div>
`);

  await wait();

  expect(container).toMatchInlineSnapshot(`
<div>
  <ul
    style=""
  >
    <li>
      Learn React
    </li>
    <li>
      Learn Apollo
    </li>
  </ul>
</div>
`);

  rerender(
    <TasksWrapper
      client={client}
      query={FILTERED_TASKS_QUERY}
      variables={{ completed: true }}
    />
  );

  expect(container).toMatchInlineSnapshot(`
<div>
  <ul
    style=""
  >
    <li>
      Learn GraphQL
    </li>
  </ul>
</div>
`);
});

it('should refetch the query', async () => {
  const MY_TASKS_MOCKS: MockedResponse[] = [
    {
      request: { query: TASKS_QUERY, variables: {} },
      result: {
        data: { __typename: 'Query' },
        errors: [new GraphQLError('Simulating GraphQL error')],
      },
    },
    {
      request: { query: TASKS_QUERY, variables: {} },
      result: {
        data: { __typename: 'Query', tasks: [...SAMPLE_TASKS] },
      },
    },
  ];

  const client = createClient({ mocks: MY_TASKS_MOCKS });

  function MyTasks({ query, ...options }: TasksProps) {
    const { data, error, loading, refetch } = useQuery(query, {
      ...options,
    });
    const refetched = React.useRef(false);

    React.useEffect(
      () => {
        if (!loading && !refetched.current) {
          refetched.current = true;
          refetch();
        }
      },
      [loading]
    );

    if (error) {
      return <>{error.message}</>;
    }

    if (loading) {
      return <>Loading without suspense</>;
    }

    if (!data) {
      return <>Skipped loading of data</>;
    }

    return <TaskList tasks={data.tasks} />;
  }

  const { container } = render(
    <TasksWrapper
      client={client}
      query={TASKS_QUERY}
      TasksComponent={MyTasks}
    />
  );

  expect(container).toMatchInlineSnapshot(`
<div>
  Loading without suspense
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

it("shouldn't suspend if the data is already cached", async () => {
  const client = createMockClient();
  const { container, rerender } = render(
    <TasksWrapper
      client={client}
      query={FILTERED_TASKS_QUERY}
      suspend
      variables={{ completed: true }}
    />
  );

  await wait();

  rerender(
    <TasksWrapper
      client={client}
      query={FILTERED_TASKS_QUERY}
      suspend
      variables={{ completed: false }}
    />
  );

  await wait();

  rerender(
    <TasksWrapper
      client={client}
      query={FILTERED_TASKS_QUERY}
      variables={{ completed: true }}
    />
  );

  expect(container).toMatchInlineSnapshot(`
<div>
  <ul
    style=""
  >
    <li>
      Learn GraphQL
    </li>
  </ul>
</div>
`);
});

it("shouldn't allow a query with non-standard fetch policy with suspense", async () => {
  const client = createMockClient();
  const consoleErrorMock = jest
    .spyOn(console, 'error')
    .mockImplementation(noop);

  expect(() =>
    render(
      <TasksWrapper
        client={client}
        query={TASKS_QUERY}
        suspend
        fetchPolicy="cache-and-network"
      />
    )
  ).toThrowErrorMatchingInlineSnapshot(
    `"Fetch policy cache-and-network is not supported without 'suspend: false'"`
  );

  expect(consoleErrorMock).toBeCalled();

  consoleErrorMock.mockRestore();
});

it('should allow a query with non-standard fetch policy without suspense', async () => {
  const client = createMockClient();
  const { container } = render(
    <TasksWrapper
      client={client}
      suspend={false}
      query={TASKS_QUERY}
      fetchPolicy="cache-and-network"
    />
  );

  expect(container).toMatchInlineSnapshot(`
<div>
  Loading without suspense
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

it("shouldn't make obsolete renders in suspense mode", async () => {
  const client = createMockClient();
  const TasksWrapperWithProfiler = withProfiler(TasksWrapper);

  const { container, rerender } = render(
    <TasksWrapperWithProfiler
      client={client}
      query={FILTERED_TASKS_QUERY}
      suspend
      variables={{ completed: true }}
    />
  );

  expect(container).toMatchInlineSnapshot(`
<div>
  Loading with suspense
</div>
`);

  expect(TasksWrapperWithProfiler).toHaveCommittedTimes(1);

  await wait();

  expect(container).toMatchInlineSnapshot(`
<div>
  <ul>
    <li>
      Learn GraphQL
    </li>
  </ul>
</div>
`);

  // TODO: Find out why.
  expect(TasksWrapperWithProfiler).toHaveCommittedTimes(2);

  rerender(
    <TasksWrapperWithProfiler
      client={client}
      query={FILTERED_TASKS_QUERY}
      suspend
      variables={{ completed: false }}
    />
  );

  expect(container).toMatchInlineSnapshot(`
<div>
  <ul
    style="display: none;"
  >
    <li>
      Learn GraphQL
    </li>
  </ul>
  Loading with suspense
</div>
`);

  await wait();

  expect(container).toMatchInlineSnapshot(`
<div>
  <ul
    style=""
  >
    <li>
      Learn React
    </li>
    <li>
      Learn Apollo
    </li>
  </ul>
</div>
`);

  expect(TasksWrapperWithProfiler).toHaveCommittedTimes(
    3 // TODO: Figure out why.
  );

  rerender(
    <TasksWrapperWithProfiler
      client={client}
      query={FILTERED_TASKS_QUERY}
      suspend
      variables={{ completed: true }}
    />
  );

  expect(TasksWrapperWithProfiler).toHaveCommittedTimes(1);

  expect(container).toMatchInlineSnapshot(`
<div>
  <ul
    style=""
  >
    <li>
      Learn GraphQL
    </li>
  </ul>
</div>
`);

  await wait();

  expect(TasksWrapperWithProfiler).toHaveCommittedTimes(1);
});

it('skips query in suspense mode', async () => {
  const client = createMockClient();
  const { container } = render(
    <TasksWrapper client={client} skip query={TASKS_QUERY} />
  );

  expect(container).toMatchInlineSnapshot(`
<div>
  Skipped loading of data
</div>
`);

  await wait();

  expect(container).toMatchInlineSnapshot(`
<div>
  Skipped loading of data
</div>
`);
});

it('skips query in non-suspense mode', async () => {
  const client = createMockClient();
  const { container } = render(
    <TasksWrapper client={client} skip suspend={false} query={TASKS_QUERY} />
  );

  expect(container).toMatchInlineSnapshot(`
<div>
  Skipped loading of data
</div>
`);

  await wait();

  expect(container).toMatchInlineSnapshot(`
<div>
  Skipped loading of data
</div>
`);
});

it('starts skipped query in suspense mode', async () => {
  const client = createMockClient();
  const { rerender, container } = render(
    <TasksWrapper client={client} query={TASKS_QUERY} skip suspend />
  );

  expect(container).toMatchInlineSnapshot(`
<div>
  Skipped loading of data
</div>
`);

  await wait();

  expect(container).toMatchInlineSnapshot(`
<div>
  Skipped loading of data
</div>
`);

  rerender(
    <TasksWrapper client={client} query={TASKS_QUERY} skip={false} suspend />
  );

  expect(container).toMatchInlineSnapshot(`
<div>
  
  Loading with suspense
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

it('starts skipped query in non-suspense mode', async () => {
  const client = createMockClient();
  const { rerender, container } = render(
    <TasksWrapper client={client} query={TASKS_QUERY} skip suspend={false} />
  );

  expect(container).toMatchInlineSnapshot(`
<div>
  Skipped loading of data
</div>
`);

  await wait();

  expect(container).toMatchInlineSnapshot(`
<div>
  Skipped loading of data
</div>
`);

  rerender(
    <TasksWrapper
      client={client}
      skip={false}
      suspend={false}
      query={TASKS_QUERY}
    />
  );

  expect(container).toMatchInlineSnapshot(`
<div>
  Loading without suspense
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

it('handles network error in suspense mode', async () => {
  const client = createMockClient();
  const { container } = render(
    <TasksWrapper suspend client={client} query={NETWORK_ERROR_QUERY} />
  );

  expect(container).toMatchInlineSnapshot(`
<div>
  Loading with suspense
</div>
`);

  await wait();

  expect(container).toMatchInlineSnapshot(`
<div>
  Network error: Simulating network error
</div>
`);
});

it('handles network error in non-suspense mode', async () => {
  const client = createMockClient();
  const { container } = render(
    <TasksWrapper suspend={false} client={client} query={NETWORK_ERROR_QUERY} />
  );

  expect(container).toMatchInlineSnapshot(`
<div>
  Loading without suspense
</div>
`);
  await wait();

  expect(container).toMatchInlineSnapshot(`
<div>
  Network error: Simulating network error
</div>
`);
});

it('handles GraphQL error in suspense mode', async () => {
  const client = createMockClient();
  const { container } = render(
    <TasksWrapper suspend client={client} query={GRAPQHL_ERROR_QUERY} />
  );

  expect(container).toMatchInlineSnapshot(`
<div>
  Loading with suspense
</div>
`);

  await wait();

  expect(container).toMatchInlineSnapshot(`
<div>
  GraphQL error: Simulating GraphQL error
</div>
`);
});

it('handles GraphQL error in non-suspense mode', async () => {
  const client = createMockClient();
  const { container } = render(
    <TasksWrapper suspend={false} client={client} query={GRAPQHL_ERROR_QUERY} />
  );

  expect(container).toMatchInlineSnapshot(`
<div>
  Loading without suspense
</div>
`);

  await wait();

  expect(container).toMatchInlineSnapshot(`
<div>
  GraphQL error: Simulating GraphQL error
</div>
`);
});
