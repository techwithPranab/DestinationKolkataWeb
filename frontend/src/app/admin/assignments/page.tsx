"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  UserCheck,
  Hotel,
  UtensilsCrossed,
  Calendar,
  Megaphone,
  Trophy,
  Search,
  Send,
  RefreshCw,
  Database
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fetchAuthenticatedAPI } from '@/lib/backend-api'
import { toast } from 'sonner'

interface Customer {
  id: string
  email: string
  name: string
  firstName?: string
  lastName?: string
  businessName?: string
  businessType?: string
  phone?: string
  city?: string
  membershipType: 'free' | 'premium' | 'business'
  createdAt: string
}

interface Submission {
  id: string
  type: 'hotel' | 'restaurant' | 'event' | 'promotion' | 'sports'
  title: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  data: Record<string, unknown>
}

interface PendingResource {
  id: string
  type: 'hotel' | 'restaurant' | 'event' | 'sports' | 'promotion'
  title: string
  status: 'pending'
  createdAt: string
  data: Record<string, unknown>
  source: 'ingested'
}

export default function AdminAssignmentsPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [pendingResources, setPendingResources] = useState<PendingResource[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [selectedResource, setSelectedResource] = useState<PendingResource | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [activeTab, setActiveTab] = useState('submissions')

  // Pagination state
  const [submissionsCurrentPage, setSubmissionsCurrentPage] = useState(1)
  const [resourcesCurrentPage, setResourcesCurrentPage] = useState(1)
  const itemsPerPage = 10

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [customersRes, submissionsRes, resourcesRes] = await Promise.all([
        fetchAuthenticatedAPI('/api/admin/customers'),
        fetchAuthenticatedAPI(`/api/admin/submissions/unassigned${selectedType !== 'all' ? `?type=${selectedType}` : ''}`),
        fetchAuthenticatedAPI(`/api/admin/resources/pending${selectedType !== 'all' ? `?type=${selectedType}` : ''}`)
      ])

      if (customersRes.ok) {
        const customersData = await customersRes.json()
        setCustomers(customersData.customers || [])
      }

      if (submissionsRes.ok) {
        const submissionsData = await submissionsRes.json()
        setSubmissions(submissionsData.submissions || [])
      }

      if (resourcesRes.ok) {
        const resourcesData = await resourcesRes.json()
        setPendingResources(resourcesData.resources || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [selectedType])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Reset pagination when filters change
  useEffect(() => {
    setSubmissionsCurrentPage(1)
  }, [searchTerm, selectedType])

  useEffect(() => {
    setResourcesCurrentPage(1)
  }, [searchTerm, selectedType])

  const handleAssignSubmission = (submission: Submission) => {
    setSelectedSubmission(submission)
    setSelectedResource(null)
    setSelectedCustomer('')
    setShowAssignDialog(true)
  }

  const handleAssignResource = (resource: PendingResource) => {
    setSelectedResource(resource)
    setSelectedSubmission(null)
    setSelectedCustomer('')
    setShowAssignDialog(true)
  }

  const confirmAssignment = async () => {
    if (!selectedCustomer) {
      toast.error('Please select a customer')
      return
    }

    if (!selectedSubmission && !selectedResource) {
      toast.error('No item selected for assignment')
      return
    }

    setAssigning(true)
    try {
      let response;
      
      if (selectedSubmission) {
        response = await fetchAuthenticatedAPI(`/api/admin/submissions/${selectedSubmission.id}/assign`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId: selectedCustomer
          })
        })
      } else if (selectedResource) {
        response = await fetchAuthenticatedAPI(`/api/admin/resources/${selectedResource.id}/assign`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId: selectedCustomer,
            type: selectedResource.type
          })
        })
      }

      if (response && response.ok) {
        const result = await response.json()
        console.log('Assignment successful:', result)
        toast.success(`${selectedSubmission ? 'Submission' : 'Resource'} assigned to customer successfully`)
        setShowAssignDialog(false)
        fetchData() // Refresh data
      } else {
        const error = response ? await response.json() : { message: 'Unknown error' }
        console.error('Assignment failed:', error)
        toast.error(error.message || `Failed to assign ${selectedSubmission ? 'submission' : 'resource'}`)
      }
    } catch (error) {
      console.error('Error assigning:', error)
      toast.error(`Failed to assign ${selectedSubmission ? 'submission' : 'resource'}`)
    } finally {
      setAssigning(false)
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
        return <Hotel className="w-5 h-5" />
    }
  }

  const getMembershipBadge = (type: string) => {
    switch (type) {
      case 'premium':
        return <Badge className="bg-blue-100 text-blue-800">Premium</Badge>
      case 'business':
        return <Badge className="bg-purple-100 text-purple-800">Business</Badge>
      default:
        return <Badge variant="outline">Free</Badge>
    }
  }

  const filteredSubmissions = submissions.filter(submission =>
    (submission.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredResources = pendingResources.filter(resource =>
    (resource.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filtered arrays for display (including search filter)
  const displayFilteredSubmissions = filteredSubmissions.filter(sub => sub.type !== 'event' && sub.type !== 'promotion')
  const displayFilteredResources = filteredResources.filter(res => res.type !== 'event' && res.type !== 'promotion')

  // Pagination calculations for submissions
  const submissionsTotalPages = Math.ceil(displayFilteredSubmissions.length / itemsPerPage)
  const submissionsStartIndex = (submissionsCurrentPage - 1) * itemsPerPage
  const submissionsEndIndex = submissionsStartIndex + itemsPerPage
  const paginatedSubmissions = displayFilteredSubmissions.slice(submissionsStartIndex, submissionsEndIndex)

  // Pagination calculations for resources
  const resourcesTotalPages = Math.ceil(displayFilteredResources.length / itemsPerPage)
  const resourcesStartIndex = (resourcesCurrentPage - 1) * itemsPerPage
  const resourcesEndIndex = resourcesStartIndex + itemsPerPage
  const paginatedResources = displayFilteredResources.slice(resourcesStartIndex, resourcesEndIndex)

  // Filtered counts excluding events and promotions
  const filteredSubmissionsCount = submissions.filter(sub => sub.type !== 'event' && sub.type !== 'promotion').length
  const filteredResourcesCount = pendingResources.filter(res => res.type !== 'event' && res.type !== 'promotion').length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assignments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 text-sm">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assign Resources to Customers</h1>
            <p className="text-gray-600 mt-1">Tag pending submissions and ingested resources to customers for completion</p>
          </div>
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent className='bg-white'>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="hotel">Hotels</SelectItem>
              <SelectItem value="restaurant">Restaurants</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unassigned Submissions</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{filteredSubmissionsCount}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <Send className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Resources</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{filteredResourcesCount}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Database className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Customers</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{customers.length}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Selected Type</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1 capitalize">{selectedType}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  {getTypeIcon(selectedType === 'all' ? 'hotel' : selectedType)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Submissions and Pending Resources */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="submissions" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              User Submissions ({filteredSubmissionsCount})
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Ingested Resources ({filteredResourcesCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="submissions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Unassigned Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                {displayFilteredSubmissions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Send className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No unassigned submissions found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paginatedSubmissions.map((submission) => (
                      <motion.div
                        key={submission.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="bg-orange-100 p-3 rounded-lg">
                              {getTypeIcon(submission.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">{submission.title}</h3>
                              <p className="text-sm text-gray-500 capitalize">{submission.type}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                Created: {submission.createdAt ? new Date(submission.createdAt).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <Button 
                            onClick={() => handleAssignSubmission(submission)}
                            className="bg-orange-600 hover:bg-orange-700 "
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            Assign to Customer
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pagination for Submissions */}
            {displayFilteredSubmissions.length > itemsPerPage && submissionsTotalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Page {submissionsCurrentPage} of {submissionsTotalPages} ({displayFilteredSubmissions.length} total submissions)
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSubmissionsCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={submissionsCurrentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, submissionsTotalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(submissionsTotalPages - 4, submissionsCurrentPage - 2)) + i
                    return (
                      <Button
                        key={pageNum}
                        variant={submissionsCurrentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSubmissionsCurrentPage(pageNum)}
                        className={submissionsCurrentPage === pageNum ? 'text-white bg-orange-600 hover:bg-orange-700' : ''}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSubmissionsCurrentPage(prev => Math.min(submissionsTotalPages, prev + 1))}
                    disabled={submissionsCurrentPage === submissionsTotalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Ingested Resources</CardTitle>
              </CardHeader>
              <CardContent>
                {displayFilteredResources.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Database className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No pending resources found</p>
                    <p className="text-sm mt-2">Resources will appear here after data ingestion</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paginatedResources.map((resource) => (
                      <motion.div
                        key={resource.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="bg-blue-100 p-3 rounded-lg">
                              {getTypeIcon(resource.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">{resource.title}</h3>
                              <p className="text-sm text-gray-500 capitalize">{resource.type}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  Ingested Data
                                </Badge>
                                <p className="text-xs text-gray-400">
                                  Created: {resource.createdAt ? new Date(resource.createdAt).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                          <Button 
                            onClick={() => handleAssignResource(resource)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            Assign to Customer
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pagination for Resources */}
            {displayFilteredResources.length > itemsPerPage && resourcesTotalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Page {resourcesCurrentPage} of {resourcesTotalPages} ({displayFilteredResources.length} total resources)
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setResourcesCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={resourcesCurrentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, resourcesTotalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(resourcesTotalPages - 4, resourcesCurrentPage - 2)) + i
                    return (
                      <Button
                        key={pageNum}
                        variant={resourcesCurrentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setResourcesCurrentPage(pageNum)}
                        className={resourcesCurrentPage === pageNum ? 'text-white bg-blue-600 hover:bg-blue-700' : ''}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setResourcesCurrentPage(prev => Math.min(resourcesTotalPages, prev + 1))}
                    disabled={resourcesCurrentPage === resourcesTotalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Assignment Dialog */}
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent className="sm:max-w-[500px] bg-white">
            <DialogHeader>
              <DialogTitle>
                Assign {selectedSubmission ? 'Submission' : 'Resource'} to Customer
              </DialogTitle>
              <DialogDescription>
                Select a customer to assign this {(selectedSubmission || selectedResource)?.type} {selectedSubmission ? 'submission' : 'resource'} to
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`bg-${selectedSubmission ? 'orange' : 'blue'}-100 p-2 rounded`}>
                    {(selectedSubmission || selectedResource) && getTypeIcon((selectedSubmission || selectedResource)?.type || 'hotel')}
                  </div>
                  <div>
                    <p className="font-semibold">{(selectedSubmission || selectedResource)?.title}</p>
                    <p className="text-sm text-gray-500 capitalize">{(selectedSubmission || selectedResource)?.type}</p>
                    {selectedResource && (
                      <Badge variant="outline" className="text-xs mt-1">
                        Ingested Data
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Customer
                </label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a customer" />
                  </SelectTrigger>
                  <SelectContent className='bg-white'>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{customer.name || customer.email}</span>
                          <span className="ml-2">{getMembershipBadge(customer.membershipType)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCustomer && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    {customers.find(c => c.id === selectedCustomer) && (
                      <div className="text-sm">
                        <p className="font-medium">
                          {customers.find(c => c.id === selectedCustomer)?.name}
                        </p>
                        <p className="text-gray-600">
                          {customers.find(c => c.id === selectedCustomer)?.email}
                        </p>
                        {customers.find(c => c.id === selectedCustomer)?.businessName && (
                          <p className="text-gray-600">
                            {customers.find(c => c.id === selectedCustomer)?.businessName}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAssignDialog(false)}
                disabled={assigning}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmAssignment}
                disabled={!selectedCustomer || assigning}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {assigning ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Assign
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
