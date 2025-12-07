"use client"
import { fetchAPI } from '@/lib/backend-api'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Star,
  Camera,
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

interface VisitingPlace {
  _id: string
  name: string
  description: string
  category: string
  location: {
    address: string
    coordinates: [number, number]
  }
  contact: {
    phone?: string
    email?: string
    website?: string
  }
  entryFee: {
    adult: number
    child: number
    senior: number
  }
  timings: {
    openTime: string
    closeTime: string
    closedDays: string[]
  }
  rating: {
    average: number
    count: number
  }
  reviews: number
  features: string[]
  bestTimeToVisit: string[]
  images: {
    url: string
    alt?: string
    isPrimary?: boolean
  }[]
  status: 'active' | 'inactive' | 'pending'
  createdAt: string
  updatedAt: string
}

const placeCategories = [
  'Historical', 'Religious', 'Museum', 'Park', 'Monument', 'Cultural', 'Educational', 'Entertainment'
]

const placeFeatures = [
  'Photography Allowed', 'Guided Tours', 'Audio Guide', 'Wheelchair Accessible', 
  'Parking Available', 'Food Court', 'Gift Shop', 'Restrooms', 'Garden', 'Library'
]

const bestTimeOptions = [
  'Morning', 'Afternoon', 'Evening', 'Night', 'Winter', 'Summer', 'Monsoon', 'Weekdays', 'Weekends'
]

const weekDays = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
]

export default function VisitingPlacesAdmin() {
  const [places, setPlaces] = useState<VisitingPlace[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingPlace, setEditingPlace] = useState<VisitingPlace | null>(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPlaces, setTotalPlaces] = useState(0)
  const [pageSize] = useState(10) // Items per page
  // Overall stats (not affected by filtering)
  const [overallStats, setOverallStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    inactive: 0
  })
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    phone: '',
    email: '',
    website: '',
    adultFee: 0,
    childFee: 0,
    seniorFee: 0,
    openTime: '',
    closeTime: '',
    closedDays: [] as string[],
    features: [] as string[],
    bestTimeToVisit: [] as string[],
    status: 'active',
    images: [] as { url: string; alt?: string; isPrimary?: boolean }[]
  })

  const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

  const fetchPlaces = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        status: 'all' // Include all statuses for admin
      })

      if (searchTerm) params.append('search', searchTerm)
      if (filterCategory && filterCategory !== 'all') params.append('category', filterCategory)
      if (filterStatus && filterStatus !== 'all') params.append('status', filterStatus)

      const response = await fetch(`${backendURL}/api/attractions?${params}`)
      const data = await response.json()
      
      setPlaces(data.places || [])
      setTotalPlaces(data.pagination?.total || 0)
      setTotalPages(data.pagination?.totalPages || 1)
      setCurrentPage(data.pagination?.page || 1)
    } catch (error) {
      console.error('Error fetching places:', error)
    } finally {
      setLoading(false)
    }
  }, [searchTerm, filterCategory, filterStatus, pageSize])

  const fetchOverallStats = useCallback(async () => {
    try {
      // Get all places in one call to calculate stats
      const response = await fetchAPI('/api/attractions?status=all&page=1&limit=10000')
      const data = await response.json()
      
      const places = data.places || []
      const activeCount = places.filter((p: VisitingPlace) => p.status === 'active').length
      const pendingCount = places.filter((p: VisitingPlace) => p.status === 'pending').length
      const inactiveCount = places.filter((p: VisitingPlace) => p.status === 'inactive').length
      
      setOverallStats({
        total: data.pagination?.total || places.length,
        active: activeCount,
        pending: pendingCount,
        inactive: inactiveCount
      })
    } catch (error) {
      console.error('Error fetching overall stats:', error)
    }
  }, [])

  useEffect(() => {
    fetchPlaces(currentPage)
    fetchOverallStats()
  }, [currentPage, fetchPlaces, fetchOverallStats])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterCategory, filterStatus])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const placeData = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      location: {
        coordinates: editingPlace?.location?.coordinates || [88.3639, 22.5726] // Default to Kolkata coordinates
      },
      contact: {
        phone: formData.phone || null,
        email: formData.email || null,
        website: formData.website || null
      },
      entryFee: {
        adult: formData.adultFee || 0,
        child: formData.childFee || 0,
        senior: formData.seniorFee || 0
      },
      timings: {
        openTime: formData.openTime || '',
        closeTime: formData.closeTime || '',
        closedDays: formData.closedDays || []
      },
      features: formData.features || [],
      bestTimeToVisit: formData.bestTimeToVisit || [],
      images: formData.images || [],
      status: formData.status || 'active'
    }

    try {
      const url = editingPlace 
        ? `${backendURL}/api/attractions/${editingPlace._id}`
        : `${backendURL}/api/attractions`
      
      const method = editingPlace ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(placeData),
      })

      if (response.ok) {
        await fetchPlaces()
        await fetchOverallStats()
        resetForm()
        setIsAddModalOpen(false)
        setEditingPlace(null)
      }
    } catch (error) {
      console.error('Error saving place:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this place?')) {
      try {
        const response = await fetch(`${backendURL}/api/attractions/${id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          await fetchPlaces()
          await fetchOverallStats()
        }
      } catch (error) {
        console.error('Error deleting place:', error)
      }
    }
  }

  const handleEdit = (place: VisitingPlace) => {
    console.log('Editing place:', place)
    console.log('Place timings:', place.timings)
    console.log('Open time:', place.timings?.openTime)
    console.log('Close time:', place.timings?.closeTime)
    setEditingPlace(place)
    setFormData({
      name: place.name || '',
      description: place.description || '',
      category: place.category || '',
      phone: place.contact?.phone || '',
      email: place.contact?.email || '',
      website: place.contact?.website || '',
      adultFee: place.entryFee?.adult || 0,
      childFee: place.entryFee?.child || 0,
      seniorFee: place.entryFee?.senior || 0,
      openTime: place.timings?.openTime ? formatTimeForInput(place.timings.openTime) : '',
      closeTime: place.timings?.closeTime ? formatTimeForInput(place.timings.closeTime) : '',
      closedDays: place.timings?.closedDays || [],
      features: place.features || [],
      bestTimeToVisit: place.bestTimeToVisit || [],
      status: place.status || 'active',
      images: place.images ? place.images.map(img => 
        typeof img === 'string' ? { url: img, alt: place.name } : img
      ) : []
    })
    setIsAddModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      phone: '',
      email: '',
      website: '',
      adultFee: 0,
      childFee: 0,
      seniorFee: 0,
      openTime: '',
      closeTime: '',
      closedDays: [],
      features: [],
      bestTimeToVisit: [],
      status: 'active',
      images: []
    })
  }

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: (prev.features || []).includes(feature)
        ? (prev.features || []).filter(f => f !== feature)
        : [...(prev.features || []), feature]
    }))
  }

  const handleBestTimeToggle = (time: string) => {
    setFormData(prev => ({
      ...prev,
      bestTimeToVisit: (prev.bestTimeToVisit || []).includes(time)
        ? (prev.bestTimeToVisit || []).filter(t => t !== time)
        : [...(prev.bestTimeToVisit || []), time]
    }))
  }

  const handleClosedDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      closedDays: (prev.closedDays || []).includes(day)
        ? (prev.closedDays || []).filter(d => d !== day)
        : [...(prev.closedDays || []), day]
    }))
  }



  const formatTimeForInput = (timeString: string) => {
    console.log('Formatting time input:', timeString)
    if (!timeString) return ''
    
    // If it's already in HH:MM format, return as is
    if (/^\d{2}:\d{2}$/.test(timeString)) {
      console.log('Time already in correct format:', timeString)
      return timeString
    }
    
    // Try to parse various time formats
    try {
      // If it's a full date-time string, extract time part
      if (timeString.includes('T')) {
        const timePart = timeString.split('T')[1]?.split('.')[0]
        if (timePart && /^\d{2}:\d{2}:\d{2}$/.test(timePart)) {
          const formatted = timePart.substring(0, 5) // Take HH:MM part
          console.log('Extracted time from datetime:', formatted)
          return formatted
        }
      }
      
      // If it's just HH:MM:SS format
      if (/^\d{2}:\d{2}:\d{2}$/.test(timeString)) {
        const formatted = timeString.substring(0, 5)
        console.log('Converted HH:MM:SS to HH:MM:', formatted)
        return formatted
      }
      
      // If it's just HH:MM format already
      if (/^\d{2}:\d{2}$/.test(timeString)) {
        console.log('Time already in HH:MM format:', timeString)
        return timeString
      }
      
      console.log('Unrecognized time format:', timeString)
      return ''
    } catch (error) {
      console.error('Error formatting time:', error, timeString)
      return ''
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Visiting Places Management</h1>
          <p className="text-gray-600 mt-2">Manage all tourist attractions in Kolkata</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button 
            className='bg-orange-600 hover:bg-orange-700 text-white'
            onClick={() => {
              resetForm()
              setEditingPlace(null)
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Place
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle>
                {editingPlace ? 'Edit Visiting Place' : 'Add New Visiting Place'}
              </DialogTitle>
              <DialogDescription>
                {editingPlace 
                  ? 'Update the place information below.'
                  : 'Fill in the details to add a new visiting place.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Place Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value: string) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className="bg-white text-black">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className='bg-white'>
                      {placeCategories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
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

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: string) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="bg-white text-black">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className='bg-white'>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Entry Fees (₹)</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <Label htmlFor="adultFee">Adult</Label>
                    <Input
                      id="adultFee"
                      type="number"
                      min="0"
                      value={formData.adultFee}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, adultFee: parseInt(e.target.value) || 0 })}
                      className="bg-white text-black"
                    />
                  </div>
                  <div>
                    <Label htmlFor="childFee">Child</Label>
                    <Input
                      id="childFee"
                      type="number"
                      min="0"
                      value={formData.childFee}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, childFee: parseInt(e.target.value) || 0 })}
                      className="bg-white text-black"
                    />
                  </div>
                  <div>
                    <Label htmlFor="seniorFee">Senior</Label>
                    <Input
                      id="seniorFee"
                      type="number"
                      min="0"
                      value={formData.seniorFee}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, seniorFee: parseInt(e.target.value) || 0 })}
                      className="bg-white text-black"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="openTime">Opening Time</Label>
                  <Input
                    id="openTime"
                    type="time"
                    value={formData.openTime}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, openTime: e.target.value })}
                    required
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="closeTime">Closing Time</Label>
                  <Input
                    id="closeTime"
                    type="time"
                    value={formData.closeTime}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, closeTime: e.target.value })}
                    required
                    className="bg-white text-black"
                  />
                </div>
              </div>

              <div>
                <Label>Closed Days</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {weekDays.map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={day}
                        checked={(formData.closedDays || []).includes(day)}
                        onChange={() => handleClosedDayToggle(day)}
                        className="rounded"
                      />
                      <Label htmlFor={day} className="text-sm">{day}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Features</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {placeFeatures.map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={feature}
                        checked={(formData.features || []).includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                        className="rounded"
                      />
                      <Label htmlFor={feature} className="text-sm">{feature}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Best Time to Visit</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {bestTimeOptions.map((time) => (
                    <div key={time} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={time}
                        checked={(formData.bestTimeToVisit || []).includes(time)}
                        onChange={() => handleBestTimeToggle(time)}
                        className="rounded"
                      />
                      <Label htmlFor={time} className="text-sm">{time}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Visiting Place Images</Label>
                <ImageUpload
                  images={formData.images}
                  onImagesChange={(images) => setFormData({ ...formData, images })}
                  maxImages={10}
                  folder={getCloudinaryFolder('attractions')}
                  subfolder={formData.name ? generateSlug(formData.name) : 'unnamed-place'}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="bg-green-500 hover:bg-green-600 text-white">
                  Cancel
                </Button>
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">
                  {editingPlace ? 'Update Place' : 'Add Place'}
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
                <p className="text-sm font-medium text-gray-600">Total Places</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.total}</p>
              </div>
              <Camera className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {overallStats.active}
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
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {overallStats.pending}
                </p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {places.length > 0 
                    ? (places.reduce((acc, p) => acc + p.rating.average, 0) / places.length).toFixed(1)
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
                  placeholder="Search places..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white text-black"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48 bg-white text-black">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent className='bg-white'>
                <SelectItem value="all">All Categories</SelectItem>
                {placeCategories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
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

      {/* Places Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Place
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entry Fee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
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
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
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
                  } else if (places.length === 0) {
                    return (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No places found matching your criteria.</p>
                        </td>
                      </tr>
                    )
                  } else {
                    return places.map((place) => (
                      <tr key={place._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {place.images && place.images.length > 0 ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={typeof place.images[0] === 'string' ? place.images[0] : place.images[0].url}
                                  alt={place.name}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <Camera className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{place.name}</div>
                              <div className="text-sm text-gray-500">{place.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{place.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ₹{place.entryFee?.adult || 0}
                            {place.entryFee?.adult === 0 && <span className="ml-1 text-green-600 font-medium">Free</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {place.timings?.openTime || 'N/A'} - {place.timings?.closeTime || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                            <span className="text-sm font-medium">{place.rating?.average ? place.rating.average.toFixed(1) : '0.0'}</span>
                            <span className="text-sm text-gray-500 ml-1">({place.rating?.count || 0})</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusColor(place.status)}>
                            {place.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(place)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleDelete(place._id)}
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
                {Math.min(currentPage * pageSize, totalPlaces)}
              </span>{' '}
              of <span className="font-medium">{totalPlaces}</span> results
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className='bg-orange-600 hover:bg-orange-700 text-white'
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
              className='bg-orange-600 hover:bg-orange-700 text-white'
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
