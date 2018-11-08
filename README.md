# react-apollo-hooks

Use [Apollo Client](https://github.com/apollographql/apollo-client) as React [hooks](https://reactjs.org/docs/hooks-intro.html).

_Warning: Hooks are currently a React [RFC](https://github.com/reactjs/rfcs/pull/68) and **not ready for production**. Use at minimum `react@16.7.0-alpha.0` to use this package._

# Installation

`npm install react-apollo-hooks`

# Example

<https://codesandbox.io/s/8819w85jn9> is a port of Pupstagram sample app to react-apollo-hooks.

# API

## ApolloProvider

Similar to [ApolloProvider from react-apollo](https://www.apollographql.com/docs/react/essentials/get-started.html#creating-provider). 
Both packages can be used together, if you want to try out using hooks and retain `Query`, `Mutation`, `Subscription`, etc. HOCs from `react-apollo` without having to rewrite existing components throughout your app.

In order for this package to work, you need to wrap your component tree with `ApolloProvider` at an appropriate level, encapsulating all components which will use hooks.

### Standalone usage

If you would like to use this package standalone, this can be done with:

```javascript
import React from 'react';
import { render } from 'react-dom';

import { ApolloProvider } from 'react-apollo-hooks';

const client = ... // create Apollo client

const App = () => (
  <ApolloProvider client={client}>
    <MyRootComponent />
  </ApolloProvider>
);

render(<App />, document.getElementById('root'));
```
### Usage with react-apollo

To use with `react-apollo`'s `ApolloProvider` already present in your project:

```javascript
import React from 'react';
import { render } from 'react-dom';

import { ApolloProvider } from 'react-apollo';
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks';

const client = ... // create Apollo client

const App = () => (
  <ApolloProvider client={client}>
    <ApolloHooksProvider client={client}>
      <MyRootComponent />
   </ApolloHooksProvider>
  </ApolloProvider>
);

render(<App />, document.getElementById('root'));
```

## useQuery

```javascript
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo-hooks';

const GET_DOGS = gql`
  {
    dogs {
      id
      breed
    }
  }
`;

const Dogs = () => (
  const { data, error } = useQuery(GET_DOGS);
  if (error) return `Error! ${error.message}`;

  return (
    <ul>
      {data.dogs.map(dog => (
        <li key={dog.id}>
          {dog.breed}
        </li>
      ))}
    </ul>
  );
);
```

Note: to check if data is loaded use the [Suspense](https://reactjs.org/docs/code-splitting.html#suspense) component:

```javascript
import React, { Suspense } from 'react';

const MyComponent = () => {
  return (
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <Dogs />
      </Suspense>
    )
  );
}
```

## useMutation

```javascript
import gql from 'graphql-tag';
import { useMutation } from 'react-apollo-hooks';

const TOGGLE_LIKED_PHOTO = gql`
  mutation toggleLikedPhoto($id: String!) {
    toggleLikedPhoto(id: $id) @client
  }
`;

const DogWithLikes = ({ url, imageId, isLiked }) => {
  const toggleLike = useMutation(TOGGLE_LIKED_PHOTO, {
    variables: { id: imageId }
  });
  return (
    <div>
      <img src={url} />
      <button onClick={toggleLike}>
       {isLiked ? 'Stop liking' : 'like'}
      </button>
    </div>
  );
};
```

## useApolloClient

```javascript
const MyComponent = () => {
  const client = useApolloClient();
  // now you have access to the Apollo client
}
```

# Testing

An example showing how to test components using react-apollo-hooks:
<https://github.com/trojanowski/react-apollo-hooks-sample-test>
