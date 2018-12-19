import React, { ReactNode, useContext, ReactElement } from 'react';
import ApolloClient from 'apollo-client';

const ApolloContext = React.createContext<null | ApolloClient<any>>(null);

export interface ApolloProviderProps {
  readonly children?: ReactNode;
  readonly client: ApolloClient<any>;
}

export function ApolloProvider({
  client,
  children,
}: ApolloProviderProps): ReactElement<ApolloProviderProps> {
  return (
    <ApolloContext.Provider value={client}>{children}</ApolloContext.Provider>
  );
}

export function useApolloClient<TCache = object>(): null | ApolloClient<
  TCache
> {
  return useContext(ApolloContext);
}
