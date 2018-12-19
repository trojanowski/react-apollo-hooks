import React, { useContext, useEffect, useRef, useState } from 'react';
import isEqual from 'react-fast-compare';

import objToKey from './objToKey';
import {
  getCachedObservableQuery,
  invalidateCachedObservableQuery,
} from './queryCache';

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
  { skip = false, suspend = true, ...restOptions } = {}
) {
  const client = useApolloClient();
  const [result, setResult] = useState();
  const previousQuery = useRef();
  const previousRestOptions = useRef();
  const observableQuery = useRef();

  useEffect(
    () => {
      if (skip) {
        return;
      }

      const subscription = observableQuery.current.subscribe(nextResult => {
        setResult(nextResult);
      });
      invalidateCachedObservableQuery(client, query, restOptions);

      return () => {
        subscription.unsubscribe();
      };
    },
    [skip, query, objToKey(restOptions)]
  );

  ensureSupportedFetchPolicy(restOptions.fetchPolicy, suspend);

  const helpers = {
    fetchMore: opts => observableQuery.current.fetchMore(opts),
    refetch: variables => observableQuery.current.refetch(variables),
    startPolling: interval => observableQuery.current.startPolling(interval),
    stopPolling: () => observableQuery.current.stopPolling(),
    updateQuery: updaterFn => observableQuery.current.updateQuery(updaterFn),
  };

  if (skip) {
    // Taken from https://github.com/apollographql/react-apollo/blob/5cb63b3625ce5e4a3d3e4ba132eaec2a38ef5d90/src/Query.tsx#L376-L381
    return {
      ...helpers,
      data: undefined,
      error: undefined,
      loading: false,
    };
  }

  if (
    !(
      query === previousQuery.current &&
      isEqual(restOptions, previousRestOptions.current)
    )
  ) {
    previousQuery.current = query;
    previousRestOptions.current = restOptions;
    const watchedQuery = getCachedObservableQuery(client, query, restOptions);
    observableQuery.current = watchedQuery;
    const currentResult = watchedQuery.currentResult();
    if (currentResult.partial && suspend) {
      // throw a promise - use the react suspense to wait until the data is
      // available
      throw watchedQuery.result();
    }
    setResult(currentResult);
    return { ...helpers, ...currentResult };
  }

  if (!result) {
    const currentResult = observableQuery.current.currentResult();
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
  if (fetchPolicy && fetchPolicy !== 'cache-first') {
    throw new Error(
      `Fetch policy ${fetchPolicy} is not supported without 'suspend: false'`
    );
  }
}
