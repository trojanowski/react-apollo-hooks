import isPlainObject from 'lodash/isPlainObject';
import ApolloClient from 'apollo-client';

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export default function objToKey(obj: Record<string, any>): null | string {
  if (!obj) {
    return null;
  }
  const keys = Object.keys(obj).sort();

  const sortedObj = keys.reduce(
    (result, key) => {
      const value = obj[key];
      if (isPlainObject(value)) {
        result[key] = objToKey(obj[key]);
      } else {
        result[key] = obj[key];
      }
      return result;
    },
    {} as Record<string, any>
  );
  return JSON.stringify(sortedObj);
}

export function assertApolloClient(client: null | ApolloClient<any>) {
  if (!client) {
    // https://github.com/apollographql/react-apollo/blob/5cb63b3625ce5e4a3d3e4ba132eaec2a38ef5d90/src/component-utils.tsx#L19-L22
    throw new Error(
      'Could not find "client" in the context or passed in as a prop. ' +
        'Wrap the root component in an <ApolloProvider>, or pass an ' +
        'ApolloClient instance in via props.'
    );
  }
}