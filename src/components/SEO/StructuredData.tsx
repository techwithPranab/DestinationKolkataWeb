interface StructuredDataProps {
  type: 'website' | 'organization' | 'local-business' | 'article' | 'event' | 'hotel' | 'restaurant'
  data: Record<string, unknown>
}

export default function StructuredData({ type, data }: Readonly<StructuredDataProps>) {
  const getSchemaType = (schemaType: string): string => {
    const typeMap: Record<string, string> = {
      website: 'WebSite',
      organization: 'Organization',
      'local-business': 'LocalBusiness',
      article: 'Article',
      event: 'Event',
      hotel: 'Hotel',
      restaurant: 'Restaurant'
    }
    return typeMap[schemaType] || 'WebSite'
  }

  const getStructuredData = () => {
    return {
      '@context': 'https://schema.org',
      '@type': getSchemaType(type),
      name: 'Destination Kolkata',
      url: 'https://destinationkolkata.com',
      description: 'Discover the best of Kolkata - hotels, restaurants, attractions, events, and cultural experiences in the City of Joy',
      ...data
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData(), null, 2),
      }}
    />
  )
}

// Predefined structured data components
export function WebsiteStructuredData() {
  return (
    <StructuredData
      type="website"
      data={{
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://destinationkolkata.com/search?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        },
        publisher: {
          '@type': 'Organization',
          name: 'Destination Kolkata',
          logo: {
            '@type': 'ImageObject',
            url: 'https://destinationkolkata.com/logo.png'
          }
        }
      }}
    />
  )
}

export function OrganizationStructuredData() {
  return (
    <StructuredData
      type="organization"
      data={{
        logo: 'https://destinationkolkata.com/logo.png',
        image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Kolkata',
          addressRegion: 'West Bengal',
          addressCountry: 'IN'
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+91-XXXXXXXXXX',
          contactType: 'customer service',
          availableLanguage: 'English'
        },
        sameAs: [
          'https://facebook.com/destinationkolkata',
          'https://twitter.com/destinationkolkata',
          'https://instagram.com/destinationkolkata'
        ]
      }}
    />
  )
}

export function LocalBusinessStructuredData() {
  return (
    <StructuredData
      type="local-business"
      data={{
        name: 'Destination Kolkata Tourism Services',
        description: 'Your comprehensive guide to exploring Kolkata - the City of Joy',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Kolkata',
          addressRegion: 'West Bengal',
          postalCode: '700001',
          addressCountry: 'IN'
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 22.5726,
          longitude: 88.3639
        },
        telephone: '+91-XXXXXXXXXX',
        priceRange: '₹₹',
        openingHours: 'Mo-Su 00:00-23:59',
        servesCuisine: 'Indian',
        paymentAccepted: 'Cash, Credit Card',
        currenciesAccepted: 'INR'
      }}
    />
  )
}
