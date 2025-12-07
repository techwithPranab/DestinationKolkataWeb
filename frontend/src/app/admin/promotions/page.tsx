"use client"

import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Tag,
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type DiscountType = 'percentage' | 'fixed' | 'buy_one_get_one' | 'free_item'

interface Promotion {
  _id: string
  name: string
  description: string
  type: string
  category: string
  discountType: DiscountType
  discountValue: number
  minimumPurchase?: number
  maximumDiscount?: number
  applicableTo: string[]
  validFrom: string
  validUntil: string
  usageLimit?: number
  usedCount: number
  targetAudience: string[]
  termsAndConditions: string
  promoCode?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const promotionTypes = [
  'Discount', 'Coupon', 'Flash Sale', 'Seasonal Offer', 'Loyalty Reward',
  'Bundle Deal', 'Free Gift', 'Cashback', 'Referral Bonus', 'Membership Offer'
]

const promotionCategories = [
  'Restaurant', 'Hotel', 'Sports', 'Travel', 'Events', 'Shopping', 'General'
]

const discountTypes = [
  { value: 'percentage', label: 'Percentage Discount' },
  { value: 'fixed', label: 'Fixed Amount Discount' },
  { value: 'buy_one_get_one', label: 'Buy One Get One' },
  { value: 'free_item', label: 'Free Item' }
]

const applicableItems = [
  'All Restaurants', 'All Hotels', 'All Sports Facilities', 'All Travel Services',
  'All Events', 'Specific Items', 'Food Items', 'Accommodation', 'Transportation'
]

const targetAudiences = [
  'All Users', 'New Users', 'Returning Users', 'Premium Members', 'Students',
  'Families', 'Corporate', 'Senior Citizens', 'Local Residents', 'Tourists'
]

export default function PromotionsAdmin() {
  const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
  
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPromotions, setTotalPromotions] = useState(0)
  const pageSize = 10
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    category: '',
    discountType: 'percentage' as DiscountType,
    discountValue: 0,
    minimumPurchase: 0,
    maximumDiscount: 0,
    applicableTo: [] as string[],
    validFrom: '',
    validUntil: '',
    usageLimit: 0,
    targetAudience: [] as string[],
    termsAndConditions: '',
    promoCode: '',
    isActive: true
  })

  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async (page = 1) => {
    try {
      const response = await fetch(`${backendURL}/api/promotions?page=${page}&limit=${pageSize}`)
      const data = await response.json()
      setPromotions(data.promotions || [])
      setTotalPages(data.totalPages || 1)
      setTotalPromotions(data.total || 0)
      setCurrentPage(page)
    } catch (error) {
      console.error('Error fetching promotions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const promotionData = {
      name: formData.name || '',
      description: formData.description || '',
      type: formData.type || '',
      category: formData.category || '',
      discountType: formData.discountType,
      discountValue: formData.discountValue || 0,
      minimumPurchase: formData.minimumPurchase > 0 ? formData.minimumPurchase : undefined,
      maximumDiscount: formData.maximumDiscount > 0 ? formData.maximumDiscount : undefined,
      applicableTo: formData.applicableTo || [],
      validFrom: formData.validFrom || '',
      validUntil: formData.validUntil || '',
      usageLimit: formData.usageLimit > 0 ? formData.usageLimit : undefined,
      usedCount: 0,
      targetAudience: formData.targetAudience || [],
      termsAndConditions: formData.termsAndConditions || '',
      promoCode: formData.promoCode || undefined,
      isActive: formData.isActive ?? true
    }

    try {
      const url = editingPromotion 
        ? `${backendURL}/api/promotions/${editingPromotion._id}`
        : `${backendURL}/api/promotions`
      
      const method = editingPromotion ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promotionData),
      })

      if (response.ok) {
        await fetchPromotions()
        resetForm()
        setIsAddModalOpen(false)
        setEditingPromotion(null)
      }
    } catch (error) {
      console.error('Error saving promotion:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this promotion?')) {
      try {
        const response = await fetch(`${backendURL}/api/promotions/${id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          await fetchPromotions()
        }
      } catch (error) {
        console.error('Error deleting promotion:', error)
      }
    }
  }

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion)
    setFormData({
      name: promotion.name || '',
      description: promotion.description || '',
      type: promotion.type || '',
      category: promotion.category || '',
      discountType: promotion.discountType || 'percentage',
      discountValue: promotion.discountValue || 0,
      minimumPurchase: promotion.minimumPurchase || 0,
      maximumDiscount: promotion.maximumDiscount || 0,
      applicableTo: promotion.applicableTo || [],
      validFrom: promotion.validFrom || '',
      validUntil: promotion.validUntil || '',
      usageLimit: promotion.usageLimit || 0,
      targetAudience: promotion.targetAudience || [],
      termsAndConditions: promotion.termsAndConditions || '',
      promoCode: promotion.promoCode || '',
      isActive: promotion.isActive ?? true
    })
    setIsAddModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: '',
      category: '',
      discountType: 'percentage' as DiscountType,
      discountValue: 0,
      minimumPurchase: 0,
      maximumDiscount: 0,
      applicableTo: [],
      validFrom: '',
      validUntil: '',
      usageLimit: 0,
      targetAudience: [],
      termsAndConditions: '',
      promoCode: '',
      isActive: true
    })
  }

  const handleApplicableToggle = (item: string) => {
    setFormData(prev => ({
      ...prev,
      applicableTo: prev.applicableTo.includes(item)
        ? prev.applicableTo.filter(a => a !== item)
        : [...prev.applicableTo, item]
    }))
  }

  const handleAudienceToggle = (audience: string) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: prev.targetAudience.includes(audience)
        ? prev.targetAudience.filter(a => a !== audience)
        : [...prev.targetAudience, audience]
    }))
  }

  const filteredPromotions = promotions.filter(promotion => {
    const promotionName = promotion.name || ''
    const promotionType = promotion.type || ''

    const matchesSearch = promotionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promotionType.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !filterType || filterType === 'all' || promotionType === filterType
    const matchesStatus = !filterStatus || filterStatus === 'all' ||
                         (filterStatus === 'active' && promotion.isActive) ||
                         (filterStatus === 'inactive' && !promotion.isActive)

    return matchesSearch && matchesType && matchesStatus
  })

  const getStatusColor = (isActive: boolean, validUntil: string) => {
    const isPromotionActive = (isActive ?? false) && !isExpired(validUntil || '')
    const isPromotionExpired = isExpired(validUntil || '')

    if (isPromotionActive) {
      return 'bg-green-100 text-green-800'
    } else if (isPromotionExpired) {
      return 'bg-red-100 text-red-800'
    } else {
      return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (isActive: boolean, validUntil: string) => {
    const isPromotionActive = (isActive ?? false) && !isExpired(validUntil || '')
    const isPromotionExpired = isExpired(validUntil || '')

    if (isPromotionActive) {
      return 'Active'
    } else if (isPromotionExpired) {
      return 'Expired'
    } else {
      return 'Inactive'
    }
  }

  const getDiscountDisplay = (promotion: Promotion) => {
    const discountType = promotion.discountType || 'percentage'
    const discountValue = promotion.discountValue || 0

    switch (discountType) {
      case 'percentage':
        return `${discountValue}% off`
      case 'fixed':
        return `₹${discountValue} off`
      case 'buy_one_get_one':
        return 'Buy 1 Get 1 Free'
      case 'free_item':
        return 'Free Item'
      default:
        return `${discountValue}% off`
    }
  }

  const getDiscountLabel = (discountType: string) => {
    if (discountType === 'percentage') {
      return 'Discount Percentage (%)'
    } else if (discountType === 'fixed') {
      return 'Discount Amount (₹)'
    } else if (discountType === 'buy_one_get_one') {
      return 'Not Applicable'
    } else {
      return 'Value'
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    } catch {
      return 'Invalid Date'
    }
  }

  const isExpired = (validUntil: string) => {
    if (!validUntil) return false
    return new Date(validUntil) < new Date()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promotions Management</h1>
          <p className="text-gray-600 mt-2">Manage all promotional offers and discounts in Kolkata</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm()
              setEditingPromotion(null)
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Promotion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle>
                {editingPromotion ? 'Edit Promotion' : 'Add New Promotion'}
              </DialogTitle>
              <DialogDescription>
                {editingPromotion 
                  ? 'Update the promotion information below.'
                  : 'Fill in the details to add a new promotional offer.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Promotion Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Promotion Type</Label>
                  <Select value={formData.type} onValueChange={(value: string) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger className="bg-white text-black">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {promotionTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value: string) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className="bg-white text-black">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {promotionCategories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="discountType">Discount Type</Label>
                  <Select value={formData.discountType} onValueChange={(value: DiscountType) => setFormData({ ...formData, discountType: value })}>
                    <SelectTrigger className="bg-white text-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {discountTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discountValue">
                    {getDiscountLabel(formData.discountType)}
                  </Label>
                  <Input
                    id="discountValue"
                    type="number"
                    min="0"
                    value={formData.discountValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, discountValue: parseInt(e.target.value) || 0 })}
                    disabled={formData.discountType === 'buy_one_get_one'}
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="promoCode">Promo Code (Optional)</Label>
                  <Input
                    id="promoCode"
                    value={formData.promoCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, promoCode: e.target.value.toUpperCase() })}
                    placeholder="e.g., SAVE20"
                    className="bg-white text-black"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="validFrom">Valid From</Label>
                  <Input
                    id="validFrom"
                    type="date"
                    value={formData.validFrom}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, validFrom: e.target.value })}
                    required
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="validUntil">Valid Until</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, validUntil: e.target.value })}
                    required
                    className="bg-white text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="minimumPurchase">Min Purchase (₹)</Label>
                  <Input
                    id="minimumPurchase"
                    type="number"
                    min="0"
                    value={formData.minimumPurchase}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, minimumPurchase: parseInt(e.target.value) || 0 })}
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="maximumDiscount">Max Discount (₹)</Label>
                  <Input
                    id="maximumDiscount"
                    type="number"
                    min="0"
                    value={formData.maximumDiscount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, maximumDiscount: parseInt(e.target.value) || 0 })}
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="usageLimit">Usage Limit</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    min="0"
                    value={formData.usageLimit}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 0 })}
                    className="bg-white text-black"
                  />
                </div>
              </div>

              <div>
                <Label>Applicable To</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {applicableItems.map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={item}
                        checked={formData.applicableTo.includes(item)}
                        onChange={() => handleApplicableToggle(item)}
                        className="rounded"
                      />
                      <Label htmlFor={item} className="text-sm">{item}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Target Audience</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {targetAudiences.map((audience) => (
                    <div key={audience} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={audience}
                        checked={formData.targetAudience.includes(audience)}
                        onChange={() => handleAudienceToggle(audience)}
                        className="rounded"
                      />
                      <Label htmlFor={audience} className="text-sm">{audience}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="termsAndConditions">Terms & Conditions</Label>
                <Textarea
                  id="termsAndConditions"
                  value={formData.termsAndConditions}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                  placeholder="Enter terms and conditions for this promotion..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="isActive">Active Promotion</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="bg-green-500 hover:bg-green-600 text-white">
                  Cancel
                </Button>
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">
                  {editingPromotion ? 'Update Promotion' : 'Add Promotion'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Promotions</p>
                <p className="text-2xl font-bold text-gray-900">{filteredPromotions.length}</p>
              </div>
              <Tag className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredPromotions.filter(p => (p.isActive ?? false) && !isExpired(p.validUntil || '')).length}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Usage</p>
                <p className="text-2xl font-bold text-purple-600">
                  {filteredPromotions.reduce((acc, p) => acc + (p.usedCount || 0), 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredPromotions.filter(p => isExpired(p.validUntil || '')).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-red-500" />
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
                  placeholder="Search promotions..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white text-black"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48 bg-white text-black">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {promotionTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40 bg-white text-black">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Promotions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: pageSize }, (_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></TableCell>
                  </TableRow>
                ))
              ) : (
                <>
                  {filteredPromotions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Tag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No promotions found matching your criteria.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPromotions.map((promotion) => (
                      <TableRow key={promotion._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{promotion.name || 'Unnamed Promotion'}</div>
                            <div className="text-sm text-gray-500">{promotion.category || 'No Category'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{promotion.type || 'No Type'}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-green-600">{getDiscountDisplay(promotion)}</span>
                          {promotion.promoCode && (
                            <div className="text-xs text-gray-500 mt-1">{promotion.promoCode}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(promotion.validUntil || '')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(promotion.isActive ?? false, promotion.validUntil || '')}>
                            {getStatusText(promotion.isActive ?? false, promotion.validUntil || '')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {promotion.usedCount || 0}
                            {promotion.usageLimit && `/${promotion.usageLimit}`}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(promotion)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleDelete(promotion._id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalPromotions)} of {totalPromotions} promotions
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPromotions(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
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
                    onClick={() => fetchPromotions(pageNumber)}
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
              onClick={() => fetchPromotions(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
