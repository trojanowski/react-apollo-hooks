import React, { ErrorInfo } from 'react';
import { isMutationError } from './ApolloMutationError';
import { isQueryError } from './ApolloQueryError';

interface IProps {
  queryFallback?: React.ReactElement<any>;
  mutationFallback?: React.ReactElement<any>;
  shouldBailOnQuery?: boolean;
  shouldBailOnMutation?: boolean;
  onError(error: Error, errorInfo: ErrorInfo): void;
}

interface IState {
  hasQueryError: boolean;
  hasMutationError: boolean;
}

export class BasicErrorHandler extends React.Component<IProps, IState> {
  static getDerivedStateFromError(error: Error) {
    return {
      hasMutationError: isMutationError(error),
      hasQueryError: isQueryError(error),
    };
  }

  state: IState;

  constructor(props: IProps) {
    super(props);
    this.state = { hasQueryError: false, hasMutationError: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    const { hasQueryError, hasMutationError } = this.state;
    const {
      shouldBailOnQuery = false,
      shouldBailOnMutation = false,
      queryFallback,
      mutationFallback,
      children,
    } = this.props;
    if (shouldBailOnQuery && hasQueryError && queryFallback) {
      return queryFallback;
    }
    if (shouldBailOnMutation && hasMutationError && mutationFallback) {
      return mutationFallback;
    }
    return children;
  }
}
