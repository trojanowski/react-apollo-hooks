import React, { Suspense, SuspenseProps, useContext } from 'react';
import { SSRContext } from './internal/SSRContext';

export function unstable_SuspenseSSR({ children, fallback }: SuspenseProps) {
  const ssrManager = useContext(SSRContext);

  return ssrManager ? (
    <>{children}</>
  ) : (
    <Suspense fallback={fallback}>{children}</Suspense>
  );
}
