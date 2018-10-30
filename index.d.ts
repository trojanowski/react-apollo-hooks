import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import ApolloClient, { ApolloQueryResult, OperationVariables } from 'apollo-client';
import { DocumentNode } from 'graphql';
import { ReactNode } from 'react';
import { MutationFn, MutationOptions } from 'react-apollo';
interface ProviderProps {
    children: ReactNode;
    client: ApolloClient<NormalizedCacheObject>;
}
export declare function ApolloProvider({ children, client }: ProviderProps): JSX.Element;
export declare function useApolloClient(): ApolloClient<NormalizedCacheObject> | null;
export declare function useApolloQuery<TData, TVariables = OperationVariables>(query: any, { variables }?: {
    variables?: TVariables;
}): ApolloQueryResult<TData>;
export declare function useApolloMutation<TData, TVariables = OperationVariables>(mutation: DocumentNode, baseOptions?: Partial<MutationOptions<TData, Partial<TVariables>>>): MutationFn<TData, TVariables>;
export {};
