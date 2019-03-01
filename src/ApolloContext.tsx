import ApolloClient from 'apollo-client';
import React, { ReactElement, ReactNode, useContext } from 'react';

const ApolloContext = React.createContext<null | ApolloClient<any>>(null);

export interface ApolloProviderProps<TCacheShape> {
  readonly children?: ReactNode;
  readonly client: ApolloClient<TCacheShape>;
}

export function ApolloProvider<TCacheShape = any>({
  client,
  children,
}: ApolloProviderProps<TCacheShape>): ReactElement<
  ApolloProviderProps<TCacheShape>
> {
  return (
    <ApolloContext.Provider value={client}>{children}</ApolloContext.Provider>
  );
}

export function useApolloClient<TCache = object>(
  overrideClient?: ApolloClient<TCache>
): ApolloClient<TCache> {
  const client = useContext(ApolloContext);

  // Ensures that the number of hooks called from one render to another remains
  // constant, despite the Apollo client read from context being swapped for
  // one passed directly as prop.
  if (overrideClient) {
    return overrideClient;
  }

  if (!client) {
    // https://github.com/apollographql/react-apollo/blob/5cb63b3625ce5e4a3d3e4ba132eaec2a38ef5d90/src/component-utils.tsx#L19-L22
    throw new Error(
      'Could not find "client" in the context or passed in as a prop. ' +
        'Wrap the root component in an <ApolloProvider>, or pass an ' +
        'ApolloClient instance in via props.'
    );
  }
  return client;
}
