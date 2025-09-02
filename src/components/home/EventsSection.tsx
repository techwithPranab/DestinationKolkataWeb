"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Calendar, MapPin, Clock, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Event {
  id: string
  title: string
  description: string
  image: string
  date?: string
  time: string
  location: string
  category: string
  attendees?: number
  price: string
  href: string
}

const events: Event[] = [
  {
    id: '1',
    title: 'Durga Puja Festival 2025',
    description: 'Experience the grand Durga Puja celebrations with traditional pandals and cultural performances',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    date: '2025-10-15',
    time: '6:00 PM',
    location: 'Victoria Memorial',
    category: 'Festival',
    attendees: 5000,
    price: 'Free',
    href: '/events/durga-puja-2025'
  },
  {
    id: '2',
    title: 'Kolkata Literary Meet',
    description: 'Annual literary festival featuring renowned authors, poets, and cultural discussions',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    date: '2025-11-08',
    time: '10:00 AM',
    location: 'Rabindra Sadan',
    category: 'Cultural',
    attendees: 800,
    price: '₹500',
    href: '/events/literary-meet-2025'
  },
  {
    id: '3',
    title: 'Bengali New Year Celebration',
    description: 'Traditional Pohela Boishakh celebrations with folk music, dance, and cultural performances',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    date: '2025-04-14',
    time: '8:00 AM',
    location: 'College Square',
    category: 'Cultural',
    attendees: 2000,
    price: 'Free',
    href: '/events/pohela-boishakh-2025'
  },
  {
    id: '4',
    title: 'Kolkata Food Festival',
    description: 'Culinary extravaganza featuring the best street food and traditional Bengali cuisine',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    date: '2025-12-20',
    time: '12:00 PM',
    location: 'Maidan',
    category: 'Food',
    attendees: 3000,
    price: '₹200',
    href: '/events/food-festival-2025'
  },
  {
    id: '5',
    title: 'Classical Music Concert',
    description: 'Evening of traditional Indian classical music featuring renowned artists',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    date: '2025-09-25',
    time: '7:00 PM',
    location: 'Nazrul Manch',
    category: 'Music',
    attendees: 600,
    price: '₹800',
    href: '/events/classical-music-2025'
  }
]

export default function EventsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === events.length - 1 ? 0 : prevIndex + 1
      )
    }, 6000) // Change slide every 6 seconds

    return () => clearInterval(interval)
  }, [])

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? events.length - 1 : currentIndex - 1)
  }

  const goToNext = () => {
    setCurrentIndex(currentIndex === events.length - 1 ? 0 : currentIndex + 1)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  // Helper function to format date
  const formatEventDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'Date TBD'

    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Invalid Date'
      }
      return date.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return 'Invalid Date'
    }
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Latest Events
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don&apos;t miss out on exciting events, festivals, and cultural experiences in Kolkata
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          <div className="overflow-hidden rounded-2xl shadow-2xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {events.map((event) => (
                <div key={event.id} className="w-full flex-shrink-0">
                  <div className="relative h-96 md:h-[500px]">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="max-w-4xl mx-auto">
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                          <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {event.category || 'Event'}
                          </span>
                          <div className="flex items-center text-white text-sm">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>
                              {formatEventDate(event.date)}
                            </span>
                          </div>
                        </div>

                        <h3 className="text-3xl md:text-4xl font-bold text-white mb-3">
                          {event.title || 'Event Title'}
                        </h3>

                        <p className="text-lg text-gray-200 mb-6 max-w-2xl">
                          {event.description || 'Event description coming soon.'}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="flex items-center text-white">
                            <Clock className="h-5 w-5 mr-2" />
                            <span>{event.time || 'TBD'}</span>
                          </div>
                          <div className="flex items-center text-white">
                            <MapPin className="h-5 w-5 mr-2" />
                            <span>{event.location || 'Location TBD'}</span>
                          </div>
                          <div className="flex items-center text-white">
                            <Users className="h-5 w-5 mr-2" />
                            <span>{(event.attendees || 0).toLocaleString()} attending</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold text-orange-400">
                            {event.price || 'Price TBD'}
                          </div>
                          <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
                            <Link href={event.href || '/events'}>
                              Get Tickets
                            </Link>
                          </Button>
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
            aria-label="Previous event"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200"
            aria-label="Next event"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2 mt-6">
            {events.map((event, index) => (
              <button
                key={`event-dot-${event.id}-${index}`}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? 'bg-orange-500 scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to event ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <Button asChild variant="outline" size="lg">
            <Link href="/events">
              View All Events
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
