"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Hotel, 
  MapPin, 
  Save
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ImageUpload from '@/components/shared/ImageUpload'
import { getCloudinaryFolder, generateSlug } from '@/lib/cloudinary-utils'
import { useApi } from '@/lib/api-client'

interface HotelFormData {
  name: string
  description: string
  address: string
  city: string
  state: string
  pincode: string
  phone: string
  email: string
  website: string
  starRating: number
  priceRange: string
  amenities: string[]
  roomTypes: string[]
  images: { url: string; alt?: string; isPrimary?: boolean }[]
  checkInTime: string
  checkOutTime: string
  policies: string
  nearbyAttractions: string
}

export default function CreateHotelPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const api = useApi()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isEdit, setIsEdit] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [formData, setFormData] = useState<HotelFormData>({
    name: '',
    description: '',
    address: '',
    city: 'Kolkata',
    state: 'West Bengal',
    pincode: '',
    phone: '',
    email: '',
    website: '',
    starRating: 3,
    priceRange: '',
    amenities: [],
    roomTypes: [],
    images: [],
    checkInTime: '14:00',
    checkOutTime: '12:00',
    policies: '',
    nearbyAttractions: ''
  })

  // Check for edit mode
  useEffect(() => {
    const editParam = searchParams.get('edit')
    if (editParam) {
      setIsEdit(true)
      setEditId(editParam)
      loadSubmissionForEdit(editParam)
    }
  }, [searchParams])

  const loadSubmissionForEdit = async (id: string) => {
    try {
      setLoading(true)
      const result = await api.get(`/api/customer/submissions/${id}`)
      
      if (result.error) {
        setError('Failed to load submission for editing')
        return
      }

      const submission = (result.data as { submission: { data: Record<string, unknown> } })?.submission
      if (submission?.data) {
        const data = submission.data
        // Pre-populate form with existing data
        setFormData({
          name: data.name as string || '',
          description: data.description as string || '',
          address: data.address as string || '',
          city: data.city as string || 'Kolkata',
          state: data.state as string || 'West Bengal',
          pincode: data.pincode as string || '',
          phone: data.phone as string || '',
          email: data.email as string || '',
          website: data.website as string || '',
          starRating: data.starRating as number || 3,
          priceRange: data.priceRange as string || '',
          amenities: data.amenities as string[] || [],
          roomTypes: data.roomTypes as string[] || [],
          images: data.images as { url: string; alt?: string; isPrimary?: boolean }[] || [],
          checkInTime: data.checkInTime as string || '14:00',
          checkOutTime: data.checkOutTime as string || '12:00',
          policies: data.policies as string || '',
          nearbyAttractions: data.nearbyAttractions as string || ''
        })
      }
    } catch (err) {
      console.error('Failed to load submission data:', err)
      setError('Failed to load submission data')
    } finally {
      setLoading(false)
    }
  }

  const amenitiesList = [
    'Free WiFi',
    'Parking',
    'Restaurant',
    'Room Service',
    'Gym/Fitness Center',
    'Swimming Pool',
    'Spa',
    'Business Center',
    'Conference Rooms',
    'Laundry Service',
    'Airport Shuttle',
    'Pet Friendly',
    '24/7 Front Desk',
    'Air Conditioning',
    'Elevator'
  ]

  const roomTypesList = [
    'Standard Room',
    'Deluxe Room',
    'Suite',
    'Executive Room',
    'Family Room',
    'Single Room',
    'Double Room',
    'Twin Room',
    'Presidential Suite',
    'Penthouse'
  ]

  const priceRanges = [
    'Budget (₹1,000 - ₹2,500)',
    'Mid-range (₹2,500 - ₹5,000)',
    'Luxury (₹5,000 - ₹10,000)',
    'Ultra-luxury (₹10,000+)'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAmenityChange = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const handleRoomTypeChange = (roomType: string) => {
    setFormData(prev => ({
      ...prev,
      roomTypes: prev.roomTypes.includes(roomType)
        ? prev.roomTypes.filter(r => r !== roomType)
        : [...prev.roomTypes, roomType]
    }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Hotel name is required')
      return false
    }
    if (!formData.description.trim()) {
      setError('Description is required')
      return false
    }
    if (!formData.address.trim()) {
      setError('Address is required')
      return false
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required')
      return false
    }
    if (!formData.priceRange) {
      setError('Price range is required')
      return false
    }
    if (formData.amenities.length === 0) {
      setError('Please select at least one amenity')
      return false
    }
    if (formData.roomTypes.length === 0) {
      setError('Please select at least one room type')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) return

    setLoading(true)

    try {
      // Create form data for submission
      const submitData = new FormData()
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'images') {
          // Send images as JSON string since they're already uploaded to Cloudinary
          submitData.append(key, JSON.stringify(value))
        } else if (Array.isArray(value)) {
          submitData.append(key, JSON.stringify(value))
        } else {
          submitData.append(key, value.toString())
        }
      })

      let result
      if (isEdit && editId) {
        // Update existing submission using native fetch for FormData
        const token = localStorage.getItem('authToken')
        const response = await fetch(`/api/customer/submissions/${editId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: submitData
        })
        result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.message || 'Failed to update hotel')
        }
      } else {
        // Create new submission
        const token = localStorage.getItem('authToken')
        const response = await fetch('/api/customer/submissions/hotel', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: submitData
        })
        result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.message || 'Failed to submit hotel')
        }
      }

      if (result.error) {
        throw new Error(result.error)
      }

      // Redirect to dashboard with success message
      const message = isEdit 
        ? 'Hotel updated successfully. If this was an approved listing, it is now pending admin re-review.' 
        : 'Hotel submitted successfully and is pending approval'
      router.push(`/customer/listings?message=${encodeURIComponent(message)}`)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit hotel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Edit Hotel' : 'Create New Hotel'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEdit ? 'Update your hotel information' : 'Add a new hotel to the Destination Kolkata platform'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Hotel className="w-5 h-5 mr-2" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Hotel Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter hotel name"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your hotel"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="starRating">Star Rating</Label>
                <select
                  id="starRating"
                  name="starRating"
                  value={formData.starRating}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {[1, 2, 3, 4, 5].map(rating => (
                    <option key={rating} value={rating}>
                      {rating} Star{rating > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="priceRange">Price Range *</Label>
                <select
                  id="priceRange"
                  name="priceRange"
                  value={formData.priceRange}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">Select Price Range</option>
                  {priceRanges.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Location Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter full address"
                rows={2}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  placeholder="700001"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 9876543210"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="info@hotel.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://www.yourhotel.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Amenities *</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {amenitiesList.map(amenity => (
                <div key={amenity} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={amenity}
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                    className="rounded"
                  />
                  <Label htmlFor={amenity} className="text-sm">{amenity}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Room Types */}
        <Card>
          <CardHeader>
            <CardTitle>Room Types *</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {roomTypesList.map(roomType => (
                <div key={roomType} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={roomType}
                    checked={formData.roomTypes.includes(roomType)}
                    onChange={() => handleRoomTypeChange(roomType)}
                    className="rounded"
                  />
                  <Label htmlFor={roomType} className="text-sm">{roomType}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Check-in & Check-out */}
        <Card>
          <CardHeader>
            <CardTitle>Check-in & Check-out Times</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="checkInTime">Check-in Time</Label>
                <Input
                  id="checkInTime"
                  name="checkInTime"
                  type="time"
                  value={formData.checkInTime}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="checkOutTime">Check-out Time</Label>
                <Input
                  id="checkOutTime"
                  name="checkOutTime"
                  type="time"
                  value={formData.checkOutTime}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="policies">Hotel Policies</Label>
              <Textarea
                id="policies"
                name="policies"
                value={formData.policies}
                onChange={handleInputChange}
                rows={3}
                placeholder="Pet policy, smoking policy, cancellation policy, etc."
              />
            </div>

            <div>
              <Label htmlFor="nearbyAttractions">Nearby Attractions</Label>
              <Textarea
                id="nearbyAttractions"
                name="nearbyAttractions"
                value={formData.nearbyAttractions}
                onChange={handleInputChange}
                rows={3}
                placeholder="Victoria Memorial - 2km, Howrah Bridge - 5km, etc."
              />
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Hotel Images</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload
              images={formData.images}
              onImagesChange={(images) => setFormData({ ...formData, images })}
              maxImages={10}
              folder={getCloudinaryFolder('hotels')}
              subfolder={formData.name ? generateSlug(formData.name) : 'unnamed-hotel'}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-orange-600 hover:bg-orange-700 text-white"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEdit ? 'Updating Hotel...' : 'Creating Hotel...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEdit ? 'Update Hotel' : 'Create Hotel'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
