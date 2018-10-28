import React, { useContext, useEffect, useRef, useState } from 'react';
import isEqual from 'react-fast-compare';

const ApolloContext = React.createContext();

export function ApolloProvider({ children, client }) {
  return (
    <ApolloContext.Provider value={client}>{children}</ApolloContext.Provider>
  );
}

export function useApolloClient() {
  return useContext(ApolloContext);
}

export function useApolloQuery(query, { variables } = {}) {
  const client = useApolloClient();
  const [result, setResult] = useState();
  const previousQuery = useRef();
  const previousVariables = useRef();
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
    [query, objToKey(variables || {})]
  );

  const helpers = {
    fetchMore: opts => observableQuery.current.fetchMore(opts),
  };

  if (
    !(
      query === previousQuery.current &&
      isEqual(variables, previousVariables.current)
    )
  ) {
    previousQuery.current = query;
    previousVariables.current = variables;
    const watchedQuery = client.watchQuery({ query, variables });
    observableQuery.current = watchedQuery;
    const currentResult = watchedQuery.currentResult();
    if (currentResult.partial) {
      // throw a promise - use the react suspense to wait until the data is
      // available
      throw watchedQuery.result();
    }
    setResult(currentResult);
    return { ...helpers, result: currentResult };
  }

  return { ...helpers, result };
}

export function useApolloMutation(mutation, baseOptions) {
  const client = useApolloClient();
  return localOptions =>
    client.mutate({ mutation, ...baseOptions, ...localOptions });
}

function objToKey(obj) {
  const keys = Object.keys(obj);
  keys.sort();
  const sortedObj = keys.reduce((result, key) => {
    result[key] = obj[key];
    return result;
  }, {});
  return JSON.stringify(sortedObj);
}
