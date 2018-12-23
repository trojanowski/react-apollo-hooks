import { createContext } from 'react';

export interface SSRManager {
  hasPromises(): boolean;
  register(promise: Promise<any>): void;
  consumeAndAwaitPromises(): Promise<any>;
}

export function createSSRManager(): SSRManager {
  const promiseSet = new Set<Promise<any>>();

  return {
    hasPromises: () => promiseSet.size > 0,

    register: promise => {
      promiseSet.add(promise);
    },

    consumeAndAwaitPromises: () => {
      const promises = Array.from(promiseSet);

      promiseSet.clear();

      return Promise.all(promises);
    },
  };
}

export const SSRContext = createContext<null | SSRManager>(null);
