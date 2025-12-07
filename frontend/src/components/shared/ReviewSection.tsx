"use client"

import React, { useState, useEffect } from 'react'
import { Star, ThumbsUp, Flag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { fetchAPI } from '@/lib/backend-api'

interface ReviewSectionProps {
  readonly entityId: string
  readonly entityType: 'hotel' | 'restaurant' | 'attraction' | 'event' | 'sports'
  readonly averageRating?: number
  readonly totalReviews?: number
}

interface Review {
  _id: string
  rating: number
  title: string
  comment: string
  authorName: string
  createdAt: string
  helpful: number
  verified: boolean
}

export default function ReviewSection({
  entityId,
  entityType,
  averageRating = 0,
  totalReviews = 0
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
    authorName: '',
    authorEmail: ''
  })

  useEffect(() => {
    fetchReviews()
  }, [entityId, entityType])

  const fetchReviews = async () => {
    try {
      const response = await fetchAPI(
        '/api/reviews?entityId=' + entityId + '&entityType=' + entityType
      )
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetchAPI('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          entityId,
          entityType
        }),
      })

      if (response.ok) {
        setShowReviewForm(false)
        setFormData({ rating: 5, title: '', comment: '', authorName: '', authorEmail: '' })
        fetchReviews()
      }
    } catch (error) {
      console.error('Failed to submit review:', error)
    }
  }

  const StarRating = ({ rating, interactive = false, onChange }: {
    rating: number
    interactive?: boolean
    onChange?: (rating: number) => void
  }) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={'text-lg ' + (interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default')}
          onClick={interactive && onChange ? () => onChange(star) : undefined}
          disabled={!interactive}
        >
          <Star
            className={'w-5 h-5 ' + (star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300')}
          />
        </button>
      ))}
    </div>
  )

  const getReviewerName = (review: Review) => {
    if (review.authorName) {
      return review.authorName
    }
    return 'Anonymous'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return <div className="text-center py-8">Loading reviews...</div>
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Reviews & Ratings</span>
            <Button
              onClick={() => setShowReviewForm(!showReviewForm)}
              variant="outline"
              size="sm"
            >
              Write a Review
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500">{averageRating.toFixed(1)}</div>
              <StarRating rating={Math.round(averageRating)} />
              <div className="text-sm text-gray-600 mt-1">{totalReviews} reviews</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Form */}
      {showReviewForm && (
        <Card>
          <CardHeader>
            <CardTitle>Write Your Review</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <Label htmlFor="rating">Rating</Label>
                <StarRating
                  rating={formData.rating}
                  interactive
                  onChange={(rating) => setFormData({ ...formData, rating })}
                />
              </div>

              <div>
                <Label htmlFor="title">Review Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Summarize your experience"
                  required
                />
              </div>

              <div>
                <Label htmlFor="comment">Your Review</Label>
                <Textarea
                  id="comment"
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Share your experience..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="authorName">Your Name</Label>
                  <Input
                    id="authorName"
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="authorEmail">Email (optional)</Label>
                  <Input
                    id="authorEmail"
                    type="email"
                    value={formData.authorEmail}
                    onChange={(e) => setFormData({ ...formData, authorEmail: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowReviewForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Submit Review
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-600">No reviews yet. Be the first to share your experience!</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review._id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <StarRating rating={review.rating} />
                      <span className="font-medium">{getReviewerName(review)}</span>
                      {review.verified && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Verified
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold mb-2">{review.title}</h4>
                    <p className="text-gray-700 mb-3">{review.comment}</p>
                    <div className="text-sm text-gray-500">
                      {formatDate(review.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" className="text-gray-600">
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    Helpful ({review.helpful})
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-600">
                    <Flag className="w-4 h-4 mr-1" />
                    Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
