import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { MockLink } from 'apollo-link-mock';

export default function createClient({ link, mocks = [] } = {}) {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: link ? link : new MockLink(mocks),
  });
}
