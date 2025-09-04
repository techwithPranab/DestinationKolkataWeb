import HeroBanner from '@/components/home/HeroBanner'
import PromotionSection from '@/components/home/PromotionSection'
import EventsSection from '@/components/home/EventsSection'
import CustomerReviewCarousel from '@/components/home/CustomerReviewCarousel'

export default function Home() {
  return (
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
  )
}
