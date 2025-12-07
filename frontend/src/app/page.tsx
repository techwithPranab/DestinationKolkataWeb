import HeroBanner from '@/components/home/HeroBanner'
import PromotionSection from '@/components/home/PromotionSection'
import EventsSection from '@/components/home/EventsSection'
import CustomerReviewCarousel from '@/components/home/CustomerReviewCarousel'
import { WebsiteStructuredData, OrganizationStructuredData, LocalBusinessStructuredData } from '@/components/SEO/StructuredData'

export const metadata = {
  title: 'Home',
  description: 'Welcome to Destination Kolkata - Your ultimate guide to exploring the City of Joy. Discover the best hotels, restaurants, attractions, events, and cultural experiences in Kolkata.',
  keywords: [
    'Kolkata tourism',
    'City of Joy',
    'Kolkata travel guide',
    'Kolkata hotels',
    'Kolkata restaurants',
    'Kolkata attractions',
    'Kolkata events',
    'West Bengal tourism',
    'India travel guide'
  ],
  openGraph: {
    title: 'Destination Kolkata - Discover the City of Joy',
    description: 'Your ultimate guide to exploring Kolkata. Find the best hotels, restaurants, attractions, and events in the City of Joy.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Kolkata City Skyline - The City of Joy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Destination Kolkata - Discover the City of Joy',
    description: 'Your ultimate guide to exploring Kolkata.',
    images: ['https://images.unsplash.com/photo-1582510003544-4d00b7f74220?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'],
  },
}

export default function Home() {
  return (
    <>
      {/* Structured Data */}
      <WebsiteStructuredData />
      <OrganizationStructuredData />
      <LocalBusinessStructuredData />

      <main>
        <HeroBanner />
        <PromotionSection />
        <EventsSection />
        <CustomerReviewCarousel />

        {/* Featured sections will be added here */}
        <div className="py-16 text-center hidden">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Destination Kolkata
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the rich heritage, vibrant culture, and culinary delights of the City of Joy
          </p>
        </div>
      </main>
    </>
  )
}
