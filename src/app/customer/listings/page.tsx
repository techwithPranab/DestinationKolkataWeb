"use client"

import React, { useState, useEffect } from 'react'
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
  Trophy
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { useApi } from '@/lib/api-client'

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

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchSubmissions()
    } else {
      setLoading(false)
    }
  }, [statusFilter, typeFilter, isAuthenticated, user])

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (typeFilter && typeFilter !== 'all') params.append('type', typeFilter)

      const queryString = params.toString()
      const url = queryString ? `/api/customer/submissions?${queryString}` : '/api/customer/submissions'

      const result = await api.get<{ submissions: Submission[] }>(url)

      if (result.error) {
        console.error('API Error:', result.error)
        if (result.status === 401) {
          // User will be automatically logged out by the API client
          console.log('User logged out due to authentication error')
        }
        return
      }

      console.log('Received submissions:', result.data)
      const submissionsData = result.data as { submissions?: Submission[] } | undefined
      setSubmissions(submissionsData?.submissions || [])
    } catch (error) {
      console.error('Error fetching submissions:', error)
    } finally {
      setLoading(false)
    }
  }

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
      await fetchSubmissions()
      alert('Submission deleted successfully')
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete submission')
    }
  }

  const filteredSubmissions = submissions.filter(submission =>
    submission.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
              <SelectContent>
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
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="hotel">Hotel</SelectItem>
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="promotion">Promotion</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Listings */}
      <div className="space-y-4">
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
                      <div className="flex-shrink-0">
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
    </div>
  )
}
