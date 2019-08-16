import ApolloClient from 'apollo-client';

let client: ApolloClient<any> | null = null;

export function setClient(overrideClient: ApolloClient<any>) {
  client = overrideClient;
}

export function getClient() {
  return client;
}

export default client;
