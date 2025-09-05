"use client"

import React, { useState, useEffect, useCallback } from 'react'
import {
  MessageSquare,
  Search,
  Eye,
  CheckCircle,
  Star,
  User,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Feedback {
  _id: string
  type: 'general' | 'bug' | 'feature' | 'content' | 'design' | 'other'
  subject: string
  message: string
  email?: string
  rating?: number
  likes?: string[]
  dislikes?: string[]
  status: 'new' | 'reviewed' | 'implemented' | 'declined'
  priority: 'low' | 'medium' | 'high'
  category: string
  createdAt: string
  updatedAt: string
  reviewedAt?: string
  reviewedBy?: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  notes?: string
}

const feedbackTypes = [
  { value: 'general', label: 'General', color: 'bg-blue-100 text-blue-800' },
  { value: 'bug', label: 'Bug Report', color: 'bg-red-100 text-red-800' },
  { value: 'feature', label: 'Feature Request', color: 'bg-green-100 text-green-800' },
  { value: 'content', label: 'Content', color: 'bg-purple-100 text-purple-800' },
  { value: 'design', label: 'Design', color: 'bg-pink-100 text-pink-800' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' }
]

const statusOptions = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
  { value: 'reviewed', label: 'Reviewed', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'implemented', label: 'Implemented', color: 'bg-green-100 text-green-800' },
  { value: 'declined', label: 'Declined', color: 'bg-red-100 text-red-800' }
]

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' }
]

export default function FeedbackAdmin() {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalFeedback, setTotalFeedback] = useState(0)
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [updating, setUpdating] = useState(false)

  const fetchFeedback = useCallback(async (search = searchTerm) => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        search
      })

      if (filterType) params.append('type', filterType)
      if (filterStatus) params.append('status', filterStatus)
      if (filterPriority) params.append('priority', filterPriority)

      const response = await fetch(`/api/admin/feedback?${params}`)
      const data = await response.json()

      if (data.success) {
        setFeedback(data.data)
        setTotalPages(data.pagination.totalPages)
        setTotalFeedback(data.pagination.total)
      }
    } catch (error) {
      console.error('Error fetching feedback:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, filterType, filterStatus, filterPriority, searchTerm])

  useEffect(() => {
    fetchFeedback()
  }, [currentPage, filterType, filterStatus, filterPriority, fetchFeedback])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchFeedback()
  }

  const handleViewFeedback = (item: Feedback) => {
    setSelectedFeedback(item)
    setIsViewModalOpen(true)
  }

  const handleUpdateFeedback = (item: Feedback) => {
    setSelectedFeedback(item)
    setIsUpdateModalOpen(true)
  }

  const handleStatusUpdate = async (id: string, status: string, priority: string, notes: string) => {
    setUpdating(true)
    try {
      const response = await fetch('/api/admin/feedback', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          status,
          priority,
          notes,
          reviewedBy: 'admin-user-id' // This should be the actual admin user ID
        }),
      })

      if (response.ok) {
        await fetchFeedback()
        setIsUpdateModalOpen(false)
        setSelectedFeedback(null)
      }
    } catch (error) {
      console.error('Error updating feedback:', error)
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status)
    return option?.color || 'bg-gray-100 text-gray-800'
  }

  const getPriorityColor = (priority: string) => {
    const option = priorityOptions.find(opt => opt.value === priority)
    return option?.color || 'bg-gray-100 text-gray-800'
  }

  const getTypeColor = (type: string) => {
    const option = feedbackTypes.find(opt => opt.value === type)
    return option?.color || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderStars = (rating?: number) => {
    if (!rating) return null

    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={`star-${rating}-${i}`}
            className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating}/5)</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feedback Management</h1>
          <p className="text-gray-600 mt-2">Manage user feedback and feature requests</p>
        </div>
        <Button onClick={() => fetchFeedback()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                <p className="text-2xl font-bold text-gray-900">{totalFeedback}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New</p>
                <p className="text-2xl font-bold text-blue-600">
                  {feedback.filter(f => f.status === 'new').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reviewed</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {feedback.filter(f => f.status === 'reviewed').length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Implemented</p>
                <p className="text-2xl font-bold text-green-600">
                  {feedback.filter(f => f.status === 'implemented').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search feedback..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 bg-white text-black"
                />
              </div>
            </div>
            <Select value={filterType || "all"} onValueChange={(value) => setFilterType(value === "all" ? "" : value)}>
              <SelectTrigger className="w-40 bg-white text-black">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {feedbackTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus || "all"} onValueChange={(value) => setFilterStatus(value === "all" ? "" : value)}>
              <SelectTrigger className="w-40 bg-white text-black">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPriority || "all"} onValueChange={(value) => setFilterPriority(value === "all" ? "" : value)}>
              <SelectTrigger className="w-40 bg-white text-black">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {priorityOptions.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>{priority.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 10 }, (_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></TableCell>
                  </TableRow>
                ))
              ) : (
                <>
                  {feedback.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No feedback found matching your criteria.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    feedback.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>
                          <Badge className={getTypeColor(item.type)}>
                            {feedbackTypes.find(t => t.value === item.type)?.label || item.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={item.subject}>
                            {item.subject}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {item.email ? (
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                {item.email}
                              </div>
                            ) : (
                              <span className="text-gray-500">Anonymous</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {renderStars(item.rating)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(item.status)}>
                            {statusOptions.find(s => s.value === item.status)?.label || item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(item.priority)}>
                            {priorityOptions.find(p => p.value === item.priority)?.label || item.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {formatDate(item.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewFeedback(item)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateFeedback(item)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Update Status
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalFeedback)} of {totalFeedback} feedback items
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                return (
                  <Button
                    key={pageNumber}
                    variant={pageNumber === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                    disabled={pageNumber > totalPages}
                  >
                    {pageNumber}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* View Feedback Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
            <DialogDescription>
              View complete feedback information
            </DialogDescription>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Badge className={getTypeColor(selectedFeedback.type)}>
                    {feedbackTypes.find(t => t.value === selectedFeedback.type)?.label || selectedFeedback.type}
                  </Badge>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedFeedback.status)}>
                    {statusOptions.find(s => s.value === selectedFeedback.status)?.label || selectedFeedback.status}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Subject</Label>
                <p className="text-sm font-medium">{selectedFeedback.subject}</p>
              </div>

              <div>
                <Label>Message</Label>
                <div className="bg-gray-50 p-3 rounded-md text-sm whitespace-pre-wrap">
                  {selectedFeedback.message}
                </div>
              </div>

              {selectedFeedback.email && (
                <div>
                  <Label>Email</Label>
                  <p className="text-sm">{selectedFeedback.email}</p>
                </div>
              )}

              {selectedFeedback.rating && (
                <div>
                  <Label>Rating</Label>
                  {renderStars(selectedFeedback.rating)}
                </div>
              )}

              {(selectedFeedback.likes?.length || selectedFeedback.dislikes?.length) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedFeedback.likes?.length && (
                    <div>
                      <Label>Likes</Label>
                      <div className="flex flex-wrap gap-1">
                        {selectedFeedback.likes.map((like, index) => (
                          <Badge key={`like-${like}-${index}`} variant="outline" className="text-xs">
                            {like}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedFeedback.dislikes?.length && (
                    <div>
                      <Label>Dislikes</Label>
                      <div className="flex flex-wrap gap-1">
                        {selectedFeedback.dislikes.map((dislike, index) => (
                          <Badge key={`dislike-${dislike}-${index}`} variant="outline" className="text-xs">
                            {dislike}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Created</Label>
                  <p className="text-sm">{formatDate(selectedFeedback.createdAt)}</p>
                </div>
                {selectedFeedback.reviewedAt && (
                  <div>
                    <Label>Reviewed</Label>
                    <p className="text-sm">{formatDate(selectedFeedback.reviewedAt)}</p>
                  </div>
                )}
              </div>

              {selectedFeedback.reviewedBy && (
                <div>
                  <Label>Reviewed By</Label>
                  <p className="text-sm">
                    {selectedFeedback.reviewedBy.firstName} {selectedFeedback.reviewedBy.lastName}
                  </p>
                </div>
              )}

              {selectedFeedback.notes && (
                <div>
                  <Label>Admin Notes</Label>
                  <div className="bg-blue-50 p-3 rounded-md text-sm">
                    {selectedFeedback.notes}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Feedback Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Feedback Status</DialogTitle>
            <DialogDescription>
              Update the status and priority of this feedback
            </DialogDescription>
          </DialogHeader>
          {selectedFeedback && (
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              const status = formData.get('status') as string
              const priority = formData.get('priority') as string
              const notes = formData.get('notes') as string
              handleStatusUpdate(selectedFeedback._id, status, priority, notes)
            }} className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={selectedFeedback.status}>
                  <SelectTrigger className="bg-white text-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select name="priority" defaultValue={selectedFeedback.priority}>
                  <SelectTrigger className="bg-white text-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Admin Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  defaultValue={selectedFeedback.notes || ''}
                  placeholder="Add internal notes..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsUpdateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updating}>
                  {updating ? 'Updating...' : 'Update Feedback'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
