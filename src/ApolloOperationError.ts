import { ApolloError, OperationVariables } from 'apollo-client';
import {
  DocumentNode,
  OperationDefinitionNode,
  OperationTypeNode,
} from 'graphql';

interface OperationOptions extends Record<string, any> {
  variables?: OperationVariables;
}

export class ApolloOperationError extends ApolloError {
  readonly operationDoc: DocumentNode;
  readonly operationOptions: OperationOptions;
  readonly operationDefinition: OperationDefinitionNode | undefined;
  readonly operationName: string | undefined;
  readonly operationType: OperationTypeNode | undefined;

  constructor(
    apolloError: ApolloError,
    doc: DocumentNode,
    options: OperationOptions
  ) {
    super({ ...apolloError });
    this.operationDoc = doc;
    this.operationOptions = options;
    this.operationDefinition = doc.definitions.find(
      definition =>
        definition.kind === 'OperationDefinition' &&
        definition.name !== undefined
    ) as OperationDefinitionNode | undefined;
    if (this.operationDefinition) {
      if (this.operationDefinition.name) {
        this.operationName = this.operationDefinition.name.value;
      }
      this.operationType = this.operationDefinition.operation;
    }
  }
}

export function isOperationError(err: Error): err is ApolloOperationError {
  return (
    err.hasOwnProperty('operationDoc') && err.hasOwnProperty('operationOptions')
  );
}

export function isQueryError(err: Error): err is ApolloOperationError {
  return isOperationError(err) && err.operationType === 'query';
}

export function isMutationError(err: Error): err is ApolloOperationError {
  return isOperationError(err) && err.operationType === 'mutation';
}

export function isSubscriptionError(err: Error): err is ApolloOperationError {
  return isOperationError(err) && err.operationType === 'subscription';
}
