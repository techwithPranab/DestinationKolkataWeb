'use client'

import { Star, MessageSquare, ThumbsUp, ThumbsDown, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    feedbackType: '',
    subject: '',
    message: '',
    email: '',
    rating: 0
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({
      ...prev,
      rating
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({
          feedbackType: '',
          subject: '',
          message: '',
          email: '',
          rating: 0
        })
      } else {
        const errorData = await response.json()
        setSubmitStatus('error')
        setErrorMessage(errorData.message || 'Failed to submit feedback. Please try again.')
      }
    } catch (error) {
      console.error('Feedback form submission error:', error)
      setSubmitStatus('error')
      setErrorMessage('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Share Your Feedback</h1>
          <p className="text-xl text-orange-100 max-w-2xl mx-auto">
            Your opinion matters! Help us improve Destination Kolkata and make your experience even better.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Quick Feedback */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Quick Feedback</h2>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-orange-500" />
                  <span>Rate Your Experience</span>
                </CardTitle>
                <CardDescription>
                  How would you rate your overall experience with Destination Kolkata?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(star)}
                      className={`${formData.rating >= star ? 'text-orange-500' : 'text-gray-300'} hover:text-orange-500 transition-colors`}
                    >
                      <Star className="h-8 w-8 fill-current" />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500">Click on the stars to rate</p>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ThumbsUp className="h-5 w-5 text-green-500" />
                  <span>What did you like?</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'Easy to navigate',
                    'Accurate information',
                    'Beautiful design',
                    'Helpful content',
                    'Fast loading',
                    'Mobile friendly'
                  ].map((item) => (
                    <button
                      key={item}
                      className="p-3 text-left bg-white/90 backdrop-blur-sm shadow-lg rounded-lg hover:shadow-orange-200 hover:bg-orange-50 transition-all duration-200"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ThumbsDown className="h-5 w-5 text-red-500" />
                  <span>What can we improve?</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'More photos',
                    'More details',
                    'Better search',
                    'More categories',
                    'Faster updates',
                    'More features'
                  ].map((item) => (
                    <button
                      key={item}
                      className="p-3 text-left bg-white/90 backdrop-blur-sm shadow-lg rounded-lg hover:shadow-orange-200 hover:bg-orange-50 transition-all duration-200"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Feedback */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-orange-500" />
                  <span>Detailed Feedback</span>
                </CardTitle>
                <CardDescription>
                  Share your detailed thoughts, suggestions, or report any issues you&apos;ve encountered.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="feedbackType" className="block text-sm font-medium text-gray-700 mb-1">
                      Feedback Type *
                    </label>
                    <select
                      id="feedbackType"
                      name="feedbackType"
                      value={formData.feedbackType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-white/90 backdrop-blur-sm shadow-lg rounded-md focus:ring-2 focus:ring-orange-500 focus:shadow-orange-200 transition-all duration-200"
                    >
                      <option value="">Select feedback type</option>
                      <option value="general">General Feedback</option>
                      <option value="bug">Bug Report</option>
                      <option value="feature">Feature Request</option>
                      <option value="content">Content Suggestion</option>
                      <option value="design">Design Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-white/90 backdrop-blur-sm shadow-lg rounded-md focus:ring-2 focus:ring-orange-500 focus:shadow-orange-200 transition-all duration-200"
                      placeholder="Brief description of your feedback"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Feedback *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={8}
                      required
                      className="w-full px-3 py-2 bg-white/90 backdrop-blur-sm shadow-lg rounded-md focus:ring-2 focus:ring-orange-500 focus:shadow-orange-200 transition-all duration-200"
                      placeholder="Please provide as much detail as possible..."
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/90 backdrop-blur-sm shadow-lg rounded-md focus:ring-2 focus:ring-orange-500 focus:shadow-orange-200 transition-all duration-200"
                      placeholder="your@email.com"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Provide your email if you&apos;d like us to follow up on your feedback.
                    </p>
                  </div>

                  {submitStatus === 'success' && (
                    <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md">
                      <CheckCircle className="h-5 w-5" />
                      <span>Thank you for your feedback! We&apos;ll review it shortly.</span>
                    </div>
                  )}

                  {submitStatus === 'error' && (
                    <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                      <AlertCircle className="h-5 w-5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <Button type="submit" disabled={isSubmitting} className="w-full bg-orange-500 hover:bg-orange-600">
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Feedback
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Updates */}
        <div className="mt-16">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Recent Improvements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Enhanced Search</h4>
                <p className="text-gray-600 text-sm">
                  Improved search functionality with better filters and faster results.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">User Reviews</h4>
                <p className="text-gray-600 text-sm">
                  Added user reviews and ratings for better decision making.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <ThumbsUp className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Mobile Experience</h4>
                <p className="text-gray-600 text-sm">
                  Optimized mobile experience with faster loading and better navigation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Thank You Message */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Thank you for taking the time to share your feedback! Your input helps us make Destination Kolkata better for everyone.
          </p>
        </div>
      </div>
    </div>
  )
}
