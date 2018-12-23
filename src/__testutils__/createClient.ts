import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { MockLink } from 'apollo-link-mock';
import { ApolloLink } from 'apollo-link';
import { MockedResponse } from 'apollo-link-mock/lib';

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
