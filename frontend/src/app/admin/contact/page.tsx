"use client"

import React, { useState, useEffect, useCallback } from 'react'
import {
  MessageSquare,
  Search,
  Eye,
  CheckCircle,
  Clock,
  User,
  MoreHorizontal,
  RefreshCw,
  Mail,
  Phone
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
import { fetchAuthenticatedAPI } from '@/lib/backend-api'

interface Contact {
  _id: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  category: 'general' | 'business' | 'support' | 'partnership' | 'other'
  status: 'new' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  resolvedBy?: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  response?: string
  notes?: string
}

const contactCategories = [
  { value: 'general', label: 'General Inquiry', color: 'bg-blue-100 text-blue-800' },
  { value: 'business', label: 'Business', color: 'bg-green-100 text-green-800' },
  { value: 'support', label: 'Support', color: 'bg-purple-100 text-purple-800' },
  { value: 'partnership', label: 'Partnership', color: 'bg-orange-100 text-orange-800' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' }
]

const statusOptions = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'resolved', label: 'Resolved', color: 'bg-green-100 text-green-800' },
  { value: 'closed', label: 'Closed', color: 'bg-red-100 text-red-800' }
]

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' }
]

export default function ContactAdmin() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalContacts, setTotalContacts] = useState(0)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [updating, setUpdating] = useState(false)

  const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

  const fetchContacts = useCallback(async (search = searchTerm) => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        search
      })

      if (filterCategory) params.append('category', filterCategory)
      if (filterStatus) params.append('status', filterStatus)
      if (filterPriority) params.append('priority', filterPriority)

      const response = await fetchAuthenticatedAPI(`/api/admin/contact?${params}`)
      const data = await response.json()

      if (data.success) {
        setContacts(data.data)
        setTotalPages(data.pagination.totalPages)
        setTotalContacts(data.pagination.total)
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, filterCategory, filterStatus, filterPriority, searchTerm])

  useEffect(() => {
    fetchContacts()
  }, [currentPage, filterCategory, filterStatus, filterPriority, fetchContacts])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchContacts()
  }

  const handleViewContact = (item: Contact) => {
    setSelectedContact(item)
    setIsViewModalOpen(true)
  }

  const handleUpdateContact = (item: Contact) => {
    setSelectedContact(item)
    setIsUpdateModalOpen(true)
  }

  const handleStatusUpdate = async (id: string, status: string, priority: string, response: string, notes: string) => {
    setUpdating(true)
    try {
      const responseData = await fetchAuthenticatedAPI('/api/admin/contact', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          status,
          priority,
          response,
          notes,
          resolvedBy: 'admin-user-id' // This should be the actual admin user ID
        }),
      })

      if (responseData.ok) {
        await fetchContacts()
        setIsUpdateModalOpen(false)
        setSelectedContact(null)
      }
    } catch (error) {
      console.error('Error updating contact:', error)
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

  const getCategoryColor = (category: string) => {
    const option = contactCategories.find(opt => opt.value === category)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contact Management</h1>
          <p className="text-gray-600 mt-2">Manage customer inquiries and support requests</p>
        </div>
        <Button onClick={() => fetchContacts()} variant="outline">
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
                <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                <p className="text-2xl font-bold text-gray-900">{totalContacts}</p>
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
                  {contacts.filter(c => c.status === 'new').length}
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
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {contacts.filter(c => c.status === 'in-progress').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">
                  {contacts.filter(c => c.status === 'resolved').length}
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
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 bg-white text-black"
                />
              </div>
            </div>
            <Select value={filterCategory || "all"} onValueChange={(value) => setFilterCategory(value === "all" ? "" : value)}>
              <SelectTrigger className="w-40 bg-white text-black">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {contactCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
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

      {/* Contacts Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Category</TableHead>
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
                    <TableCell><div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></TableCell>
                  </TableRow>
                ))
              ) : (
                <>
                  {contacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No contacts found matching your criteria.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    contacts.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={item.subject}>
                            {item.subject}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm space-y-1">
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {item.email}
                            </div>
                            {item.phone && (
                              <div className="flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {item.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(item.category)}>
                            {contactCategories.find(c => c.value === item.category)?.label || item.category}
                          </Badge>
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
                              <DropdownMenuItem onClick={() => handleViewContact(item)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateContact(item)}>
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
            Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalContacts)} of {totalContacts} contact items
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
                    key={`page-${pageNumber}`}
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

      {/* View Contact Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contact Details</DialogTitle>
            <DialogDescription>
              View complete contact information
            </DialogDescription>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Badge className={getCategoryColor(selectedContact.category)}>
                    {contactCategories.find(c => c.value === selectedContact.category)?.label || selectedContact.category}
                  </Badge>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedContact.status)}>
                    {statusOptions.find(s => s.value === selectedContact.status)?.label || selectedContact.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="text-sm font-medium">{selectedContact.name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-sm">{selectedContact.email}</p>
                </div>
              </div>

              {selectedContact.phone && (
                <div>
                  <Label>Phone</Label>
                  <p className="text-sm">{selectedContact.phone}</p>
                </div>
              )}

              <div>
                <Label>Subject</Label>
                <p className="text-sm font-medium">{selectedContact.subject}</p>
              </div>

              <div>
                <Label>Message</Label>
                <div className="bg-gray-50 p-3 rounded-md text-sm whitespace-pre-wrap">
                  {selectedContact.message}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Created</Label>
                  <p className="text-sm">{formatDate(selectedContact.createdAt)}</p>
                </div>
                {selectedContact.resolvedAt && (
                  <div>
                    <Label>Resolved</Label>
                    <p className="text-sm">{formatDate(selectedContact.resolvedAt)}</p>
                  </div>
                )}
              </div>

              {selectedContact.resolvedBy && (
                <div>
                  <Label>Resolved By</Label>
                  <p className="text-sm">
                    {selectedContact.resolvedBy.firstName} {selectedContact.resolvedBy.lastName}
                  </p>
                </div>
              )}

              {selectedContact.response && (
                <div>
                  <Label>Response</Label>
                  <div className="bg-blue-50 p-3 rounded-md text-sm">
                    {selectedContact.response}
                  </div>
                </div>
              )}

              {selectedContact.notes && (
                <div>
                  <Label>Admin Notes</Label>
                  <div className="bg-yellow-50 p-3 rounded-md text-sm">
                    {selectedContact.notes}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Contact Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Contact Status</DialogTitle>
            <DialogDescription>
              Update the status and add response to this contact
            </DialogDescription>
          </DialogHeader>
          {selectedContact && (
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              const status = formData.get('status') as string
              const priority = formData.get('priority') as string
              const response = formData.get('response') as string
              const notes = formData.get('notes') as string
              handleStatusUpdate(selectedContact._id, status, priority, response, notes)
            }} className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={selectedContact.status}>
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
                <Select name="priority" defaultValue={selectedContact.priority}>
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
                <Label htmlFor="response">Response</Label>
                <Textarea
                  id="response"
                  name="response"
                  defaultValue={selectedContact.response || ''}
                  placeholder="Add your response to the customer..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="notes">Admin Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  defaultValue={selectedContact.notes || ''}
                  placeholder="Add internal notes..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsUpdateModalOpen(false)} className="bg-green-500 hover:bg-green-600 text-white">
                  Cancel
                </Button>
                <Button type="submit" disabled={updating} className="bg-orange-500 hover:bg-orange-600 text-white">
                  {updating ? 'Updating...' : 'Update Contact'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
