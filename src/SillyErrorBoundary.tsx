import React from 'react';

interface IProps {
  onError(error: Error): void;
}

export class SillyErrorBoundary extends React.PureComponent<IProps> {
  static getDerivedStateFromError() {
    // has to be here, causing warning otherwise 😂
    return {};
  }
  componentDidCatch(error: Error) {
    this.props.onError(error);
  }
  render() {
    return this.props.children;
  }
}
