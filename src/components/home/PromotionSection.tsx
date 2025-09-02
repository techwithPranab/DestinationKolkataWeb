"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Tag, Calendar, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Promotion {
  id: string
  title: string
  description: string
  image: string
  discount: string
  validUntil: string
  category: string
  location: string
  href: string
}

const promotions: Promotion[] = [
  {
    id: '1',
    title: 'Luxury Hotel Deal',
    description: 'Get 30% off on luxury hotels in South Kolkata',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    discount: '30% OFF',
    validUntil: '2025-12-31',
    category: 'Hotels',
    location: 'South Kolkata',
    href: '/places?category=luxury'
  },
  {
    id: '2',
    title: 'Fine Dining Special',
    description: 'Exclusive dinner for two at premium restaurants',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    discount: 'Buy 1 Get 1',
    validUntil: '2025-11-30',
    category: 'Restaurants',
    location: 'Central Kolkata',
    href: '/restaurants?category=fine-dining'
  },
  {
    id: '3',
    title: 'Heritage Tour Package',
    description: 'Complete guided tour of Kolkata\'s heritage sites',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    discount: '40% OFF',
    validUntil: '2025-10-31',
    category: 'Tours',
    location: 'Heritage District',
    href: '/visiting?category=heritage'
  },
  {
    id: '4',
    title: 'Sports Complex Membership',
    description: 'Annual membership with unlimited access to all facilities',
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    discount: '25% OFF',
    validUntil: '2025-12-15',
    category: 'Sports',
    location: 'Salt Lake',
    href: '/sports?type=membership'
  },
  {
    id: '5',
    title: 'Event Tickets Bundle',
    description: 'Pack of 5 event tickets for cultural festivals',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    discount: '3 for 2',
    validUntil: '2025-09-30',
    category: 'Events',
    location: 'Victoria Memorial',
    href: '/events?category=cultural'
  }
]

export default function PromotionSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === promotions.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? promotions.length - 1 : currentIndex - 1)
  }

  const goToNext = () => {
    setCurrentIndex(currentIndex === promotions.length - 1 ? 0 : currentIndex + 1)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <section className="py-16 bg-gradient-to-r from-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Exclusive Promotions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover amazing deals and special offers across Kolkata&apos;s best experiences
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          <div className="overflow-hidden rounded-2xl shadow-2xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {promotions.map((promotion) => (
                <div key={promotion.id} className="w-full flex-shrink-0">
                  <div className="relative h-96 md:h-[500px]">
                    <Image
                      src={promotion.image}
                      alt={promotion.title}
                      fill
                      className="object-cover"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

                    {/* Content */}
                    <div className="absolute inset-0 flex items-center">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                        <div className="max-w-lg">
                          <div className="flex items-center space-x-2 mb-4">
                            <Tag className="h-5 w-5 text-orange-400" />
                            <span className="text-orange-400 font-semibold text-sm uppercase tracking-wide">
                              {promotion.category}
                            </span>
                          </div>

                          <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            {promotion.title}
                          </h3>

                          <p className="text-xl text-gray-200 mb-6">
                            {promotion.description}
                          </p>

                          <div className="flex items-center space-x-4 mb-6">
                            <div className="flex items-center space-x-1 text-gray-300">
                              <MapPin className="h-4 w-4" />
                              <span className="text-sm">{promotion.location}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-gray-300">
                              <Calendar className="h-4 w-4" />
                              <span className="text-sm">Valid until {new Date(promotion.validUntil).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="bg-orange-500 text-white px-6 py-3 rounded-full font-bold text-lg">
                              {promotion.discount}
                            </div>
                            <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                              <Link href={promotion.href}>
                                Claim Deal
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200"
            aria-label="Previous promotion"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200"
            aria-label="Next promotion"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2 mt-6">
            {promotions.map((promotion, index) => (
              <button
                key={`dot-${promotion.id}-${index}`}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? 'bg-orange-500 scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to promotion ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <Button asChild variant="outline" size="lg">
            <Link href="/promotions">
              View All Promotions
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
