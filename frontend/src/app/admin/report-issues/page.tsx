"use client"
import { fetchAPI } from '@/lib/backend-api'

import React, { useState, useEffect, useCallback } from 'react'
import {
  AlertTriangle,
  Search,
  Eye,
  CheckCircle,
  Clock,
  User,
  MoreHorizontal,
  RefreshCw,
  MapPin
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

interface ReportIssue {
  _id: string
  type: 'inaccurate' | 'outdated' | 'closed' | 'inappropriate' | 'spam' | 'other'
  businessName: string
  location?: string
  description: string
  evidence?: string
  email?: string
  status: 'new' | 'investigating' | 'resolved' | 'dismissed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  createdAt: string
  updatedAt: string
  investigatedAt?: string
  investigatedBy?: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  resolution?: string
  actionTaken?: string
  // View tracking fields
  viewedAt?: string
  viewedBy?: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  viewCount?: number
}

const issueCategories = [
  { value: 'bug', label: 'Bug Report', color: 'bg-red-100 text-red-800' },
  { value: 'feature', label: 'Feature Request', color: 'bg-blue-100 text-blue-800' },
  { value: 'content', label: 'Content Issue', color: 'bg-purple-100 text-purple-800' },
  { value: 'design', label: 'Design Issue', color: 'bg-pink-100 text-pink-800' },
  { value: 'performance', label: 'Performance', color: 'bg-orange-100 text-orange-800' },
  { value: 'security', label: 'Security Issue', color: 'bg-red-100 text-red-900' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' }
]

const severityOptions = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-900' }
]

const statusOptions = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
  { value: 'investigating', label: 'Investigating', color: 'bg-purple-100 text-purple-800' },
  { value: 'resolved', label: 'Resolved', color: 'bg-green-100 text-green-800' },
  { value: 'dismissed', label: 'Dismissed', color: 'bg-red-100 text-red-800' }
]

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' }
]

export default function ReportIssuesAdmin() {
  const [issues, setIssues] = useState<ReportIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterSeverity, setFilterSeverity] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalIssues, setTotalIssues] = useState(0)
  const [selectedIssue, setSelectedIssue] = useState<ReportIssue | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [updating, setUpdating] = useState(false)

  const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

  const fetchIssues = useCallback(async (search = searchTerm) => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        search
      })

      if (filterCategory) params.append('category', filterCategory)
      if (filterSeverity) params.append('severity', filterSeverity)
      if (filterStatus) params.append('status', filterStatus)
      if (filterPriority) params.append('priority', filterPriority)

      const response = await fetch(`${backendURL}/api/admin/report-issues?${params}`)
      const data = await response.json()

      if (data.success) {
        setIssues(data.data)
        setTotalPages(data.pagination.totalPages)
        setTotalIssues(data.pagination.total)
      }
    } catch (error) {
      console.error('Error fetching issues:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, filterCategory, filterSeverity, filterStatus, filterPriority, searchTerm])

  useEffect(() => {
    fetchIssues()
  }, [currentPage, filterCategory, filterSeverity, filterStatus, filterPriority, fetchIssues])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchIssues()
  }

  const handleViewIssue = async (item: ReportIssue) => {
    setSelectedIssue(item)
    setIsViewModalOpen(true)
    
    // Increment view count
    try {
      await fetchAPI('/api/admin/report-issues', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: item._id,
          incrementView: true
        }),
      })
    } catch (error) {
      console.error('Error incrementing view count:', error)
    }
  }

  const handleUpdateIssue = (item: ReportIssue) => {
    setSelectedIssue(item)
    setIsUpdateModalOpen(true)
  }

  const handleStatusUpdate = async (id: string, status: string, priority: string, actionTaken: string, resolution: string) => {
    setUpdating(true)
    try {
      const responseData = await fetchAPI('/api/admin/report-issues', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          status,
          priority,
          actionTaken,
          resolution,
          // Note: investigatedBy should be obtained from session on the server side
        }),
      })

      if (responseData.ok) {
        await fetchIssues()
        setIsUpdateModalOpen(false)
        setSelectedIssue(null)
      }
    } catch (error) {
      console.error('Error updating issue:', error)
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
    const option = issueCategories.find(opt => opt.value === category)
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
          <h1 className="text-3xl font-bold text-gray-900">Issue Reports Management</h1>
          <p className="text-gray-600 mt-2">Manage reported issues and bug reports</p>
        </div>
        <Button onClick={() => fetchIssues()} variant="outline">
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
                <p className="text-sm font-medium text-gray-600">Total Issues</p>
                <p className="text-2xl font-bold text-gray-900">{totalIssues}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New</p>
                <p className="text-2xl font-bold text-blue-600">
                  {issues.filter(i => i.status === 'new').length}
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
                <p className="text-sm font-medium text-gray-600">Investigating</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {issues.filter(i => i.status === 'investigating').length}
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
                  {issues.filter(i => i.status === 'resolved').length}
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
                  placeholder="Search issues..."
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
                {issueCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterSeverity || "all"} onValueChange={(value) => setFilterSeverity(value === "all" ? "" : value)}>
              <SelectTrigger className="w-40 bg-white text-black">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                {severityOptions.map((severity) => (
                  <SelectItem key={severity.value} value={severity.value}>{severity.label}</SelectItem>
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

      {/* Issues Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 10 }, (_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></TableCell>
                  </TableRow>
                ))
              ) : (
                <>
                  {issues.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <AlertTriangle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No issues found matching your criteria.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    issues.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>
                          <div className="max-w-xs truncate" title={item.businessName}>
                            {item.businessName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(item.type)}>
                            {item.type}
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
                            {item.viewCount || 0}
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
                              <DropdownMenuItem onClick={() => handleViewIssue(item)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateIssue(item)}>
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
            Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalIssues)} of {totalIssues} issue items
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

      {/* View Issue Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Issue Details</DialogTitle>
            <DialogDescription>
              View complete issue information
            </DialogDescription>
          </DialogHeader>
          {selectedIssue && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Badge className={getCategoryColor(selectedIssue.type)}>
                    {selectedIssue.type}
                  </Badge>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedIssue.status)}>
                    {statusOptions.find(s => s.value === selectedIssue.status)?.label || selectedIssue.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Priority</Label>
                  <Badge className={getPriorityColor(selectedIssue.priority)}>
                    {priorityOptions.find(p => p.value === selectedIssue.priority)?.label || selectedIssue.priority}
                  </Badge>
                </div>
                <div>
                  <Label>Views</Label>
                  <p className="text-sm font-medium">{selectedIssue.viewCount || 0}</p>
                </div>
              </div>

              <div>
                <Label>Business Name</Label>
                <p className="text-sm font-medium">{selectedIssue.businessName}</p>
              </div>

              <div>
                <Label>Description</Label>
                <div className="bg-gray-50 p-3 rounded-md text-sm whitespace-pre-wrap">
                  {selectedIssue.description}
                </div>
              </div>

              {selectedIssue.location && (
                <div>
                  <Label>Location</Label>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    {selectedIssue.location}
                  </div>
                </div>
              )}

              {selectedIssue.email && (
                <div>
                  <Label>Reported By</Label>
                  <p className="text-sm">{selectedIssue.email}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Created</Label>
                  <p className="text-sm">{formatDate(selectedIssue.createdAt)}</p>
                </div>
                {selectedIssue.investigatedAt && (
                  <div>
                    <Label>Investigated</Label>
                    <p className="text-sm">{formatDate(selectedIssue.investigatedAt)}</p>
                  </div>
                )}
              </div>

              {selectedIssue.investigatedBy && (
                <div>
                  <Label>Investigated By</Label>
                  <p className="text-sm">
                    {selectedIssue.investigatedBy.firstName} {selectedIssue.investigatedBy.lastName}
                  </p>
                </div>
              )}

              {selectedIssue.evidence && (
                <div>
                  <Label>Evidence</Label>
                  <div className="bg-blue-50 p-3 rounded-md text-sm">
                    {selectedIssue.evidence}
                  </div>
                </div>
              )}

              {selectedIssue.resolution && (
                <div>
                  <Label>Resolution</Label>
                  <div className="bg-green-50 p-3 rounded-md text-sm">
                    {selectedIssue.resolution}
                  </div>
                </div>
              )}

              {selectedIssue.actionTaken && (
                <div>
                  <Label>Action Taken</Label>
                  <div className="bg-yellow-50 p-3 rounded-md text-sm">
                    {selectedIssue.actionTaken}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Issue Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Issue Status</DialogTitle>
            <DialogDescription>
              Update the status and add investigation details
            </DialogDescription>
          </DialogHeader>
          {selectedIssue && (
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              const status = formData.get('status') as string
              const priority = formData.get('priority') as string
              const actionTaken = formData.get('actionTaken') as string
              const resolution = formData.get('resolution') as string
              handleStatusUpdate(selectedIssue._id, status, priority, actionTaken, resolution)
            }} className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={selectedIssue.status}>
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
                <Select name="priority" defaultValue={selectedIssue.priority}>
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
                <Label htmlFor="actionTaken">Action Taken</Label>
                <Textarea
                  id="actionTaken"
                  name="actionTaken"
                  defaultValue={selectedIssue.actionTaken || ''}
                  placeholder="Add action taken details..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="resolution">Resolution</Label>
                <Textarea
                  id="resolution"
                  name="resolution"
                  defaultValue={selectedIssue.resolution || ''}
                  placeholder="Add resolution details..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsUpdateModalOpen(false)} className="bg-green-500 hover:bg-green-600 text-white">
                  Cancel
                </Button>
                <Button type="submit" disabled={updating} className="bg-orange-500 hover:bg-orange-600 text-white">
                  {updating ? 'Updating...' : 'Update Issue'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
