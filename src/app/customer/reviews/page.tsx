"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Star,
  Search,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  ThumbsUp,
  MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'
import { useApi } from '@/lib/api-client'

interface Review {
  _id: string
  entityType: string
  entityId: string
  entityName?: string
  rating: number
  title?: string
  comment: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
  isEdited?: boolean
  lastEditedAt?: string
  visitDate?: string
  images?: string[]
  likes?: number
  moderationNotes?: string
}

export default function CustomerReviews() {
  const { user, isAuthenticated } = useAuth()
  const api = useApi()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [formData, setFormData] = useState({
    entityType: 'hotel',
    entityId: '',
    entityName: '',
    rating: 5,
    title: '',
    comment: '',
    visitDate: ''
  })

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchReviews()
    }
  }, [isAuthenticated, user])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const result = await api.get<{ reviews: Review[] }>('/api/customer/reviews')

      if (result.data) {
        const data = result.data as { reviews?: Review[] }
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const result = await api.post('/api/reviews', {
        entityType: formData.entityType,
        entityId: formData.entityId,
        entityName: formData.entityName,
        rating: formData.rating,
        title: formData.title,
        comment: formData.comment,
        visitDate: formData.visitDate || undefined
      })

      if (result.data) {
        setIsCreateDialogOpen(false)
        setFormData({
          entityType: 'hotel',
          entityId: '',
          entityName: '',
          rating: 5,
          title: '',
          comment: '',
          visitDate: ''
        })
        await fetchReviews()
        alert('Review submitted successfully! It will be published after moderation.')
      } else {
        alert('Failed to submit review: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error creating review:', error)
      alert('Error submitting review')
    }
  }

  const handleEditReview = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingReview) return

    try {
      const result = await api.put(`/api/reviews/${editingReview._id}`, {
        rating: formData.rating,
        title: formData.title,
        comment: formData.comment
      })

      if (result.data) {
        setIsEditDialogOpen(false)
        setEditingReview(null)
        await fetchReviews()
        alert('Review updated successfully! It will be re-reviewed for approval.')
      } else {
        alert('Failed to update review: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error updating review:', error)
      alert('Error updating review')
    }
  }

  const handleDeleteReview = async (review: Review) => {
    if (!confirm(`Are you sure you want to delete your review for "${review.entityName || 'this item'}"?`)) {
      return
    }

    try {
      const result = await api.delete(`/api/reviews/${review._id}`)

      if (result.data) {
        await fetchReviews()
        alert('Review deleted successfully')
      } else {
        alert('Failed to delete review: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      alert('Error deleting review')
    }
  }

  const openEditDialog = (review: Review) => {
    setEditingReview(review)
    setFormData({
      entityType: review.entityType,
      entityId: review.entityId,
      entityName: review.entityName || '',
      rating: review.rating,
      title: review.title || '',
      comment: review.comment,
      visitDate: review.visitDate ? new Date(review.visitDate).toISOString().split('T')[0] : ''
    })
    setIsEditDialogOpen(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const renderStars = (rating: number, editable = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            } ${editable ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => editable && onChange?.(i + 1)}
          />
        ))}
      </div>
    )
  }

  // Filter reviews
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.entityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || review.status === statusFilter
    const matchesRating = !ratingFilter || review.rating.toString() === ratingFilter

    return matchesSearch && matchesStatus && matchesRating
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your reviews...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to view your reviews.</p>
          <Button
            className="bg-orange-600 hover:bg-orange-700 text-white"
            onClick={() => window.location.href = '/auth/login'}
          >
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  if (user && user.role !== 'customer') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">This page is only accessible to customers.</p>
          <Button
            className="bg-orange-600 hover:bg-orange-700 text-white"
            onClick={() => window.location.href = '/'}
          >
            Go to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
          <p className="text-gray-600 mt-1">Manage your reviews and ratings</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Write Review
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Write a Review</DialogTitle>
              <DialogDescription>
                Share your experience and help others discover great places.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateReview} className="space-y-4">
              <div>
                <Label htmlFor="entityType">Type</Label>
                <Select value={formData.entityType} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, entityType: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='bg-white'>
                    <SelectItem value="hotel">Hotel</SelectItem>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="attraction">Attraction</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="entityName">Place Name</Label>
                <Input
                  id="entityName"
                  value={formData.entityName}
                  onChange={(e) => setFormData(prev => ({ ...prev, entityName: e.target.value }))}
                  placeholder="Enter the name of the place"
                  required
                />
              </div>
              <div>
                <Label htmlFor="rating">Rating</Label>
                <div className="mt-1">
                  {renderStars(formData.rating, true, (rating) => 
                    setFormData(prev => ({ ...prev, rating }))
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief summary of your experience"
                />
              </div>
              <div>
                <Label htmlFor="comment">Review</Label>
                <Textarea
                  id="comment"
                  value={formData.comment}
                  onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Share your detailed experience..."
                  rows={4}
                  required
                />
              </div>
              <div>
                <Label htmlFor="visitDate">Visit Date (Optional)</Label>
                <Input
                  id="visitDate"
                  type="date"
                  value={formData.visitDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, visitDate: e.target.value }))}
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">
                  Submit Review
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className='bg-white'>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent className='bg-white'>
                <SelectItem value="">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {reviews.length === 0 ? 'No reviews yet' : 'No reviews match your filters'}
              </h3>
              <p className="text-gray-600 mb-4">
                {reviews.length === 0
                  ? 'Start sharing your experiences by writing your first review!'
                  : 'Try adjusting your search or filters'
                }
              </p>
              {reviews.length === 0 && (
                <Button
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Write First Review
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredReviews.map((review) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-lg font-semibold">
                          {review.entityName || `${review.entityType} Review`}
                        </h3>
                        <Badge className={getStatusColor(review.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(review.status)}
                            <span className="capitalize">{review.status}</span>
                          </div>
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 mb-3">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                        {review.visitDate && (
                          <span className="text-sm text-gray-500">
                            Visited: {new Date(review.visitDate).toLocaleDateString()}
                          </span>
                        )}
                        {review.isEdited && (
                          <Badge variant="outline" className="text-xs">
                            Edited
                          </Badge>
                        )}
                      </div>

                      {review.title && (
                        <h4 className="font-medium mb-2">{review.title}</h4>
                      )}

                      <p className="text-gray-700 mb-3">{review.comment}</p>

                      {review.likes && review.likes > 0 && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{review.likes} helpful</span>
                        </div>
                      )}

                      {review.moderationNotes && review.status === 'rejected' && (
                        <div className="mt-3 p-3 bg-red-50 rounded-md">
                          <p className="text-sm text-red-800">
                            <strong>Moderation Notes:</strong> {review.moderationNotes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(review)}
                        disabled={review.status === 'approved'}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteReview(review)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
            <DialogDescription>
              Update your review. It will be re-reviewed for approval.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditReview} className="space-y-4">
            <div>
              <Label htmlFor="edit-rating">Rating</Label>
              <div className="mt-1">
                {renderStars(formData.rating, true, (rating) => 
                  setFormData(prev => ({ ...prev, rating }))
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="edit-title">Title (Optional)</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief summary of your experience"
              />
            </div>
            <div>
              <Label htmlFor="edit-comment">Review</Label>
              <Textarea
                id="edit-comment"
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your detailed experience..."
                rows={4}
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">
                Update Review
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
