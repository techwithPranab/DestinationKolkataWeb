import { Metadata } from 'next'

// Common SEO utilities
export function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+$|^-+|-+$/g, '')
}

export function generateMetadata({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  section
}: {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url: string
  type?: 'website' | 'article'
  publishedTime?: Date
  modifiedTime?: Date
  section?: string
}): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://destinationkolkata.com'
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`
  const imageUrl = image?.startsWith('http') ? image : `${baseUrl}${image || '/Logo2.png'}`

  const metadata: Metadata = {
    title,
    description,
    keywords: keywords?.join(', '),
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: 'Destination Kolkata',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type,
      ...(publishedTime && { publishedTime: publishedTime.toISOString() }),
      ...(modifiedTime && { modifiedTime: modifiedTime.toISOString() }),
      ...(section && { section }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: fullUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }

  return metadata
}

// Schema.org JSON-LD generators
export function generateLocalBusinessSchema({
  name,
  description,
  image,
  address,
  phone,
  email,
  website,
  openingHours,
  priceRange,
  rating,
  reviewCount,
  type = 'LocalBusiness'
}: {
  name: string
  description: string
  image?: string
  address?: {
    street?: string
    city: string
    state: string
    postalCode?: string
    country: string
  }
  phone?: string
  email?: string
  website?: string
  openingHours?: string[]
  priceRange?: string
  rating?: number
  reviewCount?: number
  type?: 'TouristAttraction' | 'Restaurant' | 'Hotel' | 'LocalBusiness'
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://destinationkolkata.com'
  const imageUrl = image?.startsWith('http') ? image : `${baseUrl}${image || '/Logo2.png'}`

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': type,
    name,
    description,
    image: imageUrl,
    ...(address && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: address.street,
        addressLocality: address.city,
        addressRegion: address.state,
        postalCode: address.postalCode,
        addressCountry: address.country,
      },
    }),
    ...(phone && { telephone: phone }),
    ...(email && { email }),
    ...(website && { url: website }),
    ...(openingHours && { openingHours }),
    ...(priceRange && { priceRange }),
    ...(rating && reviewCount && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating,
        reviewCount,
      },
    }),
  }

  return schema
}

export function generateEventSchema({
  name,
  description,
  image,
  startDate,
  endDate,
  location,
  organizer,
  offers,
  performer
}: {
  name: string
  description: string
  image?: string
  startDate: Date
  endDate?: Date
  location?: {
    name: string
    address?: {
      street?: string
      city: string
      state: string
      postalCode?: string
      country: string
    }
  }
  organizer?: {
    name: string
    email?: string
    phone?: string
  }
  offers?: {
    price?: number
    currency?: string
    availability?: string
    url?: string
  }
  performer?: {
    name: string
    type?: string
  }
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://destinationkolkata.com'
  const imageUrl = image?.startsWith('http') ? image : `${baseUrl}${image || '/Logo2.png'}`

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name,
    description,
    image: imageUrl,
    startDate: startDate.toISOString(),
    ...(endDate && { endDate: endDate.toISOString() }),
    ...(location && {
      location: {
        '@type': 'Place',
        name: location.name,
        ...(location.address && {
          address: {
            '@type': 'PostalAddress',
            streetAddress: location.address.street,
            addressLocality: location.address.city,
            addressRegion: location.address.state,
            postalCode: location.address.postalCode,
            addressCountry: location.address.country,
          },
        }),
      },
    }),
    ...(organizer && {
      organizer: {
        '@type': 'Organization',
        name: organizer.name,
        ...(organizer.email && { email: organizer.email }),
        ...(organizer.phone && { telephone: organizer.phone }),
      },
    }),
    ...(offers && {
      offers: {
        '@type': 'Offer',
        price: offers.price,
        priceCurrency: offers.currency || 'INR',
        availability: offers.availability || 'https://schema.org/InStock',
        ...(offers.url && { url: offers.url }),
      },
    }),
    ...(performer && {
      performer: {
        '@type': performer.type || 'Organization',
        name: performer.name,
      },
    }),
  }

  return schema
}

export function generateArticleSchema({
  headline,
  description,
  image,
  author,
  publishDate,
  modifiedDate,
  url,
  keywords
}: {
  headline: string
  description: string
  image?: string
  author?: string
  publishDate: Date
  modifiedDate?: Date
  url: string
  keywords?: string[]
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://destinationkolkata.com'
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`
  const imageUrl = image?.startsWith('http') ? image : `${baseUrl}${image || '/Logo2.png'}`

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    image: imageUrl,
    author: {
      '@type': 'Organization',
      name: author || 'Destination Kolkata',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Destination Kolkata',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/Logo2.png`,
      },
    },
    datePublished: publishDate.toISOString(),
    dateModified: (modifiedDate || publishDate).toISOString(),
    url: fullUrl,
    ...(keywords && { keywords: keywords.join(', ') }),
  }
}

// Generate breadcrumb schema
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://destinationkolkata.com'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
    })),
  }
}

// Generate FAQ schema
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

// Generate organization schema for the site
export function generateOrganizationSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://destinationkolkata.com'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Destination Kolkata',
    url: baseUrl,
    logo: `${baseUrl}/Logo2.png`,
    description: 'Your ultimate guide to exploring Kolkata - discover attractions, hotels, restaurants, events, and more in the City of Joy.',
    sameAs: [
      // Add social media URLs here
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['English', 'Bengali', 'Hindi'],
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Kolkata',
      addressRegion: 'West Bengal',
      addressCountry: 'IN',
    },
  }
}
