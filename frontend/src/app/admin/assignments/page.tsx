"use client"

import React, { useState, useEffect } from 'react'
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

  useEffect(() => {
    fetchData()
  }, [selectedType])

  const fetchData = async () => {
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
  }

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
        toast.success(`${selectedSubmission ? 'Submission' : 'Resource'} assigned to customer successfully`)
        setShowAssignDialog(false)
        fetchData() // Refresh data
      } else {
        const error = response ? await response.json() : { message: 'Unknown error' }
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="hotel">Hotels</SelectItem>
              <SelectItem value="restaurant">Restaurants</SelectItem>
              <SelectItem value="event">Events</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
              <SelectItem value="promotion">Promotions</SelectItem>
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
                  <p className="text-2xl font-bold text-gray-900 mt-1">{submissions.length}</p>
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
                  <p className="text-2xl font-bold text-gray-900 mt-1">{pendingResources.length}</p>
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
              User Submissions ({filteredSubmissions.length})
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Ingested Resources ({filteredResources.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="submissions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Unassigned Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredSubmissions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Send className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No unassigned submissions found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredSubmissions.map((submission) => (
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
                                Created: {new Date(submission.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button 
                            onClick={() => handleAssignSubmission(submission)}
                            className="bg-orange-600 hover:bg-orange-700"
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
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Ingested Resources</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredResources.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Database className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No pending resources found</p>
                    <p className="text-sm mt-2">Resources will appear here after data ingestion</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredResources.map((resource) => (
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
                                  Created: {new Date(resource.createdAt).toLocaleDateString()}
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
          </TabsContent>
        </Tabs>

        {/* Assignment Dialog */}
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent className="sm:max-w-[500px]">
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
                  <SelectContent>
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
