# Google Analytics Integration Guide

This document provides comprehensive information about the Google Analytics integration implemented in the Destination Kolkata web application.

## Overview

Google Analytics has been integrated using Google Analytics 4 (GA4) with the following features:
- Automatic page view tracking
- Custom event tracking
- E-commerce tracking capabilities
- User engagement metrics
- Error tracking

## Setup Instructions

### 1. Get Your Google Analytics Tracking ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new GA4 property or use an existing one
3. Copy your Measurement ID (format: G-XXXXXXXXXX)

### 2. Configure Environment Variables

Update your `.env.local` file with your GA tracking ID:

```bash
# Google Analytics Configuration
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
```

Replace `G-XXXXXXXXXX` with your actual Google Analytics Measurement ID.

### 3. Verify Integration

1. Start your development server: `npm run dev`
2. Open your browser's developer tools
3. Check the Network tab for requests to `googletagmanager.com`
4. Use the Realtime reports in Google Analytics to see if page views are being tracked

## Implementation Details

### Core Components

#### 1. Analytics Script Integration (`src/app/layout.tsx`)
- Uses Next.js `Script` component for optimal loading
- Implements GA4 gtag configuration
- Conditionally loads only when tracking ID is provided

#### 2. Analytics Provider (`src/components/AnalyticsProvider.tsx`)
- Client-side component that initializes tracking
- Wraps the entire application for automatic page view tracking

#### 3. Analytics Hook (`src/hooks/useAnalytics.ts`)
- Custom React hook for automatic page view tracking
- Tracks route changes automatically
- Provides event tracking interface

#### 4. Analytics Utilities (`src/lib/analytics.ts`)
- Utility functions for tracking custom events
- Predefined event categories and actions
- Type-safe event tracking

## Usage Examples

### Basic Event Tracking

```tsx
import { trackEvent } from '@/lib/analytics';

function MyComponent() {
  const handleClick = () => {
    trackEvent.search('kolkata hotels');
  };

  return (
    <button onClick={handleClick}>
      Search Hotels
    </button>
  );
}
```

### Using the Analytics Hook

```tsx
import { useAnalytics } from '@/hooks/useAnalytics';

function MyComponent() {
  const { trackEvent } = useAnalytics();

  const handleCustomEvent = () => {
    trackEvent({
      action: 'custom_action',
      category: 'engagement',
      label: 'custom_label',
      value: 1
    });
  };

  return (
    <button onClick={handleCustomEvent}>
      Track Custom Event
    </button>
  );
}
```

### Predefined Event Trackers

The `trackEvent` object provides convenient methods for common events:

```tsx
import { trackEvent } from '@/lib/analytics';

// Navigation tracking
trackEvent.navigation('hotels_page');

// Item views
trackEvent.viewItem('hotel', 'hotel_123', 'Taj Bengal');

// Contact form submissions
trackEvent.contactForm('general_inquiry');

// Booking attempts
trackEvent.bookingAttempt('hotel_reservation');

// Social sharing
trackEvent.socialShare('facebook', 'hotel_review');

// Scroll depth tracking
trackEvent.scrollDepth(75);

// Error tracking
trackEvent.error('api_error', 'Failed to load hotels');
```

## Event Categories and Actions

### Navigation Events
- **Category**: `navigation`
- **Actions**: `page_view`
- **Labels**: Page names (e.g., 'hotels_page', 'restaurants_page')

### Search Events
- **Category**: `engagement`
- **Actions**: `search`
- **Labels**: Search query strings

### Item View Events
- **Category**: `hotel`, `restaurant`, `attraction`, etc.
- **Actions**: `view_item`
- **Labels**: `{itemId} - {itemName}`

### Contact Events
- **Category**: `contact`
- **Actions**: `form_submit`
- **Labels**: Form types (e.g., 'general_inquiry', 'booking_request')

### E-commerce Events
- **Category**: `ecommerce`
- **Actions**: `begin_checkout`, `purchase`
- **Labels**: Service types (e.g., 'hotel_booking', 'restaurant_reservation')

### Social Events
- **Category**: `social`
- **Actions**: `share`
- **Labels**: `{platform} - {contentType}`

### Engagement Events
- **Category**: `engagement`
- **Actions**: `scroll`
- **Labels**: Scroll percentages (e.g., '75%')
- **Values**: Scroll percentage numbers

### Error Events
- **Category**: `error`
- **Actions**: `exception`
- **Labels**: `{errorType}: {errorMessage}`

## Advanced Configuration

### Custom Dimensions and Metrics

You can extend the GA4 configuration by modifying the gtag config in `layout.tsx`:

```tsx
gtag('config', '${process.env.NEXT_PUBLIC_GA_TRACKING_ID}', {
  page_title: document.title,
  page_location: window.location.href,
  send_page_view: true,
  // Add custom dimensions
  custom_map: {
    'dimension1': 'user_type',
    'metric1': 'page_views_per_session'
  }
});
```

### E-commerce Tracking

For enhanced e-commerce tracking, you can implement purchase events:

```tsx
// Track purchases
export const trackPurchase = (transaction: {
  transaction_id: string;
  value: number;
  currency: string;
  items: Array<{
    item_id: string;
    item_name: string;
    category: string;
    price: number;
    quantity: number;
  }>;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transaction.transaction_id,
      value: transaction.value,
      currency: transaction.currency,
      items: transaction.items,
    });
  }
};
```

## Best Practices

### 1. Privacy Compliance
- Only load GA when users consent (if required by your privacy policy)
- Respect Do Not Track settings
- Implement cookie consent management if needed

### 2. Performance Optimization
- GA scripts load asynchronously to avoid blocking page rendering
- Use the `afterInteractive` strategy for optimal loading timing

### 3. Event Naming Conventions
- Use consistent naming patterns
- Include relevant context in event labels
- Avoid personally identifiable information (PII)

### 4. Testing
- Test events in Google Analytics Realtime reports
- Use browser developer tools to verify event firing
- Implement proper error handling for tracking failures

## Troubleshooting

### Common Issues

1. **Events not appearing in GA**
   - Check that the tracking ID is correctly set
   - Verify events are firing in browser dev tools
   - Wait up to 24 hours for data to appear in standard reports

2. **Page views not tracking**
   - Ensure the AnalyticsProvider is properly wrapping your app
   - Check for JavaScript errors that might prevent GA loading
   - Verify the GA script is loading in the Network tab

3. **Custom events not working**
   - Confirm the event structure matches GA4 requirements
   - Check for typos in event names and parameters
   - Use the GA4 DebugView for real-time event validation

### Debug Mode

Enable GA4 debug mode by adding this parameter to your tracking:

```javascript
gtag('config', 'G-XXXXXXXXXX', {
  debug_mode: true
});
```

This will log detailed information to the browser console.

## Deployment Checklist

- [ ] Set production GA tracking ID in production environment
- [ ] Test GA integration in staging environment
- [ ] Verify events are firing correctly
- [ ] Check GA Realtime reports for data accuracy
- [ ] Implement proper error handling
- [ ] Document any custom events for your team

## Resources

- [Google Analytics 4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [GA4 Event Reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)
- [Next.js Analytics Guide](https://nextjs.org/docs/app/building-your-application/optimizing/analytics)

## Support

For questions about the GA integration:
1. Check the Google Analytics documentation
2. Review browser developer tools for errors
3. Test with GA4 DebugView enabled
4. Contact your development team for custom implementation help
