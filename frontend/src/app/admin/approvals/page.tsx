"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Check, 
  X, 
  Eye, 
  Clock,
  Hotel,
  UtensilsCrossed,
  Calendar,
  Megaphone,
  Trophy,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  MapPin
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { fetchAuthenticatedAPI } from '@/lib/backend-api'

interface Submission {
  id: string
  type: 'hotel' | 'restaurant' | 'event' | 'promotion' | 'sports' | 'attraction'
  title: string
  description: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  submittedBy?: {
    name: string
    email: string
    phone: string
  }
  submissionData: Record<string, unknown>
  adminNotes?: string
}

export default function AdminApprovalsPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const itemsPerPage = 10

  useEffect(() => {
    fetchSubmissions()
  }, [statusFilter, typeFilter, searchTerm, currentPage])

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(searchTerm && { search: searchTerm })
      })
      
      const response = await fetchAuthenticatedAPI(`/api/admin/submissions?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data.submissions || [])
        setTotalPages(Math.ceil((data.total || 0) / itemsPerPage))
        setTotalItems(data.total || 0)
      }
    } catch (error) {
      console.error('Error fetching submissions:', error)
      setSubmissions([])
    } finally {
      setLoading(false)
    }
  }

  const handleViewSubmission = (submissionId: string) => {
    // Always go to the approvals edit page which now has proper edit forms
    router.push(`/admin/approvals/edit/${submissionId}`)
  }

  const handleQuickAction = async (submissionId: string, action: 'approve' | 'reject') => {
    setActionLoading(submissionId)
    try {
      const response = await fetchAuthenticatedAPI(`/api/admin/submissions/${submissionId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        fetchSubmissions()
      }
    } catch (error) {
      console.error(`Error ${action}ing submission:`, error)
    } finally {
      setActionLoading(null)
    }
  }



  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hotel':
        return <Hotel className="w-4 h-4" />
      case 'restaurant':
        return <UtensilsCrossed className="w-4 h-4" />
      case 'event':
        return <Calendar className="w-4 h-4" />
      case 'promotion':
        return <Megaphone className="w-4 h-4" />
      case 'sports':
        return <Trophy className="w-4 h-4" />
      case 'attraction':
        return <MapPin className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'hotel':
        return 'Hotel'
      case 'restaurant':
        return 'Restaurant'
      case 'event':
        return 'Event'
      case 'promotion':
        return 'Promotion'
      case 'sports':
        return 'Sports'
      case 'attraction':
        return 'Attraction'
      default:
        return type
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value)
    setCurrentPage(1)
  }

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading submissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Content Approvals</h1>
          <p className="text-gray-600 mt-2">Review and manage submitted content from users</p>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search Submissions
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="search"
                    placeholder="Search by title or submitter name..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 bg-white"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="min-w-[160px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Type Filter */}
              <div className="min-w-[160px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resource Type
                </label>
                <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="hotel">Hotel</SelectItem>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="promotion">Promotion</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="attraction">Attraction</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                  setTypeFilter('all')
                  setCurrentPage(1)
                }}
                className="shrink-0"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} submissions
          </p>
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
        </div>

        {/* Submissions Table */}
        <Card>
          <CardContent className="p-0">
            {submissions.length === 0 ? (
              <div className="text-center py-12">
                <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
                <p className="text-gray-600">No submissions match your current filter criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold">Title</TableHead>
                      <TableHead className="font-semibold">Submitter</TableHead>
                      <TableHead className="font-semibold">Submitted</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(submission.type)}
                            <span className="text-sm font-medium capitalize">
                              {getTypeLabel(submission.type)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900 line-clamp-1">
                              {submission.title}
                            </div>
                            <div className="text-sm text-gray-600 line-clamp-1 mt-1">
                              {submission.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {submission.submittedBy?.name || 'Unknown User'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {submission.submittedBy?.email || 'No email provided'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {new Date(submission.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(submission.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(submission.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewSubmission(submission.id)}
                              className="h-8 px-3"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            
                            {submission.status === 'pending' && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    disabled={actionLoading === submission.id}
                                  >
                                    {actionLoading === submission.id ? (
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                                    ) : (
                                      <MoreHorizontal className="w-3 h-3" />
                                    )}
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-white">
                                  <DropdownMenuItem 
                                    onClick={() => handleQuickAction(submission.id, 'approve')}
                                    className="text-green-600"
                                  >
                                    <Check className="w-4 h-4 mr-2" />
                                    Quick Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleQuickAction(submission.id, 'reject')}
                                    className="text-red-600"
                                  >
                                    <X className="w-4 h-4 mr-2" />
                                    Quick Reject
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNumber)}
                    disabled={loading}
                    className={`w-8 h-8 p-0 ${
                      currentPage === pageNumber 
                        ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                        : ''
                    }`}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="flex items-center"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
