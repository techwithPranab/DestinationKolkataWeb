'use client';

import { useEffect, Suspense } from 'react';
import { pageview, GA_TRACKING_ID } from '@/lib/analytics';

function AnalyticsTracker() {
  // This component will only run on the client side
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const search = typeof window !== 'undefined' ? window.location.search : '';

  useEffect(() => {
    if (pathname && GA_TRACKING_ID) {
      const url = pathname + search;
      pageview(url);
    }
  }, [pathname, search]);

  return null;
}

export function AnalyticsProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
      {children}
    </>
  );
}
