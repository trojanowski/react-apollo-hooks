import { act } from 'react-dom/test-utils';

export default function flushRequests(): Promise<void> {
  act(() => {
    jest.runAllTimers();
  });

  return new Promise(resolve => resolve());
}
