// Google Analytics utility functions
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

// Track page views
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID!, {
      page_path: url,
    });
  }
};

// Track custom events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track specific user interactions
export const trackEvent = {
  // Navigation events
  navigation: (page: string) => event({
    action: 'page_view',
    category: 'navigation',
    label: page,
  }),

  // Search events
  search: (query: string) => event({
    action: 'search',
    category: 'engagement',
    label: query,
  }),

  // Hotel/Restaurant/Attraction views
  viewItem: (itemType: string, itemId: string, itemName: string) => event({
    action: 'view_item',
    category: itemType,
    label: `${itemId} - ${itemName}`,
  }),

  // Contact form submissions
  contactForm: (formType: string) => event({
    action: 'form_submit',
    category: 'contact',
    label: formType,
  }),

  // Booking/Reservation attempts
  bookingAttempt: (serviceType: string) => event({
    action: 'begin_checkout',
    category: 'ecommerce',
    label: serviceType,
  }),

  // Social media interactions
  socialShare: (platform: string, contentType: string) => event({
    action: 'share',
    category: 'social',
    label: `${platform} - ${contentType}`,
  }),

  // User engagement
  scrollDepth: (percentage: number) => event({
    action: 'scroll',
    category: 'engagement',
    label: `${percentage}%`,
    value: percentage,
  }),

  // Error tracking
  error: (errorType: string, errorMessage: string) => event({
    action: 'exception',
    category: 'error',
    label: `${errorType}: ${errorMessage}`,
  }),
};
