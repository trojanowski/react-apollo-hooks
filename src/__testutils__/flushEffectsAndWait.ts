import { flushEffects } from 'react-testing-library';

export default function flushEffectsAndWait(): Promise<void> {
  return new Promise(resolve => {
    flushEffects();

    return setTimeout(resolve, 20);
  });
}
