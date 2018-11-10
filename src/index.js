import React, { useContext, useEffect, useRef, useState } from 'react';
import isEqual from 'react-fast-compare';

import deprecated from './deprecated';

const ApolloContext = React.createContext();

export function ApolloProvider({ children, client }) {
  return (
    <ApolloContext.Provider value={client}>{children}</ApolloContext.Provider>
  );
}

export function useApolloClient() {
  return useContext(ApolloContext);
}

export function useQuery(
  query,
  {
    variables,
    suspend = true,
    context: apolloContextOptions,
    ...restOptions
  } = {}
) {
  const client = useApolloClient();
  const [result, setResult] = useState();
  const previousQuery = useRef();
  // treat variables and context options separately because they are objects
  // and the other options are JS primitives
  const previousVariables = useRef();
  const previousApolloContextOptions = useRef();
  const previousRestOptions = useRef();
  const observableQuery = useRef();
  const shouldRefetch = useRef();

  useEffect(
    () => {
      const subscription = observableQuery.current.subscribe(nextResult => {
        setResult(nextResult);
      });

      if (shouldRefetch.current) {
        shouldRefetch.current = false;
        observableQuery.current.refetch();
      }

      return () => {
        subscription.unsubscribe();
      };
    },
    [
      query,
      objToKey(variables),
      objToKey(previousApolloContextOptions),
      objToKey(restOptions),
    ]
  );

  ensureSupportedFetchPolicy(restOptions.fetchPolicy, suspend);

  const helpers = {
    fetchMore: opts => observableQuery.current.fetchMore(opts),
  };

  if (
    !(
      query === previousQuery.current &&
      isEqual(variables, previousVariables.current) &&
      isEqual(apolloContextOptions, previousApolloContextOptions.current) &&
      isEqual(restOptions, previousRestOptions.current)
    )
  ) {
    previousQuery.current = query;
    previousVariables.current = variables;
    previousApolloContextOptions.current = apolloContextOptions;
    previousRestOptions.current = restOptions;
    shouldRefetch.current = false;

    const { fetchPolicy } = restOptions;
    // We can't use `cache-and-network` fetch policy directly because it causes
    // an infinite loop so we emulate it by using the default `cache-first`
    // policy and then optionally forcing a refetch. Please look at
    // https://github.com/trojanowski/react-apollo-hooks/issues/13 for details.
    const emulateCacheAndNetworkPolicy =
      suspend && fetchPolicy === 'cache-and-network';

    const watchedQuery = client.watchQuery({
      query,
      variables,
      ...restOptions,
      fetchPolicy: emulateCacheAndNetworkPolicy ? 'cache-first' : fetchPolicy,
    });
    observableQuery.current = watchedQuery;
    const currentResult = watchedQuery.currentResult();
    if (currentResult.partial && suspend) {
      // throw a promise - use the react suspense to wait until the data is
      // available
      throw watchedQuery.result();
    } else if (emulateCacheAndNetworkPolicy) {
      shouldRefetch.current = true;
    }
    setResult(currentResult);

    return { ...helpers, ...currentResult };
  }

  return { ...helpers, ...result };
}

export function useMutation(mutation, baseOptions) {
  const client = useApolloClient();
  return localOptions =>
    client.mutate({ mutation, ...baseOptions, ...localOptions });
}

function ensureSupportedFetchPolicy(fetchPolicy, suspend) {
  if (!suspend) {
    return;
  }
  if (
    fetchPolicy &&
    fetchPolicy !== 'cache-first' &&
    fetchPolicy !== 'cache-and-network'
  ) {
    throw new Error(
      `Fetch policy ${fetchPolicy} is not supported without 'suspend: false'`
    );
  }
}

function objToKey(obj) {
  if (!obj) {
    return null;
  }
  const keys = Object.keys(obj);
  keys.sort();
  const sortedObj = keys.reduce((result, key) => {
    result[key] = obj[key];
    return result;
  }, {});
  return JSON.stringify(sortedObj);
}

export const useApolloQuery = deprecated(
  useQuery,
  'useApolloQuery is deprecated, please use useQuery'
);
export const useApolloMutation = deprecated(
  useMutation,
  'useApolloMutation is deprecated, please use useMutation'
);
