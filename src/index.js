import React, { useContext, useEffect, useRef, useState } from 'react';
import isEqual from 'react-fast-compare';

const ApolloContext = React.createContext();

export function ApolloProvider({ children, client }) {
  return (
    <ApolloContext.Provider value={client}>{children}</ApolloContext.Provider>
  );
}

export function useClient() {
  return useContext(ApolloContext);
}

export function useApolloClient() {
  console.warn('useApolloClient is deprecated, please use useClient');
  return useClient();
}

export function useQuery(
  query,
  { variables, context: apolloContextOptions, ...restOptions } = {}
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

  useEffect(
    () => {
      const subscription = observableQuery.current.subscribe(nextResult => {
        setResult(nextResult);
      });

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
    const watchedQuery = client.watchQuery({
      query,
      variables,
      ...restOptions,
    });
    observableQuery.current = watchedQuery;
    const currentResult = watchedQuery.currentResult();
    if (currentResult.partial) {
      // throw a promise - use the react suspense to wait until the data is
      // available
      throw watchedQuery.result();
    }
    setResult(currentResult);
    return { ...helpers, ...currentResult };
  }

  return { ...helpers, ...result };
}

export function useApolloQuery(...args) {
  console.warn('useApolloQuery is deprecated, please use useQuery');
  return useQuery(...args);
}

export function useMutation(mutation, baseOptions) {
  const client = useClient();
  return localOptions =>
    client.mutate({ mutation, ...baseOptions, ...localOptions });
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

export function useApolloMutation(...args) {
  console.warn('useApolloMutation is deprecated, please use useMutation');
  return useMutation(...args);
}
