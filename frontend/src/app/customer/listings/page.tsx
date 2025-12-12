"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Search,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Hotel,
  UtensilsCrossed,
  Calendar,
  Megaphone,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Download,
  Trash
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FavoriteButton } from '@/components/shared/FavoriteButton'
import { useAuth } from '@/contexts/AuthContext'
import { useApi, apiClient } from '@/lib/api-client'

interface Submission {
  id: string
  type: 'hotel' | 'restaurant' | 'event' | 'promotion' | 'sports'
  title: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  views?: number
  adminNotes?: string
}

export default function CustomerListings() {
  const { user, isAuthenticated } = useAuth()
  const api = useApi()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [pageSize] = useState(10)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const fetchSubmissions = useCallback(async (page = 1) => {
    if (!isAuthenticated || !user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (typeFilter && typeFilter !== 'all') params.append('type', typeFilter)
      if (dateFrom) params.append('dateFrom', dateFrom)
      if (dateTo) params.append('dateTo', dateTo)
      params.append('sortBy', sortBy)
      params.append('sortOrder', sortOrder)
      params.append('page', page.toString())
      params.append('limit', pageSize.toString())

      const queryString = params.toString()
      const url = queryString ? `/api/customer/submissions?${queryString}` : '/api/customer/submissions'

      const result = await apiClient.get<{ submissions: Submission[], totalCount: number, currentPage: number, totalPages: number }>(url)

      if (result.error) {
        console.error('API Error:', result.error)
        if (result.status === 401) {
          console.log('Authentication error - user will be logged out')
        }
        return
      }

      console.log('Received submissions response:', result.data)
      
      // Handle the nested data structure from backend
      const responseData = result.data as { 
        data?: { submissions?: Submission[] }, 
        pagination?: { total?: number, limit?: number, skip?: number }
      }
      
      const submissions = responseData?.data?.submissions || []
      const totalCount = responseData?.pagination?.total || 0
      const limit = responseData?.pagination?.limit || pageSize
      const skip = responseData?.pagination?.skip || 0
      
      console.log('Processed submissions:', submissions)
      console.log('Total count:', totalCount)
      
      setSubmissions(submissions)
      setTotalCount(totalCount)
      setCurrentPage(Math.floor(skip / limit) + 1)
      setTotalPages(Math.ceil(totalCount / limit))
    } catch (error) {
      console.error('Error fetching submissions:', error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, typeFilter, dateFrom, dateTo, sortBy, sortOrder, pageSize, isAuthenticated, user])

  useEffect(() => {
    fetchSubmissions(currentPage)
  }, [currentPage, fetchSubmissions])

  useEffect(() => {
    setCurrentPage(1) // Reset to first page when filters or sorting change
    fetchSubmissions(1)
  }, [statusFilter, typeFilter, sortBy, sortOrder, dateFrom, dateTo, fetchSubmissions])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hotel':
        return <Hotel className="w-5 h-5" />
      case 'restaurant':
        return <UtensilsCrossed className="w-5 h-5" />
      case 'event':
        return <Calendar className="w-5 h-5" />
      case 'promotion':
        return <Megaphone className="w-5 h-5" />
      case 'sports':
        return <Trophy className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
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

  const handleView = (submission: Submission) => {
    // For now, we'll show an alert with submission details
    // In a real app, this might open a modal or navigate to a detail page
    alert(`Viewing: ${submission.title}
Type: ${submission.type}
Status: ${submission.status}
Created: ${new Date(submission.createdAt).toLocaleDateString()}`)
  }

  const handleEdit = (submission: Submission) => {
    // Show confirmation for approved submissions
    if (submission.status === 'approved') {
      const confirmEdit = confirm(
        `Editing an approved listing will change its status back to "pending" for admin re-review. ` +
        `Do you want to continue editing "${submission.title}"?`
      )
      if (!confirmEdit) return
    }
    
    // Navigate to the appropriate edit page based on submission type
    const editUrl = `/customer/create/${submission.type}?edit=${submission.id}`
    window.location.href = editUrl
  }

  const handleDelete = async (submission: Submission) => {
    if (!confirm(`Are you sure you want to delete "${submission.title}"? This action cannot be undone.`)) {
      return
    }

    try {
      const result = await api.delete(`/api/customer/submissions/${submission.id}`)

      if (result.error) {
        alert('Failed to delete submission: ' + (typeof result.error === 'string' ? result.error : 'Unknown error'))
        return
      }

      // Refresh the submissions list
      await fetchSubmissions(currentPage)
      alert('Submission deleted successfully')
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete submission')
    }
  }

  const filteredSubmissions = submissions.filter(submission =>
    submission.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle item selection
  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
    setSelectAll(newSelected.size === filteredSubmissions.length)
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set())
      setSelectAll(false)
    } else {
      setSelectedItems(new Set(filteredSubmissions.map(s => s.id)))
      setSelectAll(true)
    }
  }

  // Bulk operations
  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return

    if (!confirm(`Are you sure you want to delete ${selectedItems.size} submission(s)? This action cannot be undone.`)) {
      return
    }

    try {
      setLoading(true)
      const deletePromises = Array.from(selectedItems).map(id =>
        api.delete(`/api/customer/submissions/${id}`)
      )

      const results = await Promise.all(deletePromises)
      const failedDeletes = results.filter(result => result.error).length

      if (failedDeletes > 0) {
        alert(`${failedDeletes} deletion(s) failed. Please try again.`)
      } else {
        alert(`Successfully deleted ${selectedItems.size} submission(s)`)
      }

      setSelectedItems(new Set())
      setSelectAll(false)
      await fetchSubmissions(currentPage)
    } catch (error) {
      console.error('Bulk delete error:', error)
      alert('Failed to delete submissions')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    if (selectedItems.size === 0) return

    const selectedSubmissions = filteredSubmissions.filter(s => selectedItems.has(s.id))
    const csvContent = [
      ['Title', 'Type', 'Status', 'Created Date', 'Views'].join(','),
      ...selectedSubmissions.map(s => [
        `"${s.title}"`,
        s.type,
        s.status,
        new Date(s.createdAt).toLocaleDateString(),
        s.views || 0
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `listings-export-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your listings...</p>
        </div>
      </div>
    )
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to view your listings.</p>
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

  // Check if user has customer role
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
          <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
          <p className="text-gray-600 mt-1">Manage all your submitted listings</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search listings..."
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
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className='bg-white'>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="promotion">Promotion</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                </SelectContent>
              </Select>
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('-')
                setSortBy(field)
                setSortOrder(order as 'asc' | 'desc')
              }}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className='bg-white'>
                  <SelectItem value="createdAt-desc">Newest First</SelectItem>
                  <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                  <SelectItem value="title-asc">Title A-Z</SelectItem>
                  <SelectItem value="title-desc">Title Z-A</SelectItem>
                  <SelectItem value="status-asc">Status A-Z</SelectItem>
                  <SelectItem value="status-desc">Status Z-A</SelectItem>
                  <SelectItem value="type-asc">Type A-Z</SelectItem>
                  <SelectItem value="type-desc">Type Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="dateFrom" className="text-sm font-medium">From Date</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="dateTo" className="text-sm font-medium">To Date</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDateFrom('')
                    setDateTo('')
                  }}
                  className="px-4 py-2"
                >
                  Clear Dates
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedItems.size > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">
                {selectedItems.size} item(s) selected
              </span>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExport}
                  className="text-blue-600 border-blue-300 hover:bg-blue-100"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkDelete}
                  className="text-red-600 border-red-300 hover:bg-red-100"
                  disabled={loading}
                >
                  <Trash className="w-4 h-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Listings */}
      <div className="space-y-4">
        {filteredSubmissions.length > 0 && (
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
              className="rounded"
            />
            <span className="text-sm text-gray-600">
              Select all {filteredSubmissions.length} items
            </span>
          </div>
        )}

        {filteredSubmissions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter || typeFilter
                  ? 'Try adjusting your filters'
                  : 'Start by creating your first listing'
                }
              </p>
              {!searchTerm && !statusFilter && !typeFilter && (
                <Button
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={() => window.location.href = '/customer/create/hotel'}
                >
                  Create First Listing
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredSubmissions.map((submission) => (
            <motion.div
              key={submission.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(submission.id)}
                        onChange={() => handleSelectItem(submission.id)}
                        className="rounded"
                      />
                      <div className="shrink-0">
                        {getTypeIcon(submission.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{submission.title}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-500 capitalize">
                            {submission.type}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(submission.createdAt).toLocaleDateString()}
                          </span>
                          {submission.views && (
                            <span className="text-sm text-gray-500">
                              {submission.views} views
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <Badge className={getStatusColor(submission.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(submission.status)}
                          <span className="capitalize">{submission.status}</span>
                        </div>
                      </Badge>

                      <div className="flex space-x-2">
                        {submission.type !== 'promotion' && (
                          <FavoriteButton
                            type={submission.type}
                            itemId={submission.id}
                            itemName={submission.title}
                          />
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleView(submission)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(submission)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(submission)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {submission.adminNotes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-600">
                        <strong>Admin Notes:</strong> {submission.adminNotes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            {/* Page numbers */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                if (pageNum > totalPages) return null
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={loading}
                    className={currentPage === pageNum ? "bg-orange-600 hover:bg-orange-700" : ""}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || loading}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
