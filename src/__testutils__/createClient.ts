import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { MockLink } from 'apollo-link-mock';
import { ApolloLink } from 'apollo-link';
import { MockedResponse } from 'apollo-link-mock/lib';

interface CreateClientOptions {
  readonly link?: ApolloLink;
  readonly mocks?: ReadonlyArray<MockedResponse>;
}

export default function createClient({
  link,
  mocks = [],
}: CreateClientOptions = {}) {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: link ? link : new MockLink(mocks),
  });
}
