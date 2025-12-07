"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Star,
  Building2,
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
import { fetchAuthenticatedAPI } from '@/lib/backend-api'

type HotelStatus = 'active' | 'inactive' | 'pending' | 'rejected'

interface Hotel {
  _id: string
  name: string
  description: string
  shortDescription?: string
  category: string
  location: {
    address: string
    coordinates: [number, number]
  }
  address: {
    street?: string
    area?: string
    city?: string
    state?: string
    pincode?: string
    landmark?: string
  }
  contact: {
    phone: string[]
    email: string
    website?: string
    socialMedia?: {
      facebook?: string
      instagram?: string
      twitter?: string
    }
  }
  priceRange: {
    min: number
    max: number
    currency: string
  }
  rating: {
    average: number
    count: number
  }
  reviews: number
  checkInTime: string
  checkOutTime: string
  amenities: string[]
  roomTypes: {
    name: string
    price: number
    capacity: number
    amenities?: string[]
    images?: string[]
    available?: boolean
  }[]
  images: {
    url: string
    alt?: string
    isPrimary?: boolean
  }[]
  tags: string[]
  status: HotelStatus
  featured: boolean
  promoted: boolean
  views: number
  cancellationPolicy?: string
  policies: string[]
  createdAt: string
  updatedAt: string
}

const hotelCategories = [
  'Luxury', 'Business', 'Budget', 'Boutique', 'Resort', 'Heritage'
]

const hotelAmenities = [
  'WiFi', 'AC', 'Parking', 'Room Service', 'Restaurant', 'Gym', 'Pool',
  'Spa', 'Conference Hall', 'Airport Shuttle', 'Laundry', 'Pet Friendly'
]

export default function HotelsAdmin() {
  const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
  
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalHotels, setTotalHotels] = useState(0)
  const [activeHotelsCount, setActiveHotelsCount] = useState(0)
  const [pageSize] = useState(10) // Items per page
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    category: '',
    phone: '',
    email: '',
    website: '',
    street: '',
    area: '',
    city: 'Kolkata',
    state: 'West Bengal',
    pincode: '',
    landmark: '',
    facebook: '',
    instagram: '',
    twitter: '',
    priceRange: {
      min: 0,
      max: 0,
      currency: 'INR'
    },
    checkIn: '',
    checkOut: '',
    amenities: [] as string[],
    roomTypes: [] as { name: string; price: number; capacity: number; amenities?: string[]; images?: string[]; available?: boolean }[],
    images: [] as { url: string; alt?: string; isPrimary?: boolean }[],
    tags: [] as string[],
    status: 'active' as HotelStatus,
    featured: false,
    promoted: false,
    cancellationPolicy: '',
    policies: [] as string[]
  })

  const fetchHotels = useCallback(async (page = 1) => {
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

      const response = await fetchAuthenticatedAPI(`/api/hotels?${params}`)
      const data = await response.json()
      console.log('Fetched hotels:', data)
      
      setHotels(data.hotels || [])
      setTotalHotels(data.pagination?.overallTotal || 0)
      setTotalPages(data.pagination?.totalPages || 1)
      setCurrentPage(data.pagination?.page || 1)
      setActiveHotelsCount(data.pagination?.activeCount || 0)
    } catch (error) {
      console.error('Error fetching hotels:', error)
    } finally {
      setLoading(false)
    }
  }, [searchTerm, filterCategory, filterStatus, pageSize])

  useEffect(() => {
    fetchHotels(currentPage)
  }, [currentPage, fetchHotels])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterCategory, filterStatus])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const hotelData = {
      name: formData.name,
      description: formData.description,
      shortDescription: formData.shortDescription,
      category: formData.category,
      location: {
        address: `${formData.street}, ${formData.area}, ${formData.city}, ${formData.state} ${formData.pincode}`.replace(/, ,/g, '').replace(/(^,|,$)/g, '').trim(),
        coordinates: [88.3639, 22.5726] // Default to Kolkata coordinates
      },
      address: {
        street: formData.street,
        area: formData.area,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        landmark: formData.landmark
      },
      contact: {
        phone: [formData.phone],
        email: formData.email,
        website: formData.website,
        socialMedia: {
          facebook: formData.facebook,
          instagram: formData.instagram,
          twitter: formData.twitter
        }
      },
      priceRange: formData.priceRange,
      checkInTime: formData.checkIn,
      checkOutTime: formData.checkOut,
      amenities: formData.amenities,
      roomTypes: formData.roomTypes,
      images: formData.images,
      tags: formData.tags,
      featured: formData.featured,
      promoted: formData.promoted,
      cancellationPolicy: formData.cancellationPolicy,
      policies: formData.policies,
      status: formData.status
    }

    try {
      const url = editingHotel 
        ? `/api/hotels/${editingHotel._id}`
        : `/api/hotels`
      
      const method = editingHotel ? 'PUT' : 'POST'
      
      const response = await fetchAuthenticatedAPI(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hotelData),
      })

      if (response.ok) {
        await fetchHotels(currentPage)
        resetForm()
        setIsAddModalOpen(false)
        setEditingHotel(null)
      }
    } catch (error) {
      console.error('Error saving hotel:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this hotel?')) {
      try {
        const response = await fetchAuthenticatedAPI(`/api/hotels/${id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          await fetchHotels(currentPage)
        }
      } catch (error) {
        console.error('Error deleting hotel:', error)
      }
    }
  }

  const handleEdit = (hotel: Hotel) => {
    setEditingHotel(hotel)
    setFormData({
      name: hotel.name,
      description: hotel.description,
      shortDescription: hotel.shortDescription || '',
      category: (hotel.category && hotelCategories.includes(hotel.category)) ? hotel.category : '',
      phone: hotel.contact?.phone?.[0] || '',
      email: hotel.contact?.email || '',
      website: hotel.contact?.website || '',
      street: hotel.address?.street || '',
      area: hotel.address?.area || '',
      city: hotel.address?.city || 'Kolkata',
      state: hotel.address?.state || 'West Bengal',
      pincode: hotel.address?.pincode || '',
      landmark: hotel.address?.landmark || '',
      facebook: hotel.contact?.socialMedia?.facebook || '',
      instagram: hotel.contact?.socialMedia?.instagram || '',
      twitter: hotel.contact?.socialMedia?.twitter || '',
      priceRange: hotel.priceRange || {
        min: 0,
        max: 0,
        currency: 'INR'
      },
      checkIn: hotel.checkInTime || '',
      checkOut: hotel.checkOutTime || '',
      amenities: hotel.amenities || [],
      roomTypes: hotel.roomTypes || [],
      images: hotel.images || [],
      tags: hotel.tags || [],
      status: hotel.status || 'active',
      featured: hotel.featured || false,
      promoted: hotel.promoted || false,
      cancellationPolicy: hotel.cancellationPolicy || '',
      policies: hotel.policies || []
    })
    setIsAddModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      shortDescription: '',
      category: '',
      phone: '',
      email: '',
      website: '',
      street: '',
      area: '',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '',
      landmark: '',
      facebook: '',
      instagram: '',
      twitter: '',
      priceRange: {
        min: 0,
        max: 0,
        currency: 'INR'
      },
      checkIn: '',
      checkOut: '',
      amenities: [],
      roomTypes: [],
      images: [],
      tags: [],
      status: 'active',
      featured: false,
      promoted: false,
      cancellationPolicy: '',
      policies: []
    })
  }

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hotels Management</h1>
          <p className="text-gray-600 mt-2">Manage all hotels and accommodations in Kolkata</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => {
              resetForm()
              setEditingHotel(null)
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Hotel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle>
                {editingHotel ? 'Edit Hotel' : 'Add New Hotel'}
              </DialogTitle>
              <DialogDescription>
                {editingHotel 
                  ? 'Update the hotel information below.'
                  : 'Fill in the details to add a new hotel.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value: string) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className="bg-white text-black">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className='bg-white'>
                      {hotelCategories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: HotelStatus) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger className="bg-white text-black">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className='bg-white'>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="name">Hotel Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-white text-black"
                />
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
                  <Label htmlFor="street">Street</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, street: e.target.value })}
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="area">Area</Label>
                  <Input
                    id="area"
                    value={formData.area}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, area: e.target.value })}
                    className="bg-white text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, city: e.target.value })}
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, state: e.target.value })}
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, pincode: e.target.value })}
                    className="bg-white text-black"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="landmark">Landmark</Label>
                <Input
                  id="landmark"
                  value={formData.landmark}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, landmark: e.target.value })}
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

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={formData.facebook}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, facebook: e.target.value })}
                    placeholder="Facebook URL"
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.instagram}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="Instagram URL"
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={formData.twitter}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, twitter: e.target.value })}
                    placeholder="Twitter URL"
                    className="bg-white text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priceMin">Price Range (Min)</Label>
                  <Input
                    id="priceMin"
                    type="number"
                    min="0"
                    value={formData.priceRange.min}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({
                      ...formData,
                      priceRange: {
                        ...formData.priceRange,
                        min: parseInt(e.target.value) || 0
                      }
                    })}
                    required
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="priceMax">Price Range (Max)</Label>
                  <Input
                    id="priceMax"
                    type="number"
                    min="0"
                    value={formData.priceRange.max}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({
                      ...formData,
                      priceRange: {
                        ...formData.priceRange,
                        max: parseInt(e.target.value) || 0
                      }
                    })}
                    required
                    className="bg-white text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="checkIn">Check-in Time</Label>
                  <Input
                    id="checkIn"
                    type="time"
                    value={formData.checkIn}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, checkIn: e.target.value })}
                    required
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="checkOut">Check-out Time</Label>
                  <Input
                    id="checkOut"
                    type="time"
                    value={formData.checkOut}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, checkOut: e.target.value })}
                    required
                    className="bg-white text-black"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                <Textarea
                  id="cancellationPolicy"
                  value={formData.cancellationPolicy}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, cancellationPolicy: e.target.value })}
                  placeholder="Hotel's cancellation policy"
                />
              </div>

              <div>
                <Label>Amenities</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {hotelAmenities.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={amenity}
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => handleAmenityToggle(amenity)}
                        className="rounded"
                      />
                      <Label htmlFor={amenity} className="text-sm">{amenity}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Hotel Images</Label>
                <ImageUpload
                  images={formData.images}
                  onImagesChange={(images) => setFormData({ ...formData, images })}
                  maxImages={10}
                  folder={getCloudinaryFolder('hotels')}
                  subfolder={formData.name ? generateSlug(formData.name) : 'unnamed-hotel'}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="featured">Featured Hotel</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="promoted"
                    checked={formData.promoted}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, promoted: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="promoted">Promoted Hotel</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="bg-green-500 hover:bg-green-600 text-white">
                  Cancel
                </Button>
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">
                  {editingHotel ? 'Update Hotel' : 'Add Hotel'}
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
                <p className="text-sm font-medium text-gray-600">Total Hotels</p>
                <p className="text-2xl font-bold text-gray-900">{totalHotels}</p>
              </div>
              <Building2 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {activeHotelsCount}
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
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-blue-600">
                  {hotels.reduce((acc, h) => acc + (h.views || 0), 0)}
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {hotels.length > 0 
                    ? (hotels.reduce((acc, h) => {
                        const rating = h.rating && typeof h.rating.average === 'number' ? h.rating.average : 0;
                        return acc + rating;
                      }, 0) / hotels.length).toFixed(1)
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
                  placeholder="Search hotels..."
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
                {hotelCategories.map((category) => (
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
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Hotels Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hotel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="hidden px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
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
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-12"></div>
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
                  } else if (hotels.length === 0) {
                    return (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No hotels found matching your criteria.</p>
                        </td>
                      </tr>
                    )
                  } else {
                    return hotels.map((hotel) => (
                      <tr key={hotel._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {hotel.images && hotel.images.length > 0 ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={hotel.images[0].url}
                                  alt={hotel.name}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <Building2 className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{hotel.name || 'N/A'}</div>
                              <div className="text-sm text-gray-500 line-clamp-1">{hotel.shortDescription || hotel.description || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{hotel.category || 'N/A'}</div>
                        </td>
                        <td className="hidden px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{hotel.location?.address || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {hotel.priceRange?.currency
                              ? `${hotel.priceRange.currency} ${hotel.priceRange.min} - ${hotel.priceRange.max}`
                              : 'N/A'
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                            <span className="text-sm font-medium">
                              {hotel.rating && typeof hotel.rating.average === 'number' 
                                ? hotel.rating.average.toFixed(1) 
                                : '0.0'
                              }
                            </span>
                            <span className="text-sm text-gray-500 ml-1">
                              ({hotel.rating && typeof hotel.rating.count === 'number' ? hotel.rating.count : 0})
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{hotel.views || 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusColor(hotel.status || 'pending')}>
                            {hotel.status || 'pending'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(hotel)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            {/* <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button> */}
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleDelete(hotel._id)}
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
                {Math.min(currentPage * pageSize, totalHotels)}
              </span>{' '}
              of <span className="font-medium">{totalHotels}</span> results
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className='bg-orange-500 hover:bg-orange-600 text-white'
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
              className='bg-orange-500 hover:bg-orange-600 text-white'
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
