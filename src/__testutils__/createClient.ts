import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { MockLink, MockedResponse } from 'apollo-link-mock';

interface CreateClientOptions {
  readonly addTypename?: boolean;

  readonly link?: ApolloLink;
  readonly mocks?: ReadonlyArray<MockedResponse>;
}

export default function createClient({
  link,
  mocks = [],
  addTypename = true,
}: CreateClientOptions = {}) {
  return new ApolloClient({
    cache: new InMemoryCache({ addTypename }),
    link: link ? link : new MockLink(mocks),
  });
}
