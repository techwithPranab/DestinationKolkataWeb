"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Review {
  id: string
  name: string
  location: string
  rating: number
  review: string
  avatar?: string
  date: string
  category: string
}

const reviews: Review[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    location: 'Mumbai',
    rating: 5,
    review: 'Amazing experience in Kolkata! The food was incredible and the hospitality was unmatched. Will definitely visit again.',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    date: '2024-08-15',
    category: 'Food & Culture'
  },
  {
    id: '2',
    name: 'Rahul Kumar',
    location: 'Delhi',
    rating: 5,
    review: 'The Victoria Memorial is breathtaking! The guide was very knowledgeable and made our trip memorable.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    date: '2024-08-10',
    category: 'Historical Sites'
  },
  {
    id: '3',
    name: 'Anjali Patel',
    location: 'Ahmedabad',
    rating: 4,
    review: 'Stayed at a wonderful hotel near Park Street. The location was perfect for exploring the city. Highly recommended!',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    date: '2024-08-05',
    category: 'Accommodation'
  },
  {
    id: '4',
    name: 'Vikram Singh',
    location: 'Jaipur',
    rating: 5,
    review: 'The street food scene in Kolkata is phenomenal! Tried so many delicious dishes. The city has such rich culture.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    date: '2024-07-28',
    category: 'Street Food'
  },
  {
    id: '5',
    name: 'Meera Joshi',
    location: 'Pune',
    rating: 5,
    review: 'Attended the Durga Puja celebrations and it was magical! The decorations, lights, and atmosphere were incredible.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    date: '2024-07-20',
    category: 'Festivals'
  },
  {
    id: '6',
    name: 'Arjun Reddy',
    location: 'Hyderabad',
    rating: 4,
    review: 'Great shopping experience at Gariahat Market. Found some amazing local handicrafts and souvenirs.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    date: '2024-07-15',
    category: 'Shopping'
  }
]

export default function CustomerReviewCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000) // Change review every 5 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextReview = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
    )
  }

  const prevReview = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? reviews.length - 1 : prevIndex - 1
    )
  }

  const goToReview = (index: number) => {
    setCurrentIndex(index)
  }

  const currentReview = reviews[currentIndex]

  return (
    <section className="py-16 bg-gradient-to-br from-orange-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Visitors Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the experiences of travelers who have explored Kolkata through our platform
          </p>
        </motion.div>

        {/* Review Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="p-8 md:p-12"
              >
                <Card className="border-0 shadow-none bg-transparent">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <img
                            src={currentReview.avatar || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80`}
                            alt={currentReview.name}
                            className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-4 border-orange-100"
                          />
                          <div className="absolute -top-2 -right-2 bg-orange-500 rounded-full p-1">
                            <Quote className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Review Content */}
                      <div className="flex-1 text-center md:text-left">
                        {/* Rating */}
                        <div className="flex justify-center md:justify-start mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={`star-${currentReview.id}-${i}`}
                              className={`w-5 h-5 ${
                                i < currentReview.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Review Text */}
                        <blockquote className="text-lg md:text-xl text-gray-700 mb-6 leading-relaxed">
                          &ldquo;{currentReview.review}&rdquo;
                        </blockquote>

                        {/* Author Info */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">
                              {currentReview.name}
                            </h4>
                            <p className="text-gray-600">
                              {currentReview.location} • {currentReview.category}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {new Date(currentReview.date).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center items-center mt-8 gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={prevReview}
              className="rounded-full p-2 hover:bg-orange-50 hover:border-orange-300"
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {/* Dots Indicator */}
            <div className="flex gap-2">
              {reviews.map((review, index) => (
                <button
                  key={`dot-${review.id}`}
                  onClick={() => goToReview(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-orange-500 scale-125'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  onMouseEnter={() => setIsAutoPlaying(false)}
                  onMouseLeave={() => setIsAutoPlaying(true)}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={nextReview}
              className="rounded-full p-2 hover:bg-orange-50 hover:border-orange-300"
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Auto-play Toggle */}
          <div className="text-center mt-4">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              {isAutoPlaying ? 'Pause Auto-play' : 'Resume Auto-play'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">4.8/5</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">2,500+</div>
            <div className="text-gray-600">Happy Visitors</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">98%</div>
            <div className="text-gray-600">Satisfaction Rate</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
            <div className="text-gray-600">Support Available</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
