import React, { Suspense } from 'react';

/**
 * These widgets only apply to a handful of ONE_FACE layouts and are rare
 * in any real card pool — each is lazy-loaded individually so the common
 * `normal` case never pays for them.
 */
const EXTRAS_BY_LAYOUT = {
  saga: React.lazy(() => import('./SagaTracker.jsx')),
  class: React.lazy(() => import('./ClassLevels.jsx')),
  case: React.lazy(() => import('./CaseSections.jsx')),
  leveler: React.lazy(() => import('./LevelerStats.jsx')),
  mutate: React.lazy(() => import('./MutateBanner.jsx')),
  prototype: React.lazy(() => import('./PrototypeBanner.jsx')),
};

export default function CardExtras({ layout, face }) {
  const Extra = EXTRAS_BY_LAYOUT[layout];
  if (!Extra) return null;

  return (
    <Suspense fallback={null}>
      <Extra face={face} />
    </Suspense>
  );
}
