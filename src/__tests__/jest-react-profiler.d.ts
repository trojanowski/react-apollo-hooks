declare module 'jest-react-profiler' {
  import { ComponentType } from 'react';

  export function withProfiler<TProps>(
    Component: ComponentType<TProps>
  ): ComponentType<TProps>;
}

declare namespace jest {
  interface Matchers<R> {
    toHaveCommittedTimes(expectedNumCommits: number): R;
    toMatchNumCommits(): R;
  }
}
