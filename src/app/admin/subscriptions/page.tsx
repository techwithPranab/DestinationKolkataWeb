"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  CreditCard,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Crown,
  Star
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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

interface Subscription {
  _id: string
  userId: {
    _id: string
    name: string
    email: string
  }
  planType: 'free' | 'premium' | 'business'
  status: 'active' | 'inactive' | 'cancelled' | 'expired' | 'pending'
  startDate: string
  endDate: string
  amount: number
  currency: string
  paymentMethod: string
  autoRenew: boolean
  features: string[]
  createdAt: string
  updatedAt: string
}

export default function SubscriptionsAdmin() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPlan, setFilterPlan] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [formData, setFormData] = useState({
    userId: '',
    planType: 'premium',
    status: 'active',
    startDate: '',
    endDate: '',
    amount: 0,
    currency: 'INR',
    paymentMethod: 'card',
    autoRenew: true,
    features: [] as string[]
  })

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [totalSubscriptions, setTotalSubscriptions] = useState(0)

  useEffect(() => {
    fetchSubscriptions()
  }, [currentPage, searchTerm, filterPlan, filterStatus])

  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm,
        plan: filterPlan || 'all',
        status: filterStatus || 'all'
      })

      const response = await fetch(`/api/admin/subscriptions?${params}`)
      const data = await response.json()
      setSubscriptions(data.subscriptions || [])
      setTotalSubscriptions(data.total || 0)
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const subscriptionData = {
      userId: formData.userId,
      planType: formData.planType,
      status: formData.status,
      startDate: formData.startDate,
      endDate: formData.endDate,
      amount: formData.amount,
      currency: formData.currency,
      paymentMethod: formData.paymentMethod,
      autoRenew: formData.autoRenew,
      features: formData.features
    }

    try {
      const url = editingSubscription
        ? `/api/admin/subscriptions/${editingSubscription._id}`
        : '/api/admin/subscriptions'

      const method = editingSubscription ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionData),
      })

      if (response.ok) {
        await fetchSubscriptions()
        resetForm()
        setIsAddModalOpen(false)
        setEditingSubscription(null)
      }
    } catch (error) {
      console.error('Error saving subscription:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this subscription?')) {
      try {
        const response = await fetch(`/api/admin/subscriptions/${id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          await fetchSubscriptions()
        }
      } catch (error) {
        console.error('Error deleting subscription:', error)
      }
    }
  }

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription)
    setFormData({
      userId: subscription.userId._id,
      planType: subscription.planType,
      status: subscription.status,
      startDate: subscription.startDate.split('T')[0],
      endDate: subscription.endDate.split('T')[0],
      amount: subscription.amount,
      currency: subscription.currency,
      paymentMethod: subscription.paymentMethod,
      autoRenew: subscription.autoRenew,
      features: subscription.features
    })
    setIsAddModalOpen(true)
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/subscriptions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        await fetchSubscriptions()
      }
    } catch (error) {
      console.error('Error updating subscription status:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      userId: '',
      planType: 'premium',
      status: 'active',
      startDate: '',
      endDate: '',
      amount: 0,
      currency: 'INR',
      paymentMethod: 'card',
      autoRenew: true,
      features: []
    })
  }

  // Pagination calculations
  const totalPages = Math.ceil(totalSubscriptions / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage + 1
  const endIndex = Math.min(currentPage * itemsPerPage, totalSubscriptions)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handlePlanFilterChange = (value: string) => {
    setFilterPlan(value)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleStatusFilterChange = (value: string) => {
    setFilterStatus(value)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'expired':
        return 'bg-yellow-100 text-yellow-800'
      case 'pending':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'business':
        return <Crown className="h-4 w-4 text-purple-600" />
      case 'premium':
        return <Star className="h-4 w-4 text-orange-600" />
      default:
        return <CreditCard className="h-4 w-4 text-gray-600" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600 mt-2">Manage user subscriptions and billing</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm()
              setEditingSubscription(null)
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Subscription
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle>
                {editingSubscription ? 'Edit Subscription' : 'Add New Subscription'}
              </DialogTitle>
              <DialogDescription>
                {editingSubscription
                  ? 'Update the subscription details below.'
                  : 'Fill in the details to add a new subscription.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    required
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="planType">Plan Type</Label>
                  <Select value={formData.planType} onValueChange={(value) => setFormData({ ...formData, planType: value })}>
                    <SelectTrigger className="bg-white text-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                    className="bg-white text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    required
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                    <SelectTrigger className="bg-white text-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="INR">INR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger className="bg-white text-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
                    <SelectTrigger className="bg-white text-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="card">Credit Card</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="netbanking">Net Banking</SelectItem>
                      <SelectItem value="wallet">Digital Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoRenew"
                    checked={formData.autoRenew}
                    onChange={(e) => setFormData({ ...formData, autoRenew: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="autoRenew">Auto Renew</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="bg-green-500 hover:bg-green-600 text-white">
                  Cancel
                </Button>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">
                  {editingSubscription ? 'Update Subscription' : 'Add Subscription'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search subscriptions by user name or email..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 bg-white text-black"
                />
              </div>
            </div>
            <Select value={filterPlan} onValueChange={handlePlanFilterChange}>
              <SelectTrigger className="w-full sm:w-48 bg-white text-black">
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-full sm:w-48 bg-white text-black">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Subscriptions ({totalSubscriptions})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Auto Renew</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((subscription) => (
                  <TableRow key={subscription._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">
                          {subscription.userId.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {subscription.userId.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getPlanIcon(subscription.planType)}
                        <Badge variant="outline" className="capitalize">
                          {subscription.planType}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                        <span className="font-medium">
                          {formatCurrency(subscription.amount, subscription.currency)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(subscription.status)}>
                        {subscription.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(subscription.startDate)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(subscription.endDate)}
                    </TableCell>
                    <TableCell>
                      {subscription.autoRenew ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(subscription)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(subscription._id, 'active')}
                            disabled={subscription.status === 'active'}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Activate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(subscription._id, 'cancelled')}
                            disabled={subscription.status === 'cancelled'}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(subscription._id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="flex-1 text-sm text-gray-700">
                Showing {startIndex} to {endIndex} of {totalSubscriptions} subscriptions
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                    if (pageNumber > totalPages) return null

                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNumber)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNumber}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {subscriptions.length === 0 && !loading && (
        <div className="text-center py-12">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions found</h3>
          <p className="text-gray-600">
            {searchTerm || filterPlan || filterStatus
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first subscription.'
            }
          </p>
        </div>
      )}
    </div>
  )
}
