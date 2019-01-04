import React, { Component, ReactNode } from 'react';

interface Props {
  readonly children: ReactNode;
}

interface State {
  readonly error?: Error;
}

export class TestErrorBoundary extends Component<Props, State> {
  public static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  public constructor(props: Readonly<Props>) {
    super(props);

    this.state = {};
  }

  public render(): React.ReactNode {
    const { error } = this.state;

    if (error) {
      return <>TestErrorBoundary: {error.message}</>;
    }

    return this.props.children;
  }
}
