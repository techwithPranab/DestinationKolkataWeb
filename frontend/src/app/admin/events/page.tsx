"use client"

import { useEffect, useState, useCallback } from 'react'
import {
  Calendar,
  Camera,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Music,
  Plus,
  Search,
  Star,
  Trash2,
  Users,
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

interface Event {
  _id: string
  name: string
  description: string
  category: string
  location: {
    type: string
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
    phone?: string[]
    email?: string
    website?: string
  }
  startDate: string
  endDate: string
  startTime?: string
  endTime?: string
  ticketPrice: {
    min: number
    max: number
    currency: string
    isFree?: boolean
  }
  organizer: {
    name: string
    contact?: string
    email?: string
    website?: string
  }
  capacity?: number
  venue?: {
    name?: string
    capacity?: number
    type?: string
  }
  rating: {
    average: number
    count: number
  }
  reviews?: number
  images?: {
    url: string
    alt?: string
    isPrimary?: boolean
  }[]
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

const eventCategories = [
  'Concerts', 'Festivals', 'Theater', 'Sports', 'Workshops', 'Exhibitions', 'Cultural', 'Religious', 'Food'
]

const eventTypes = [
  'Concert', 'Festival', 'Workshop', 'Seminar', 'Exhibition', 'Performance',
  'Competition', 'Celebration', 'Fair', 'Conference', 'Webinar', 'Party'
]

const eventFeatures = [
  'Free Entry', 'Paid Entry', 'Registration Required', 'Live Streaming', 'Recording Available',
  'Food Available', 'Drinks Available', 'Parking', 'Accessibility', 'Child Friendly',
  'Photography Allowed', 'Merchandise', 'VIP Access', 'Group Discounts'
]

export default function EventsAdmin() {
  const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
  
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalEvents, setTotalEvents] = useState(0)
  const [pageSize] = useState(10) // Items per page
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    address: '',
    website: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    ticketPriceMin: 0,
    ticketPriceMax: 0,
    currency: 'INR',
    isFree: false,
    organizerName: '',
    organizerContact: '',
    organizerEmail: '',
    organizerWebsite: '',
    capacity: 0,
    status: 'active',
    images: [] as { url: string; alt?: string; isPrimary?: boolean }[]
  })

  const fetchEvents = useCallback(async (page = 1) => {
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

      const response = await fetchAuthenticatedAPI(`/api/admin/events?${params}`)
      const data = await response.json()
      
      setEvents(data.events || [])
      setTotalEvents(data.total || 0)
      setTotalPages(data.pages || 1)
      setCurrentPage(data.page || 1)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }, [searchTerm, filterCategory, filterStatus, pageSize])

  useEffect(() => {
    fetchEvents(currentPage)
  }, [currentPage, fetchEvents])

  useEffect(() => {
    if (currentPage === 1) {
      fetchEvents(1)
    } else {
      setCurrentPage(1)
    }
  }, [searchTerm, filterCategory, filterStatus, fetchEvents])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const eventData = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      location: {
        type: 'Point',
        coordinates: editingEvent?.location?.coordinates || [88.3639, 22.5726] // Default to Kolkata coordinates
      },
      address: {
        street: formData.address,
        city: 'Kolkata',
        state: 'West Bengal'
      },
      contact: {
        website: formData.website
      },
      startDate: formData.startDate,
      endDate: formData.endDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      ticketPrice: {
        min: formData.ticketPriceMin,
        max: formData.ticketPriceMax,
        currency: formData.currency,
        isFree: formData.isFree
      },
      organizer: {
        name: formData.organizerName,
        contact: formData.organizerContact,
        email: formData.organizerEmail,
        website: formData.organizerWebsite
      },
      capacity: formData.capacity,
      images: formData.images,
      status: formData.status
    }

    try {
      const url = editingEvent 
        ? `/api/admin/events/${editingEvent._id}`
        : `/api/admin/events`
      
      const method = editingEvent ? 'PUT' : 'POST'
      
      const response = await fetchAuthenticatedAPI(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })

      if (response.ok) {
        await fetchEvents(currentPage)
        resetForm()
        setIsAddModalOpen(false)
        setEditingEvent(null)
      }
    } catch (error) {
      console.error('Error saving event:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        const response = await fetchAuthenticatedAPI(`/api/admin/events/${id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          await fetchEvents(currentPage)
        }
      } catch (error) {
        console.error('Error deleting event:', error)
      }
    }
  }

  const handleEdit = (event: Event) => {
    // Helper function to format date for HTML date input (YYYY-MM-DD)
    const formatDateForInput = (dateString: string) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ''
      return date.toISOString().split('T')[0]
    }

    setEditingEvent(event)
    setFormData({
      name: event.name || '',
      description: event.description || '',
      category: event.category || '',
      address: event.address?.street || '',
      website: event.contact?.website || '',
      startDate: formatDateForInput(event.startDate || ''),
      endDate: formatDateForInput(event.endDate || ''),
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      ticketPriceMin: event.ticketPrice?.min || 0,
      ticketPriceMax: event.ticketPrice?.max || 0,
      currency: event.ticketPrice?.currency || 'INR',
      isFree: event.ticketPrice?.isFree || false,
      organizerName: event.organizer?.name || '',
      organizerContact: event.organizer?.contact || '',
      organizerEmail: event.organizer?.email || '',
      organizerWebsite: event.organizer?.website || '',
      capacity: event.capacity || 0,
      status: event.status || 'active',
      images: event.images ? event.images.map(img => 
        typeof img === 'string' ? { url: img, alt: event.name } : img
      ) : []
    })
    setIsAddModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      address: '',
      website: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      ticketPriceMin: 0,
      ticketPriceMax: 0,
      currency: 'INR',
      isFree: false,
      organizerName: '',
      organizerContact: '',
      organizerEmail: '',
      organizerWebsite: '',
      capacity: 0,
      status: 'active',
      images: []
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEventIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'music':
      case 'concert':
        return <Music className="h-5 w-5" />
      case 'cultural':
      case 'festival':
        return <Camera className="h-5 w-5" />
      case 'sports':
        return <Users className="h-5 w-5" />
      default:
        return <Calendar className="h-5 w-5" />
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid Date'
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
          <p className="text-gray-600 mt-2">Manage all events and cultural activities in Kolkata</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                resetForm()
                setEditingEvent(null)
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </DialogTitle>
              <DialogDescription>
                {editingEvent 
                  ? 'Update the event information below.'
                  : 'Fill in the details to add a new event.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Event Name</Label>
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
                      {eventCategories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
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
                      {eventCategories.map((category) => (
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

              <div className="grid grid-cols-2 gap-4">
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
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
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
              </div>

              <div>
                <Label htmlFor="address">Venue Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, address: e.target.value })}
                  required
                  className="bg-white text-black"
                />
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
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, startDate: e.target.value })}
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                    className="bg-white text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                    className="bg-white text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ticketPriceMin">Min Ticket Price</Label>
                  <Input
                    id="ticketPriceMin"
                    type="number"
                    min="0"
                    value={formData.ticketPriceMin}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, ticketPriceMin: parseInt(e.target.value) || 0 })}
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="ticketPriceMax">Max Ticket Price</Label>
                  <Input
                    id="ticketPriceMax"
                    type="number"
                    min="0"
                    value={formData.ticketPriceMax}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, ticketPriceMax: parseInt(e.target.value) || 0 })}
                    className="bg-white text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="organizerName">Organizer Name</Label>
                  <Input
                    id="organizerName"
                    value={formData.organizerName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, organizerName: e.target.value })}
                    required
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="organizerContact">Organizer Contact</Label>
                  <Input
                    id="organizerContact"
                    value={formData.organizerContact}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, organizerContact: e.target.value })}
                    className="bg-white text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="organizerEmail">Organizer Email</Label>
                  <Input
                    id="organizerEmail"
                    type="email"
                    value={formData.organizerEmail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, organizerEmail: e.target.value })}
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="organizerWebsite">Organizer Website</Label>
                  <Input
                    id="organizerWebsite"
                    type="url"
                    value={formData.organizerWebsite}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, organizerWebsite: e.target.value })}
                    className="bg-white text-black"
                  />
                </div>
              </div>

              <div>
                <Label>Event Images</Label>
                <ImageUpload
                  images={formData.images}
                  onImagesChange={(images) => setFormData({ ...formData, images })}
                  maxImages={10}
                  folder={getCloudinaryFolder('events')}
                  subfolder={formData.name ? generateSlug(formData.name) : 'unnamed-event'}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="bg-green-500 hover:bg-green-600 text-white">
                  Cancel
                </Button>
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">
                  {editingEvent ? 'Update Event' : 'Add Event'}
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
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{totalEvents}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {events.filter(e => e.status === 'active').length}
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
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {totalEvents}
                  </p>
                </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.length > 0 
                    ? (events.reduce((acc, e) => acc + (e.rating?.average || 0), 0) / events.length).toFixed(1)
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
                  placeholder="Search events..."
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
                {eventCategories.map((category) => (
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
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
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
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-12"></div>
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
                  } else if (events.length === 0) {
                    return (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No events found matching your criteria.</p>
                        </td>
                      </tr>
                    )
                  } else {
                    return events.map((event) => (
                      <tr key={event._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {event.images && event.images.length > 0 ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={typeof event.images[0] === 'string' ? event.images[0] : event.images[0].url}
                                  alt={event.name}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  {getEventIcon(event.category)}
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{event.name}</div>
                              <div className="text-sm text-gray-500">{event.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{event.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div>{event.startDate ? formatDate(event.startDate) : 'N/A'}</div>
                            <div className="text-gray-500">{event.startTime || 'N/A'} - {event.endTime || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {(() => {
                              if (event.ticketPrice?.isFree) return 'Free'
                              if (event.ticketPrice?.min === event.ticketPrice?.max) {
                                return `${event.ticketPrice?.currency || 'INR'} ${event.ticketPrice?.min || 0}`
                              }
                              return `${event.ticketPrice?.currency || 'INR'} ${event.ticketPrice?.min || 0} - ${event.ticketPrice?.max || 0}`
                            })()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {event.capacity && event.capacity > 0 ? `${event.capacity}` : 'Unlimited'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                            <span className="text-sm font-medium">{event.rating?.average ? event.rating.average.toFixed(1) : '0.0'}</span>
                            <span className="text-sm text-gray-500 ml-1">({event.rating?.count || 0})</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusColor(event.status)}>
                            {event.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(event)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleDelete(event._id)}
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
                {Math.min(currentPage * pageSize, totalEvents)}
              </span>{' '}
              of <span className="font-medium">{totalEvents}</span> results
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
