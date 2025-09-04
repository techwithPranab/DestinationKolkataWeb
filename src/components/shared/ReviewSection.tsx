"use client"

import React, { useState, useEffect } from 'react'
import { Star, ThumbsUp, User, MessageSquare, Calendar, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'

interface Review {
  _id: string
  rating: number
  title?: string
  comment: string
  authorName?: string
  authorEmail?: string
  user?: {
    firstName?: string
    lastName?: string
    name?: string
    email: string
    profile?: {
      avatar?: string
    }
  }
  verified: boolean
  helpful: number
  createdAt: string
  status: string
}

interface ReviewSectionProps {
  readonly entityId: string
  readonly entityType: 'hotel' | 'restaurant' | 'attraction' | 'event' | 'sports'
  readonly averageRating?: number
  readonly totalReviews?: number
}

interface ReviewFormData {
  rating: number
  title: string
  comment: string
  authorName: string
  authorEmail: string
  verified: boolean
}

export default function ReviewSection({
  entityId,
  entityType,
  averageRating = 0,
  totalReviews = 0
}: ReviewSectionProps) {
  const { isAuthenticated } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  })

  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 5,
    title: '',
    comment: '',
    authorName: '',
    authorEmail: '',
    verified: true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load reviews on component mount
  useEffect(() => {
    loadReviews()
  }, [entityId, entityType]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadReviews = async (page = 1) => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/reviews?entityId=${entityId}&entityType=${entityType}&page=${page}&limit=5`
      )

      if (response.ok) {
        const result = await response.json()
        setReviews(result.data.reviews)
        setPagination(result.data.pagination)
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({
      ...prev,
      rating
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = 'Rating must be between 1 and 5'
    }

    if (!formData.comment.trim()) {
      newErrors.comment = 'Review comment is required'
    }

    if (formData.comment.length < 10) {
      newErrors.comment = 'Review must be at least 10 characters long'
    }

    if (!isAuthenticated) {
      if (!formData.authorName.trim()) {
        newErrors.authorName = 'Name is required'
      }

      if (!formData.authorEmail.trim()) {
        newErrors.authorEmail = 'Email is required'
      } else if (!/\S+@\S+\.\S+/.test(formData.authorEmail)) {
        newErrors.authorEmail = 'Please enter a valid email address'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          entityId,
          entityType,
          ...formData
        })
      })

      const result = await response.json()

      if (response.ok) {
        alert('Review submitted successfully! It will be published after moderation.')
        setShowReviewForm(false)
        setFormData({
          rating: 5,
          title: '',
          comment: '',
          authorName: '',
          authorEmail: '',
          verified: true
        })

        // Reload reviews to show the new one (if approved)
        loadReviews()
      } else {
        alert(result.error || 'Failed to submit review')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`text-lg ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
            onClick={interactive && onChange ? () => onChange(star) : undefined}
            disabled={!interactive}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getReviewerName = (review: Review) => {
    if (review.user) {
      return review.user.firstName && review.user.lastName
        ? `${review.user.firstName} ${review.user.lastName}`
        : review.user.name || 'Anonymous'
    }
    return review.authorName || 'Anonymous'
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Reviews & Ratings</span>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-500">
                  {averageRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center mb-1">
                  {renderStars(Math.round(averageRating))}
                </div>
                <div className="text-sm text-gray-600">
                  {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Write Review Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Customer Reviews</h3>
        <Button
          onClick={() => setShowReviewForm(!showReviewForm)}
          variant={showReviewForm ? "outline" : "default"}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          {showReviewForm ? 'Cancel' : 'Write a Review'}
        </Button>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <Card>
          <CardHeader>
            <CardTitle>Write Your Review</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Rating */}
              <div>
                <Label className="text-base font-medium">Rating</Label>
                <div className="mt-2">
                  {renderStars(formData.rating, true, handleRatingChange)}
                </div>
                {errors.rating && (
                  <p className="text-red-500 text-sm mt-1">{errors.rating}</p>
                )}
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title">Review Title (Optional)</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Summarize your experience"
                  className="mt-1"
                />
              </div>

              {/* Comment */}
              <div>
                <Label htmlFor="comment">Your Review</Label>
                <Textarea
                  id="comment"
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  placeholder="Share your experience with this place..."
                  rows={4}
                  className="mt-1"
                  required
                />
                {errors.comment && (
                  <p className="text-red-500 text-sm mt-1">{errors.comment}</p>
                )}
              </div>

              {/* Anonymous user fields */}
              {!isAuthenticated && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="authorName">Your Name</Label>
                      <Input
                        id="authorName"
                        name="authorName"
                        value={formData.authorName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="mt-1"
                        required
                      />
                      {errors.authorName && (
                        <p className="text-red-500 text-sm mt-1">{errors.authorName}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="authorEmail">Email Address</Label>
                      <Input
                        id="authorEmail"
                        name="authorEmail"
                        type="email"
                        value={formData.authorEmail}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        className="mt-1"
                        required
                      />
                      {errors.authorEmail && (
                        <p className="text-red-500 text-sm mt-1">{errors.authorEmail}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Your email will not be displayed publicly and will only be used for verification purposes.
                  </p>
                </>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowReviewForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading reviews...</p>
          </div>
        ) : (
          <>
            {reviews.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                  <p className="text-gray-600">Be the first to share your experience!</p>
                </CardContent>
              </Card>
            ) : (
              reviews.map((review) => (
                <Card key={review._id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {review.user?.profile?.avatar ? (
                            <img
                              src={review.user.profile.avatar}
                              alt={getReviewerName(review)}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <User className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">
                              {getReviewerName(review)}
                            </h4>
                            {review.verified && (
                              <Badge variant="secondary" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            {renderStars(review.rating)}
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {review.title && (
                      <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
                    )}

                    <p className="text-gray-700 mb-4">{review.comment}</p>

                    <div className="flex items-center justify-between">
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        Helpful ({review.helpful})
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => loadReviews(pagination.page - 1)}
            disabled={!pagination.hasPrev}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 py-2 text-sm text-gray-700">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => loadReviews(pagination.page + 1)}
            disabled={!pagination.hasNext}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
