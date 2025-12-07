"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { fetchAuthenticatedAPI } from '@/lib/backend-api'

interface Submission {
  id: string
  type: 'hotel' | 'restaurant' | 'event' | 'promotion' | 'sports'
  title: string
  description: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  submittedBy: {
    name: string
    email: string
    phone: string
  }
  submissionData: Record<string, unknown>
  adminNotes?: string
}

export default function AdminApprovalsPage() {
  const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
  
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState('')

  useEffect(() => {
    fetchSubmissions()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const response = await fetchAuthenticatedAPI(`/api/admin/submissions?status=${filter}`)
      
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data.submissions)
      }
    } catch (error) {
      console.error('Error fetching submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (submissionId: string, action: 'approve' | 'reject') => {
    setActionLoading(submissionId)
    
    try {
      const response = await fetchAuthenticatedAPI(`/api/admin/submissions/${submissionId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminNotes: adminNotes
        })
      })

      if (response.ok) {
        await fetchSubmissions()
        setSelectedSubmission(null)
        setAdminNotes('')
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
        return <Clock className="w-5 h-5" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredSubmissions = submissions.filter(submission =>
    submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.submittedBy.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Content Approvals</h1>
          <p className="text-gray-600 mt-1">Review and manage submitted content</p>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex space-x-2">
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilter('pending')}
              className={filter === 'pending' ? 'bg-orange-600 hover:bg-orange-700' : ''}
            >
              <Clock className="w-4 h-4 mr-2" />
              Pending
            </Button>
            <Button
              variant={filter === 'approved' ? 'default' : 'outline'}
              onClick={() => setFilter('approved')}
              className={filter === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              <Check className="w-4 h-4 mr-2" />
              Approved
            </Button>
            <Button
              variant={filter === 'rejected' ? 'default' : 'outline'}
              onClick={() => setFilter('rejected')}
              className={filter === 'rejected' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              <X className="w-4 h-4 mr-2" />
              Rejected
            </Button>
          </div>
          
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Submissions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Submissions List */}
          <div className="space-y-4">
            {filteredSubmissions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
                  <p className="text-gray-600">No submissions match your current filter criteria.</p>
                </CardContent>
              </Card>
            ) : (
              filteredSubmissions.map((submission) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedSubmission?.id === submission.id ? 'ring-2 ring-orange-500' : ''
                    }`}
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getTypeIcon(submission.type)}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                              {submission.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {submission.description}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>By {submission.submittedBy.name}</span>
                              <span>{new Date(submission.createdAt).toLocaleDateString()}</span>
                              <span className="capitalize">{submission.type}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          {getStatusBadge(submission.status)}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedSubmission(submission)
                            }}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>

          {/* Submission Details */}
          <div className="sticky top-8">
            {selectedSubmission ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      {getTypeIcon(selectedSubmission.type)}
                      <span>{selectedSubmission.title}</span>
                    </CardTitle>
                    {getStatusBadge(selectedSubmission.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600">{selectedSubmission.description}</p>
                  </div>

                  {/* Submitter Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Submitted By</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Name:</span> {selectedSubmission.submittedBy.name}</p>
                      <p><span className="font-medium">Email:</span> {selectedSubmission.submittedBy.email}</p>
                      <p><span className="font-medium">Phone:</span> {selectedSubmission.submittedBy.phone}</p>
                    </div>
                  </div>

                  {/* Submission Date */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Submitted On</h4>
                    <p className="text-gray-600">{new Date(selectedSubmission.createdAt).toLocaleString()}</p>
                  </div>

                  {/* Admin Notes */}
                  {selectedSubmission.status === 'pending' && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Admin Notes</h4>
                      <Textarea
                        placeholder="Add notes for approval/rejection..."
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                  )}

                  {/* Existing Admin Notes */}
                  {selectedSubmission.adminNotes && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Previous Admin Notes</h4>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded">
                        {selectedSubmission.adminNotes}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {selectedSubmission.status === 'pending' && (
                    <div className="flex space-x-3">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleAction(selectedSubmission.id, 'approve')}
                        disabled={actionLoading === selectedSubmission.id}
                      >
                        {actionLoading === selectedSubmission.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Check className="w-4 h-4 mr-2" />
                        )}
                        Approve
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
                        onClick={() => handleAction(selectedSubmission.id, 'reject')}
                        disabled={actionLoading === selectedSubmission.id}
                      >
                        {actionLoading === selectedSubmission.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                        ) : (
                          <X className="w-4 h-4 mr-2" />
                        )}
                        Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a submission</h3>
                  <p className="text-gray-600">Choose a submission from the list to view details and take action.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
