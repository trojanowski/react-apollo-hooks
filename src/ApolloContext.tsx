import ApolloClient from 'apollo-client';
import React, { ReactElement, ReactNode, useContext } from 'react';

import { assertApolloClient } from './utils';

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

export function useApolloClient<TCache = object>(): null | ApolloClient<
  TCache
> {
  const client = useContext(ApolloContext);

  assertApolloClient(client);

  return client;
}
