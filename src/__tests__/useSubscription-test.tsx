import { ApolloClient } from 'apollo-client';
import { Operation } from 'apollo-link';
import { MockSubscriptionLink } from 'apollo-link-mock';
import gql from 'graphql-tag';
import React from 'react';
import { cleanup, render } from 'react-testing-library';

import { ApolloProvider, useSubscription } from '..';
import createClient from '../__testutils__/createClient';
import { SAMPLE_TASKS } from '../__testutils__/data';
import wait from '../__testutils__/wait';

jest.mock('../internal/actHack');

const TASKS_SUBSCRIPTION = gql`
  subscription NewTasks {
    task {
      id
      text
      completed
    }
  }
`;

const FILTERED_TASKS_SUBSCRIPTION = gql`
  subscription FilteredNewTasks($completed: Boolean!) {
    task(completed: $completed) {
      id
      text
      completed
    }
  }
`;

const results = SAMPLE_TASKS.map(task => ({
  result: { data: { task } },
}));

const complitedResults = SAMPLE_TASKS.filter(task => task.completed).map(
  task => ({
    result: { data: { task } },
  })
);

const uncomplitedResults = SAMPLE_TASKS.filter(task => !task.completed).map(
  task => ({
    result: { data: { task } },
  })
);

afterEach(cleanup);

it('should return the subscription data', async () => {
  const link = new MockSubscriptionLink();
  const client = createClient({ link });

  let count = 0;

  const Component = () => {
    const { data, loading, error } = useSubscription(TASKS_SUBSCRIPTION);
    if (count === 0) {
      expect(loading).toBe(true);
      expect(error).toBeUndefined();
      expect(data).toBeUndefined();
    } else if (count === 1) {
      expect(loading).toBe(false);
      expect(error).toBeUndefined();
      expect(data).toEqual(results[0].result.data);
    } else if (count === 2) {
      expect(loading).toBe(false);
      expect(error).toBeUndefined();
      expect(data).toEqual(results[1].result.data);
    } else if (count === 3) {
      expect(loading).toBe(false);
      expect(error).toBeUndefined();
      expect(data).toEqual(results[2].result.data);
    }
    count++;
    return null;
  };

  render(
    <ApolloProvider client={client}>
      <Component />
    </ApolloProvider>
  );

  for (let i = 0; i < 3; i++) {
    link.simulateResult(results[i]);
    await wait();
  }

  expect(count).toBe(4);
});

it('should return the subscription error', async () => {
  const link = new MockSubscriptionLink();
  const client = createClient({ link });

  const subscriptionError = {
    error: new Error('error occurred'),
  };

  let count = 0;

  const Component = () => {
    const { data, loading, error } = useSubscription(TASKS_SUBSCRIPTION);
    if (count === 0) {
      expect(loading).toBe(true);
      expect(error).toBeUndefined();
      expect(data).toBeUndefined();
    } else if (count === 1) {
      expect(loading).toBe(false);
      expect(error).toEqual(new Error('error occurred'));
      expect(data).toBeUndefined();
    }
    count++;
    return null;
  };

  render(
    <ApolloProvider client={client}>
      <Component />
    </ApolloProvider>
  );

  link.simulateResult(subscriptionError);
  await wait();

  expect(count).toBe(2);
});

it('should call provided onSubscriptionData', async () => {
  const link = new MockSubscriptionLink();
  const client = createClient({ link });

  let count = 0;

  const Component = () => {
    useSubscription(TASKS_SUBSCRIPTION, {
      onSubscriptionData: opts => {
        const { loading, data, error } = opts.subscriptionData;
        expect(opts.client).toBeInstanceOf(ApolloClient);
        expect(data).toEqual(results[count].result.data);
        expect(loading).toBe(false);
        expect(error).toBeUndefined();
        count++;
      },
    });
    return null;
  };

  render(
    <ApolloProvider client={client}>
      <Component />
    </ApolloProvider>
  );

  for (let i = 0; i < 3; i++) {
    link.simulateResult(results[i]);
    await wait();
  }

  expect(count).toBe(3);
});

it('should execute subscription with provided variables', async () => {
  const variables = { completed: true };

  class MockSubscriptionLinkOverride extends MockSubscriptionLink {
    request(req: Operation) {
      expect(req.variables).toEqual(variables);
      return super.request(req);
    }
  }

  const link = new MockSubscriptionLinkOverride();

  const client = createClient({ link });

  let count = 0;

  const Component = () => {
    const { data, loading, error } = useSubscription(
      FILTERED_TASKS_SUBSCRIPTION,
      { variables }
    );
    if (count === 0) {
      expect(loading).toBe(true);
      expect(error).toBeUndefined();
      expect(data).toBeUndefined();
    } else if (count === 1) {
      expect(loading).toBe(false);
      expect(error).toBeUndefined();
      expect(data).toEqual(complitedResults[0].result.data);
    }
    count++;
    return null;
  };

  render(
    <ApolloProvider client={client}>
      <Component />
    </ApolloProvider>
  );

  link.simulateResult(complitedResults[0]);
  await wait();

  expect(count).toBe(2);
});

it('should not re-subscription if variables have not changed', async () => {
  const variables = { completed: true };

  class MockSubscriptionLinkOverride extends MockSubscriptionLink {
    request(req: Operation) {
      expect(req.variables).toEqual(variables);
      return super.request(req);
    }
  }

  const link = new MockSubscriptionLinkOverride();

  const client = createClient({ link });

  let count = 0;

  const Component = () => {
    const [, forceRender] = React.useState(0);
    const { data, loading, error } = useSubscription(
      FILTERED_TASKS_SUBSCRIPTION,
      { variables }
    );
    if (count === 0) {
      expect(loading).toBe(true);
      expect(error).toBeUndefined();
      expect(data).toBeUndefined();
    } else if (count === 1) {
      expect(loading).toBe(false);
      expect(error).toBeUndefined();
      expect(data).toEqual(complitedResults[0].result.data);
      forceRender(c => c + 1);
    } else if (count === 2) {
      expect(loading).toBe(false);
    }
    count++;
    return null;
  };

  render(
    <ApolloProvider client={client}>
      <Component />
    </ApolloProvider>
  );

  link.simulateResult(complitedResults[0]);
  await wait();

  expect(count).toBe(3);
});

it('should re-subscription if variables have changed', async () => {
  class MockSubscriptionLinkOverride extends MockSubscriptionLink {
    variables: any;
    request(req: Operation) {
      this.variables = req.variables;
      return super.request(req);
    }

    simulateResult() {
      if (this.variables.completed) {
        return super.simulateResult(complitedResults[0]);
      } else {
        return super.simulateResult(uncomplitedResults[0]);
      }
    }
  }

  const link = new MockSubscriptionLinkOverride();

  const client = createClient({ link });

  let count = 0;

  const Component = () => {
    const [completed, setCompleted] = React.useState(false);
    const { data, loading, error } = useSubscription(
      FILTERED_TASKS_SUBSCRIPTION,
      { variables: { completed } }
    );
    if (count === 0) {
      expect(loading).toBe(true);
      expect(error).toBeUndefined();
      expect(data).toBeUndefined();
    } else if (count === 1) {
      expect(loading).toBe(false);
      expect(error).toBeUndefined();
      expect(data).toEqual(uncomplitedResults[0].result.data);
      setCompleted(true);
    } else if (count === 2) {
      // TODO fix this
      expect(loading).toBe(false);
    } else if (count === 3) {
      expect(loading).toBe(true);
      expect(error).toBeUndefined();
      expect(data).toBeUndefined();
    } else if (count === 4) {
      expect(loading).toBe(false);
      expect(error).toBeUndefined();
      expect(data).toEqual(complitedResults[0].result.data);
    }
    count++;
    return null;
  };

  render(
    <ApolloProvider client={client}>
      <Component />
    </ApolloProvider>
  );

  link.simulateResult();
  await wait();
  link.simulateResult();
  await wait();

  expect(count).toBe(5);
});
