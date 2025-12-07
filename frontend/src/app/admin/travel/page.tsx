"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Star,
  MapPin,
  Car,
  Plane,
  Train,
  Bus,
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ImageUpload from '@/components/shared/ImageUpload'
import { getCloudinaryFolder, generateSlug } from '@/lib/cloudinary-utils'

interface TravelService {
  _id: string
  name: string
  description: string
  transportType: string
  category: string
  location: {
    address: string
    coordinates: [number, number]
  }
  contact: {
    phone: string
    email: string
    website?: string
  }
  pricing: {
    basePrice: number
    currency: string
    perPerson?: number
    perDay?: number
  }
  duration: {
    days: number
    nights: number
  }
  capacity: number
  inclusions: string[]
  exclusions: string[]
  itinerary: {
    day: number
    title: string
    description: string
    activities: string[]
  }[]
  rating: {
    average: number
    count: number
  }
  images: {
    url: string
    alt?: string
    isPrimary?: boolean
  }[]
  status: 'active' | 'inactive' | 'pending'
  createdAt: string
  updatedAt: string
}

const serviceTypes = [
  'Tour Package', 'Transportation', 'Accommodation', 'Guide Service', 'Adventure Tour',
  'Cultural Tour', 'Food Tour', 'Day Trip', 'Weekend Getaway', 'Luxury Tour'
]

const transportCategories = [
  'Flight', 'Train', 'Bus', 'Car Rental', 'Taxi', 'Private Car', 'Bicycle', 'Boat'
]

const travelInclusions = [
  'Accommodation', 'Meals', 'Transportation', 'Guide', 'Entry Tickets', 'Insurance',
  'Photography', 'Welcome Drink', 'Local Transport', 'Airport Transfer', 'GST'
]

const travelExclusions = [
  'International Flights', 'Personal Expenses', 'Tips & Gratuities', 'Medical Insurance',
  'Visa Fees', 'Alcohol', 'Laundry', 'Phone Calls', 'Extra Meals', 'Optional Activities'
]

export default function TravelAdmin() {
  const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
  
  const [services, setServices] = useState<TravelService[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTransportType, setFilterTransportType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<TravelService | null>(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalServices, setTotalServices] = useState(0)
  const [pageSize] = useState(10) // Items per page
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    transportType: '',
    category: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    basePrice: 0,
    currency: 'INR',
    perPerson: false,
    perDay: false,
    days: 1,
    nights: 0,
    capacity: 0,
    inclusions: [] as string[],
    exclusions: [] as string[],
    images: [] as {
      url: string
      alt?: string
      isPrimary?: boolean
    }[]
  })

  const fetchServices = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        status: 'all' // Include all statuses for admin
      })

      if (searchTerm) params.append('search', searchTerm)
      if (filterTransportType && filterTransportType !== 'all') params.append('transportType', filterTransportType)
      if (filterStatus && filterStatus !== 'all') params.append('status', filterStatus)

      const response = await fetch(`${backendURL}/api/travel?${params}`)
      const data = await response.json()
      
      setServices(data.services || [])
      setTotalServices(data.pagination?.total || 0)
      setTotalPages(data.pagination?.totalPages || 1)
      setCurrentPage(data.pagination?.page || 1)
    } catch (error) {
      console.error('Error fetching travel services:', error)
    } finally {
      setLoading(false)
    }
  }, [searchTerm, filterTransportType, filterStatus, pageSize])

  useEffect(() => {
    fetchServices(currentPage)
  }, [currentPage, fetchServices])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterTransportType, filterStatus])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const serviceData = {
      name: formData.name,
      description: formData.description,
      transportType: formData.transportType,
      category: formData.category,
      location: {
        address: formData.address,
        coordinates: editingService?.location?.coordinates || [88.3639, 22.5726] // Default to Kolkata coordinates
      },
      contact: {
        phone: formData.phone,
        email: formData.email,
        website: formData.website
      },
      pricing: {
        basePrice: formData.basePrice,
        currency: formData.currency,
        perPerson: formData.perPerson ? formData.basePrice : undefined,
        perDay: formData.perDay ? formData.basePrice : undefined
      },
      duration: {
        days: formData.days,
        nights: formData.nights
      },
      capacity: formData.capacity,
      inclusions: formData.inclusions,
      exclusions: formData.exclusions,
      itinerary: [],
      images: formData.images,
      status: 'active'
    }

    try {
      const url = editingService 
        ? `${backendURL}/api/travel/${editingService._id}`
        : `${backendURL}/api/travel`
      
      const method = editingService ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      })

      if (response.ok) {
        await fetchServices()
        resetForm()
        setIsAddModalOpen(false)
        setEditingService(null)
      }
    } catch (error) {
      console.error('Error saving travel service:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this travel service?')) {
      try {
        const response = await fetch(`${backendURL}/api/travel/${id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          await fetchServices()
        }
      } catch (error) {
        console.error('Error deleting travel service:', error)
      }
    }
  }

  const handleEdit = (service: TravelService) => {
    setEditingService(service)
    setFormData({
      name: service.name || '',
      description: service.description || '',
      transportType: service.transportType || '',
      category: service.category || '',
      address: service.location?.address || '',
      phone: service.contact?.phone || '',
      email: service.contact?.email || '',
      website: service.contact?.website || '',
      basePrice: service.pricing?.basePrice || 0,
      currency: service.pricing?.currency || 'INR',
      perPerson: !!service.pricing?.perPerson,
      perDay: !!service.pricing?.perDay,
      days: service.duration?.days || 1,
      nights: service.duration?.nights || 0,
      capacity: service.capacity || 0,
      inclusions: service.inclusions || [],
      exclusions: service.exclusions || [],
      images: service.images ? service.images.map(img => typeof img === 'string' ? { url: img, alt: service.name } : img) : []
    })
    setIsAddModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      transportType: '',
      category: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      basePrice: 0,
      currency: 'INR',
      perPerson: false,
      perDay: false,
      days: 1,
      nights: 0,
      capacity: 0,
      inclusions: [],
      exclusions: [],
      images: [] as {
        url: string
        alt?: string
        isPrimary?: boolean
      }[]
    })
  }

  const handleInclusionToggle = (inclusion: string) => {
    setFormData(prev => ({
      ...prev,
      inclusions: prev.inclusions.includes(inclusion)
        ? prev.inclusions.filter(i => i !== inclusion)
        : [...prev.inclusions, inclusion]
    }))
  }

  const handleExclusionToggle = (exclusion: string) => {
    setFormData(prev => ({
      ...prev,
      exclusions: prev.exclusions.includes(exclusion)
        ? prev.exclusions.filter(e => e !== exclusion)
        : [...prev.exclusions, exclusion]
    }))
  }



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType.toLowerCase()) {
      case 'flight':
      case 'air':
        return <Plane className="h-5 w-5" />
      case 'train':
        return <Train className="h-5 w-5" />
      case 'bus':
        return <Bus className="h-5 w-5" />
      case 'car':
      case 'taxi':
        return <Car className="h-5 w-5" />
      default:
        return <MapPin className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Travel Services Management</h1>
          <p className="text-gray-600 mt-2">Manage all travel packages and services in Kolkata</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button 
            className='bg-orange-500 hover:bg-orange-600 text-white'
            onClick={() => {
              resetForm()
              setEditingService(null)
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle>
                {editingService ? 'Edit Travel Service' : 'Add New Travel Service'}
              </DialogTitle>
              <DialogDescription>
                {editingService 
                  ? 'Update the travel service information below.'
                  : 'Fill in the details to add a new travel service.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Service Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="transportType">Service Type</Label>
                  <Select value={formData.transportType} onValueChange={(value: string) => setFormData({ ...formData, transportType: value })}>
                    <SelectTrigger className="bg-white text-black">
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent className='bg-white'>
                      {serviceTypes.map((type) => (
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
                    <SelectContent className='bg-white'>
                      {transportCategories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="0"
                    value={formData.capacity}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
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

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, address: e.target.value })}
                  required
                  className="bg-white text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="bg-white text-black"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website">Website (Optional)</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, website: e.target.value })}
                  className="bg-white text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="basePrice">Base Price</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    min="0"
                    value={formData.basePrice}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, basePrice: parseInt(e.target.value) || 0 })}
                    required
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value: string) => setFormData({ ...formData, currency: value })}>
                    <SelectTrigger className="bg-white text-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className='bg-white'>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="perPerson"
                    checked={formData.perPerson}
                    onChange={(e) => setFormData({ ...formData, perPerson: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="perPerson">Per Person</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="perDay"
                    checked={formData.perDay}
                    onChange={(e) => setFormData({ ...formData, perDay: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="perDay">Per Day</Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="days">Duration (Days)</Label>
                  <Input
                    id="days"
                    type="number"
                    min="1"
                    value={formData.days}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, days: parseInt(e.target.value) || 1 })}
                    required
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="nights">Nights</Label>
                  <Input
                    id="nights"
                    type="number"
                    min="0"
                    value={formData.nights}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nights: parseInt(e.target.value) || 0 })}
                    className="bg-white text-black"
                  />
                </div>
              </div>

              <div>
                <Label>Inclusions</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {travelInclusions.map((inclusion) => (
                    <div key={inclusion} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={inclusion}
                        checked={formData.inclusions.includes(inclusion)}
                        onChange={() => handleInclusionToggle(inclusion)}
                        className="rounded"
                      />
                      <Label htmlFor={inclusion} className="text-sm">{inclusion}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Exclusions</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {travelExclusions.map((exclusion) => (
                    <div key={exclusion} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={exclusion}
                        checked={formData.exclusions.includes(exclusion)}
                        onChange={() => handleExclusionToggle(exclusion)}
                        className="rounded"
                      />
                      <Label htmlFor={exclusion} className="text-sm">{exclusion}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Images</Label>
                <ImageUpload
                  images={formData.images}
                  onImagesChange={(images) => setFormData({ ...formData, images })}
                  folder={getCloudinaryFolder('general')}
                  subfolder={formData.name ? generateSlug(formData.name) : 'unnamed-service'}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="bg-green-500 hover:bg-green-600 text-white">
                  Cancel
                </Button>
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">
                  {editingService ? 'Update Service' : 'Add Service'}
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
                <p className="text-sm font-medium text-gray-600">Total Services</p>
                <p className="text-2xl font-bold text-gray-900">{totalServices}</p>
              </div>
              <Car className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {services.filter(s => s.status === 'active').length}
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
                <p className="text-sm font-medium text-gray-600">Total Capacity</p>
                <p className="text-2xl font-bold text-purple-600">
                  {services.reduce((acc, s) => acc + (s.capacity || 0), 0)}
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
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {services.length > 0 
                    ? (services.reduce((acc, s) => acc + (s.rating?.average || 0), 0) / services.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
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
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white text-black"
                />
              </div>
            </div>
            <Select value={filterTransportType} onValueChange={setFilterTransportType}>
              <SelectTrigger className="w-48 bg-white text-black">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className='bg-white'>
                <SelectItem value="all">All Types</SelectItem>
                {serviceTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40 bg-white text-black">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className='bg-white'>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(() => {
                  if (loading) {
                    return Array.from({ length: pageSize }, (_, index) => (
                      <tr key={`skeleton-${index}`} className="animate-pulse">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                            <div className="ml-4">
                              <div className="h-4 bg-gray-200 rounded w-32"></div>
                              <div className="h-3 bg-gray-200 rounded w-24 mt-1"></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-6 bg-gray-200 rounded w-16"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <div className="h-8 w-8 bg-gray-200 rounded"></div>
                            <div className="h-8 w-8 bg-gray-200 rounded"></div>
                            <div className="h-8 w-8 bg-gray-200 rounded"></div>
                          </div>
                        </td>
                      </tr>
                    ))
                  } else if (services.length === 0) {
                    return (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No travel services found matching your criteria.</p>
                        </td>
                      </tr>
                    )
                  } else {
                    return services.map((service) => (
                      <tr key={service._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {service.images && service.images.length > 0 ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={typeof service.images[0] === 'string' ? service.images[0] : service.images[0].url}
                                  alt={service.name}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  {getServiceIcon(service.category)}
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{service.name}</div>
                              <div className="text-sm text-gray-500">{service.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{service.transportType}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {service.pricing?.currency || 'INR'} {service.pricing?.basePrice || 'N/A'}
                            {service.pricing?.perPerson && ' per person'}
                            {service.pricing?.perDay && ' per day'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {service.duration?.days || 0}D • {service.duration?.nights || 0}N
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                            <span className="text-sm font-medium">{service.rating?.average ? service.rating.average.toFixed(1) : '0.0'}</span>
                            <span className="text-sm text-gray-500 ml-1">({service.rating?.count || 0})</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusColor(service.status)}>
                            {service.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(service)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            {/* <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button> */}
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleDelete(service._id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                })()}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
          <div className="flex items-center text-sm text-gray-700">
            <p>
              Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * pageSize, totalServices)}
              </span>{' '}
              of <span className="font-medium">{totalServices}</span> results
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                    onClick={() => setCurrentPage(pageNumber)}
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
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
