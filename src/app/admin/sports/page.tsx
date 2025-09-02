"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Star,
  Trophy,
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

interface SportsFacility {
  _id: string
  name: string
  description: string
  sportType: string
  venueType: string
  location: {
    address: string
    coordinates: [number, number]
  }
  contact: {
    phone: string
    email: string
    website?: string
  }
  capacity: number
  facilities: string[]
  pricing: {
    hourly: number
    daily: number
    monthly: number
  }
  operatingHours: {
    openTime: string
    closeTime: string
    closedDays: string[]
  }
  rating: {
    average: number
    count: number
  }
  reviews: number
  images: string[]
  status: 'active' | 'inactive' | 'pending'
  createdAt: string
  updatedAt: string
}

const sportTypes = [
  'Cricket', 'Football', 'Basketball', 'Tennis', 'Badminton', 'Swimming',
  'Table Tennis', 'Volleyball', 'Hockey', 'Golf', 'Bowling', 'Snooker',
  'Gym', 'Yoga', 'Martial Arts', 'Boxing', 'Cycling', 'Running Track'
]

const venueTypes = [
  'Stadium', 'Ground', 'Court', 'Arena', 'Pool', 'Gym', 'Academy', 'Club'
]

const sportFacilities = [
  'Changing Rooms', 'Showers', 'Lockers', 'Parking', 'Cafeteria', 'Equipment Rental',
  'Coaching Available', 'Floodlights', 'Seating Area', 'First Aid', 'WiFi', 'AC'
]

const weekDays = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
]

export default function SportsAdmin() {
  const [facilities, setFacilities] = useState<SportsFacility[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSportType, setFilterSportType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingFacility, setEditingFacility] = useState<SportsFacility | null>(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalFacilities, setTotalFacilities] = useState(0)
  const [pageSize] = useState(10) // Items per page
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sportType: '',
    venueType: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    capacity: 0,
    hourlyRate: 0,
    dailyRate: 0,
    monthlyRate: 0,
    openTime: '',
    closeTime: '',
    closedDays: [] as string[],
    facilities: [] as string[],
    images: [] as string[]
  })

  const fetchFacilities = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        status: 'all' // Include all statuses for admin
      })

      if (searchTerm) params.append('search', searchTerm)
      if (filterSportType && filterSportType !== 'all') params.append('sport', filterSportType)
      if (filterStatus && filterStatus !== 'all') params.append('status', filterStatus)

      const response = await fetch(`/api/sports?${params}`)
      const data = await response.json()
      
      setFacilities(data.facilities || [])
      setTotalFacilities(data.pagination?.total || 0)
      setTotalPages(data.pagination?.totalPages || 1)
      setCurrentPage(data.pagination?.page || 1)
    } catch (error) {
      console.error('Error fetching sports facilities:', error)
    } finally {
      setLoading(false)
    }
  }, [searchTerm, filterSportType, filterStatus, pageSize])

  useEffect(() => {
    fetchFacilities(currentPage)
  }, [currentPage, fetchFacilities])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterSportType, filterStatus])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const facilityData = {
      name: formData.name,
      description: formData.description,
      sportType: formData.sportType,
      venueType: formData.venueType,
      location: {
        address: formData.address,
        coordinates: editingFacility?.location?.coordinates || [88.3639, 22.5726] // Default to Kolkata coordinates
      },
      contact: {
        phone: formData.phone,
        email: formData.email,
        website: formData.website
      },
      capacity: formData.capacity,
      facilities: formData.facilities,
      pricing: {
        hourly: formData.hourlyRate,
        daily: formData.dailyRate,
        monthly: formData.monthlyRate
      },
      operatingHours: {
        openTime: formData.openTime,
        closeTime: formData.closeTime,
        closedDays: formData.closedDays
      },
      images: formData.images,
      status: 'active'
    }

    try {
      const url = editingFacility 
        ? `/api/sports/${editingFacility._id}`
        : '/api/sports'
      
      const method = editingFacility ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(facilityData),
      })

      if (response.ok) {
        await fetchFacilities()
        resetForm()
        setIsAddModalOpen(false)
        setEditingFacility(null)
      }
    } catch (error) {
      console.error('Error saving sports facility:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this sports facility?')) {
      try {
        const response = await fetch(`/api/sports/${id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          await fetchFacilities()
        }
      } catch (error) {
        console.error('Error deleting sports facility:', error)
      }
    }
  }

  const handleEdit = (facility: SportsFacility) => {
    setEditingFacility(facility)
    setFormData({
      name: facility.name || '',
      description: facility.description || '',
      sportType: facility.sportType || '',
      venueType: facility.venueType || '',
      address: facility.location?.address || '',
      phone: facility.contact?.phone || '',
      email: facility.contact?.email || '',
      website: facility.contact?.website || '',
      capacity: facility.capacity || 0,
      hourlyRate: facility.pricing?.hourly || 0,
      dailyRate: facility.pricing?.daily || 0,
      monthlyRate: facility.pricing?.monthly || 0,
      openTime: facility.operatingHours?.openTime || '',
      closeTime: facility.operatingHours?.closeTime || '',
      closedDays: facility.operatingHours?.closedDays || [],
      facilities: facility.facilities || [],
      images: facility.images || []
    })
    setIsAddModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      sportType: '',
      venueType: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      capacity: 0,
      hourlyRate: 0,
      dailyRate: 0,
      monthlyRate: 0,
      openTime: '',
      closeTime: '',
      closedDays: [],
      facilities: [],
      images: []
    })
  }

  const handleFacilityToggle = (facility: string) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }))
  }

  const handleClosedDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      closedDays: prev.closedDays.includes(day)
        ? prev.closedDays.filter(d => d !== day)
        : [...prev.closedDays, day]
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
          <h1 className="text-3xl font-bold text-gray-900">Sports Facilities Management</h1>
          <p className="text-gray-600 mt-2">Manage all sports venues and facilities in Kolkata</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm()
              setEditingFacility(null)
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Facility
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingFacility ? 'Edit Sports Facility' : 'Add New Sports Facility'}
              </DialogTitle>
              <DialogDescription>
                {editingFacility 
                  ? 'Update the sports facility information below.'
                  : 'Fill in the details to add a new sports facility.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Facility Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="sportType">Sport Type</Label>
                  <Select value={formData.sportType} onValueChange={(value: string) => setFormData({ ...formData, sportType: value })}>
                    <SelectTrigger className="bg-white text-black">
                      <SelectValue placeholder="Select sport type" />
                    </SelectTrigger>
                    <SelectContent>
                      {sportTypes.map((sport) => (
                        <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="venueType">Venue Type</Label>
                  <Select value={formData.venueType} onValueChange={(value: string) => setFormData({ ...formData, venueType: value })}>
                    <SelectTrigger className="bg-white text-black">
                      <SelectValue placeholder="Select venue type" />
                    </SelectTrigger>
                    <SelectContent>
                      {venueTypes.map((venue) => (
                        <SelectItem key={venue} value={venue}>{venue}</SelectItem>
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
                    required
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

              <div>
                <Label>Pricing (₹)</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <Label htmlFor="hourlyRate">Hourly</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      min="0"
                      value={formData.hourlyRate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, hourlyRate: parseInt(e.target.value) || 0 })}
                      className="bg-white text-black"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dailyRate">Daily</Label>
                    <Input
                      id="dailyRate"
                      type="number"
                      min="0"
                      value={formData.dailyRate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, dailyRate: parseInt(e.target.value) || 0 })}
                      className="bg-white text-black"
                    />
                  </div>
                  <div>
                    <Label htmlFor="monthlyRate">Monthly</Label>
                    <Input
                      id="monthlyRate"
                      type="number"
                      min="0"
                      value={formData.monthlyRate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, monthlyRate: parseInt(e.target.value) || 0 })}
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
                        checked={formData.closedDays.includes(day)}
                        onChange={() => handleClosedDayToggle(day)}
                        className="rounded"
                      />
                      <Label htmlFor={day} className="text-sm">{day}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Facilities</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {sportFacilities.map((facility) => (
                    <div key={facility} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={facility}
                        checked={formData.facilities.includes(facility)}
                        onChange={() => handleFacilityToggle(facility)}
                        className="rounded"
                      />
                      <Label htmlFor={facility} className="text-sm">{facility}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingFacility ? 'Update Facility' : 'Add Facility'}
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
                <p className="text-sm font-medium text-gray-600">Total Facilities</p>
                <p className="text-2xl font-bold text-gray-900">{totalFacilities}</p>
              </div>
              <Trophy className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {facilities.filter(f => f.status === 'active').length}
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
                <p className="text-2xl font-bold text-blue-600">
                  {facilities.reduce((acc, f) => acc + (f.capacity || 0), 0)}
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
                  {facilities.length > 0 
                    ? (facilities.reduce((acc, f) => acc + (f.rating?.average || 0), 0) / facilities.length).toFixed(1)
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
                  placeholder="Search facilities..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white text-black"
                />
              </div>
            </div>
            <Select value={filterSportType} onValueChange={setFilterSportType}>
              <SelectTrigger className="w-48 bg-white text-black">
                <SelectValue placeholder="Filter by sport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sports</SelectItem>
                {sportTypes.map((sport) => (
                  <SelectItem key={sport} value={sport}>{sport}</SelectItem>
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
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Facilities Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Facility
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sport Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
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
                  } else if (facilities.length === 0) {
                    return (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No sports facilities found matching your criteria.</p>
                        </td>
                      </tr>
                    )
                  } else {
                    return facilities.map((facility) => (
                      <tr key={facility._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {facility.images && facility.images.length > 0 ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={facility.images[0]}
                                  alt={facility.name}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <Trophy className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{facility.name}</div>
                              <div className="text-sm text-gray-500">{facility.venueType}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{facility.sportType}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{facility.location?.address || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{facility.capacity || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {facility.operatingHours?.openTime || 'N/A'} - {facility.operatingHours?.closeTime || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                            <span className="text-sm font-medium">{facility.rating?.average ? facility.rating.average.toFixed(1) : '0.0'}</span>
                            <span className="text-sm text-gray-500 ml-1">({facility.rating?.count || 0})</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusColor(facility.status)}>
                            {facility.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(facility)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleDelete(facility._id)}
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
                {Math.min(currentPage * pageSize, totalFacilities)}
              </span>{' '}
              of <span className="font-medium">{totalFacilities}</span> results
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
