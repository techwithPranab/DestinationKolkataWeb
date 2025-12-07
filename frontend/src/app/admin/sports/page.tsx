"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
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
import ImageUpload from '@/components/shared/ImageUpload'
import { getCloudinaryFolder, generateSlug } from '@/lib/cloudinary-utils'
import { fetchAPI } from '@/lib/backend-api'

interface SportsFacility {
  _id: string
  name: string
  description: string
  shortDescription: string
  location: {
    type: 'Point'
    coordinates: [number, number]
  }
  address: {
    street: string
    area: string
    city: string
    state: string
    pincode: string
    landmark: string
  }
  contact: {
    phone: string[]
    email: string
    website: string
    socialMedia: object
  }
  category: string
  sport: string
  capacity: number
  facilities: string[]
  entryFee: {
    adult: number
    child: number
    senior: number
    currency: string
    isFree: boolean
  }
  timings: {
    monday: { open: string; close: string; closed: boolean }
    tuesday: { open: string; close: string; closed: boolean }
    wednesday: { open: string; close: string; closed: boolean }
    thursday: { open: string; close: string; closed: boolean }
    friday: { open: string; close: string; closed: boolean }
    saturday: { open: string; close: string; closed: boolean }
    sunday: { open: string; close: string; closed: boolean }
  }
  bestTimeToVisit: string
  duration: string
  amenities: string[]
  rating: {
    average: number
    count: number
  }
  tags: string[]
  status: string
  featured: boolean
  promoted: boolean
  images: { url: string; alt?: string; isPrimary?: boolean }[]
  osmId?: number
  source: string
  createdAt: string
  updatedAt: string
}

const sportTypes = [
  'Cricket', 'Football', 'Basketball', 'Tennis', 'Badminton', 'Swimming',
  'Table Tennis', 'Volleyball', 'Hockey', 'Golf', 'Bowling', 'Snooker',
  'Gym', 'Yoga', 'Martial Arts', 'Boxing', 'Cycling', 'Running Track'
]

const venueTypes = [
  'Stadium', 'Sports Grounds', 'Coaching Centers', 'Sports Clubs', 'Sports Facilities'
]

export default function SportsAdmin() {
  const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
  
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
    shortDescription: '',
    address: '',
    area: '',
    city: 'Kolkata',
    state: 'West Bengal',
    pincode: '',
    landmark: '',
    phone: '',
    email: '',
    website: '',
    sport: '',
    category: '',
    capacity: 0,
    adultFee: 0,
    childFee: 0,
    seniorFee: 0,
    mondayOpen: '09:00',
    mondayClose: '21:00',
    mondayClosed: false,
    tuesdayOpen: '09:00',
    tuesdayClose: '21:00',
    tuesdayClosed: false,
    wednesdayOpen: '09:00',
    wednesdayClose: '21:00',
    wednesdayClosed: false,
    thursdayOpen: '09:00',
    thursdayClose: '21:00',
    thursdayClosed: false,
    fridayOpen: '09:00',
    fridayClose: '21:00',
    fridayClosed: false,
    saturdayOpen: '09:00',
    saturdayClose: '21:00',
    saturdayClosed: false,
    sundayOpen: '09:00',
    sundayClose: '21:00',
    sundayClosed: false,
    bestTimeToVisit: 'Morning and evening',
    duration: '1-2 hours',
    facilities: [] as string[],
    amenities: [] as string[],
    tags: [] as string[],
    featured: false,
    promoted: false,
    images: [] as { url: string; alt?: string; isPrimary?: boolean }[]
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

      const response = await fetchAPI(`/api/sports?${params}`)
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
      shortDescription: formData.shortDescription,
      address: {
        street: formData.address,
        area: formData.area,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        landmark: formData.landmark
      },
      contact: {
        phone: [formData.phone],
        email: formData.email,
        website: formData.website
      },
      sport: formData.sport,
      category: formData.category,
      capacity: formData.capacity,
      entryFee: {
        adult: formData.adultFee,
        child: formData.childFee,
        senior: formData.seniorFee,
        currency: 'INR',
        isFree: false
      },
      timings: {
        monday: { open: formData.mondayOpen, close: formData.mondayClose, closed: formData.mondayClosed },
        tuesday: { open: formData.tuesdayOpen, close: formData.tuesdayClose, closed: formData.tuesdayClosed },
        wednesday: { open: formData.wednesdayOpen, close: formData.wednesdayClose, closed: formData.wednesdayClosed },
        thursday: { open: formData.thursdayOpen, close: formData.thursdayClose, closed: formData.thursdayClosed },
        friday: { open: formData.fridayOpen, close: formData.fridayClose, closed: formData.fridayClosed },
        saturday: { open: formData.saturdayOpen, close: formData.saturdayClose, closed: formData.saturdayClosed },
        sunday: { open: formData.sundayOpen, close: formData.sundayClose, closed: formData.sundayClosed }
      },
      bestTimeToVisit: formData.bestTimeToVisit,
      duration: formData.duration,
      facilities: formData.facilities,
      amenities: formData.amenities,
      tags: formData.tags,
      featured: formData.featured,
      promoted: formData.promoted,
      images: formData.images,
      status: 'active'
    }

    try {
      const url = editingFacility 
        ? `${backendURL}/api/sports/${editingFacility._id}`
        : `${backendURL}/api/sports`
      
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
        const response = await fetchAPI(`/api/sports/${id}`, {
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
      shortDescription: facility.shortDescription || '',
      address: facility.address?.street || '',
      area: facility.address?.area || '',
      city: facility.address?.city || 'Kolkata',
      state: facility.address?.state || 'West Bengal',
      pincode: facility.address?.pincode || '',
      landmark: facility.address?.landmark || '',
      phone: facility.contact?.phone?.[0] || '',
      email: facility.contact?.email || '',
      website: facility.contact?.website || '',
      sport: facility.sport || '',
      category: facility.category || '',
      capacity: facility.capacity || 0,
      adultFee: facility.entryFee?.adult || 0,
      childFee: facility.entryFee?.child || 0,
      seniorFee: facility.entryFee?.senior || 0,
      mondayOpen: facility.timings?.monday?.open || '09:00',
      mondayClose: facility.timings?.monday?.close || '21:00',
      mondayClosed: facility.timings?.monday?.closed || false,
      tuesdayOpen: facility.timings?.tuesday?.open || '09:00',
      tuesdayClose: facility.timings?.tuesday?.close || '21:00',
      tuesdayClosed: facility.timings?.tuesday?.closed || false,
      wednesdayOpen: facility.timings?.wednesday?.open || '09:00',
      wednesdayClose: facility.timings?.wednesday?.close || '21:00',
      wednesdayClosed: facility.timings?.wednesday?.closed || false,
      thursdayOpen: facility.timings?.thursday?.open || '09:00',
      thursdayClose: facility.timings?.thursday?.close || '21:00',
      thursdayClosed: facility.timings?.thursday?.closed || false,
      fridayOpen: facility.timings?.friday?.open || '09:00',
      fridayClose: facility.timings?.friday?.close || '21:00',
      fridayClosed: facility.timings?.friday?.closed || false,
      saturdayOpen: facility.timings?.saturday?.open || '09:00',
      saturdayClose: facility.timings?.saturday?.close || '21:00',
      saturdayClosed: facility.timings?.saturday?.closed || false,
      sundayOpen: facility.timings?.sunday?.open || '09:00',
      sundayClose: facility.timings?.sunday?.close || '21:00',
      sundayClosed: facility.timings?.sunday?.closed || false,
      bestTimeToVisit: facility.bestTimeToVisit || 'Morning and evening',
      duration: facility.duration || '1-2 hours',
      facilities: facility.facilities || [],
      amenities: facility.amenities || [],
      tags: facility.tags || [],
      featured: facility.featured || false,
      promoted: facility.promoted || false,
      images: facility.images || []
    })
    setIsAddModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      shortDescription: '',
      address: '',
      area: '',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '',
      landmark: '',
      phone: '',
      email: '',
      website: '',
      sport: '',
      category: '',
      capacity: 0,
      adultFee: 0,
      childFee: 0,
      seniorFee: 0,
      mondayOpen: '09:00',
      mondayClose: '21:00',
      mondayClosed: false,
      tuesdayOpen: '09:00',
      tuesdayClose: '21:00',
      tuesdayClosed: false,
      wednesdayOpen: '09:00',
      wednesdayClose: '21:00',
      wednesdayClosed: false,
      thursdayOpen: '09:00',
      thursdayClose: '21:00',
      thursdayClosed: false,
      fridayOpen: '09:00',
      fridayClose: '21:00',
      fridayClosed: false,
      saturdayOpen: '09:00',
      saturdayClose: '21:00',
      saturdayClosed: false,
      sundayOpen: '09:00',
      sundayClose: '21:00',
      sundayClosed: false,
      bestTimeToVisit: 'Morning and evening',
      duration: '1-2 hours',
      facilities: [],
      amenities: [],
      tags: [],
      featured: false,
      promoted: false,
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
            <Button 
            className='bg-orange-500 hover:bg-orange-600 text-white'
            onClick={() => {
              resetForm()
              setEditingFacility(null)
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Facility
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
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
                  <Select value={formData.sport} onValueChange={(value: string) => setFormData({ ...formData, sport: value })}>
                    <SelectTrigger className="bg-white text-black">
                      <SelectValue placeholder="Select sport type" />
                    </SelectTrigger>
                    <SelectContent className='bg-white text-black'>
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
                  <Select value={formData.category} onValueChange={(value: string) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className="bg-white text-black">
                      <SelectValue placeholder="Select venue type" />
                    </SelectTrigger>
                    <SelectContent className='bg-white text-black'>
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
                <Label htmlFor="shortDescription">Short Description</Label>
                <Input
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Brief description for listings"
                  className="bg-white text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="area">Area</Label>
                  <Input
                    id="area"
                    value={formData.area}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, area: e.target.value })}
                    className="bg-white text-black"
                  />
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

              <div>
                <Label>Operating Hours</Label>
                <div className="space-y-3 mt-2">
                  {[
                    { key: 'monday', label: 'Monday' },
                    { key: 'tuesday', label: 'Tuesday' },
                    { key: 'wednesday', label: 'Wednesday' },
                    { key: 'thursday', label: 'Thursday' },
                    { key: 'friday', label: 'Friday' },
                    { key: 'saturday', label: 'Saturday' },
                    { key: 'sunday', label: 'Sunday' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center space-x-4">
                      <div className="w-20">
                        <Label className="text-sm">{label}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`${key}Closed`}
                          checked={formData[`${key}Closed` as keyof typeof formData] as boolean}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [`${key}Closed`]: e.target.checked })}
                          className="rounded"
                        />
                        <Label htmlFor={`${key}Closed`} className="text-sm">Closed</Label>
                      </div>
                      <Input
                        type="time"
                        value={formData[`${key}Open` as keyof typeof formData] as string}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [`${key}Open`]: e.target.value })}
                        disabled={formData[`${key}Closed` as keyof typeof formData] as boolean}
                        className="bg-white text-black w-32"
                      />
                      <span className="text-sm text-gray-500">to</span>
                      <Input
                        type="time"
                        value={formData[`${key}Close` as keyof typeof formData] as string}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [`${key}Close`]: e.target.value })}
                        disabled={formData[`${key}Closed` as keyof typeof formData] as boolean}
                        className="bg-white text-black w-32"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bestTimeToVisit">Best Time to Visit</Label>
                  <Input
                    id="bestTimeToVisit"
                    value={formData.bestTimeToVisit}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, bestTimeToVisit: e.target.value })}
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, duration: e.target.value })}
                    className="bg-white text-black"
                  />
                </div>
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
                  <Label htmlFor="featured">Featured</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="promoted"
                    checked={formData.promoted}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, promoted: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="promoted">Promoted</Label>
                </div>
              </div>

              <div>
                <Label>Sports Facility Images</Label>
                <ImageUpload
                  images={formData.images}
                  onImagesChange={(images) => setFormData({ ...formData, images })}
                  maxImages={10}
                  folder={getCloudinaryFolder('sports')}
                  subfolder={formData.name ? generateSlug(formData.name) : 'unnamed-sports-facility'}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsAddModalOpen(false)
                    setEditingFacility(null)
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
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
              <SelectContent className='bg-white text-black'>
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
              <SelectContent className='bg-white text-black'>
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
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
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
                        <td colSpan={7} className="px-6 py-12 text-center">
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
                                  src={typeof facility.images[0] === 'string' ? facility.images[0] : facility.images[0].url}
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
                              <div className="text-sm text-gray-500">{facility.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{facility.sport}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{facility.capacity || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {facility.timings?.monday?.open || 'N/A'} - {facility.timings?.monday?.close || 'N/A'}
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
                            {/* <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button> */}
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
