import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { pageview, GA_TRACKING_ID } from '@/lib/analytics';

export function useAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && GA_TRACKING_ID) {
      // Track page views on route changes
      const url = searchParams ? `${pathname}?${searchParams.toString()}` : pathname;
      pageview(url);
    }
  }, [pathname, searchParams]);

  return {
    trackEvent: (event: {
      action: string;
      category: string;
      label?: string;
      value?: number;
    }) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', event.action, {
          event_category: event.category,
          event_label: event.label,
          value: event.value,
        });
      }
    },
  };
}
