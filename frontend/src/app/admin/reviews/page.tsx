'use client'
import { fetchAuthenticatedAPI } from '@/lib/backend-api'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Eye, Trash2, Star, User, Calendar, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface Review {
  _id: string
  entityId: string
  entityType: 'hotel' | 'restaurant' | 'attraction' | 'event' | 'sports'
  user?: {
    firstName?: string
    lastName?: string
    name?: string
    email: string
  }
  authorName?: string
  authorEmail?: string
  rating: number
  title?: string
  comment: string
  verified: boolean
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
}

export default function AdminReviewsPage() {
  const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
  
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadReviews()
  }, [statusFilter, entityTypeFilter, currentPage]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadReviews = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      })

      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (entityTypeFilter !== 'all') params.append('entityType', entityTypeFilter)

      const response = await fetchAuthenticatedAPI(`/api/admin/reviews?${params}`)
      if (response.ok) {
        const result = await response.json()
        setReviews(result.data.reviews)
        setTotalPages(result.data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (reviewId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const response = await fetchAuthenticatedAPI('/api/admin/reviews', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reviewId,
          status: newStatus
        })
      })

      if (response.ok) {
        // Update the review in the local state
        setReviews(prev => prev.map(review =>
          review._id === reviewId
            ? { ...review, status: newStatus }
            : review
        ))
        alert(`Review ${newStatus} successfully!`)
      } else {
        alert('Failed to update review status')
      }
    } catch (error) {
      console.error('Error updating review status:', error)
      alert('Failed to update review status')
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return

    try {
      const response = await fetchAuthenticatedAPI(`/api/admin/reviews?reviewId=${reviewId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setReviews(prev => prev.filter(review => review._id !== reviewId))
        alert('Review deleted successfully!')
      } else {
        alert('Failed to delete review')
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      alert('Failed to delete review')
    }
  }

  const getReviewerName = (review: Review) => {
    if (review.user) {
      return review.user.firstName && review.user.lastName
        ? `${review.user.firstName} ${review.user.lastName}`
        : review.user.name || 'Registered User'
    }
    return review.authorName || 'Anonymous'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Review Management</h1>
        <div className="flex items-center space-x-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className='bg-white'>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Entity Type" />
            </SelectTrigger>
            <SelectContent className='bg-white'>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="hotel">Hotels</SelectItem>
              <SelectItem value="restaurant">Restaurants</SelectItem>
              <SelectItem value="attraction">Attractions</SelectItem>
              <SelectItem value="event">Events</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
                <p className="text-gray-600">No reviews match the current filters.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {getReviewerName(review)}
                            </h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              {renderStars(review.rating)}
                              <span>•</span>
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {formatDate(review.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline" className="capitalize">
                              {review.entityType}
                            </Badge>
                            {getStatusBadge(review.status)}
                            {review.verified && (
                              <Badge variant="secondary" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>

                          {review.title && (
                            <h5 className="font-medium text-gray-900 mb-1">{review.title}</h5>
                          )}

                          <p className="text-gray-700 text-sm leading-relaxed">
                            {review.comment.length > 200
                              ? `${review.comment.substring(0, 200)}...`
                              : review.comment
                            }
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedReview(review)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Review Details</DialogTitle>
                            </DialogHeader>
                            {selectedReview && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Reviewer</Label>
                                    <p className="font-medium">{getReviewerName(selectedReview)}</p>
                                    {selectedReview.authorEmail && (
                                      <p className="text-sm text-gray-600">{selectedReview.authorEmail}</p>
                                    )}
                                  </div>
                                  <div>
                                    <Label>Entity Type</Label>
                                    <p className="font-medium capitalize">{selectedReview.entityType}</p>
                                  </div>
                                </div>

                                <div>
                                  <Label>Rating</Label>
                                  <div className="mt-1">
                                    {renderStars(selectedReview.rating)}
                                  </div>
                                </div>

                                {selectedReview.title && (
                                  <div>
                                    <Label>Title</Label>
                                    <p className="font-medium">{selectedReview.title}</p>
                                  </div>
                                )}

                                <div>
                                  <Label>Review</Label>
                                  <Textarea
                                    value={selectedReview.comment}
                                    readOnly
                                    rows={4}
                                    className="mt-1"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Status</Label>
                                    <div className="mt-1">
                                      {getStatusBadge(selectedReview.status)}
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Submitted</Label>
                                    <p className="text-sm">{formatDate(selectedReview.createdAt)}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {review.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(review._id, 'approved')}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(review._id, 'rejected')}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteReview(review._id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 py-2 text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
