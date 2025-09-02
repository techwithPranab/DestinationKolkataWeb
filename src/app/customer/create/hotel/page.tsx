"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Hotel, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Save,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

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
  images: File[]
  checkInTime: string
  checkOutTime: string
  policies: string
  nearbyAttractions: string
}

export default function CreateHotelPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        images: Array.from(e.target.files || [])
      }))
    }
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
      // Create form data for file upload
      const submitData = new FormData()
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'images') {
          formData.images.forEach(file => {
            submitData.append('images', file)
          })
        } else if (Array.isArray(value)) {
          submitData.append(key, JSON.stringify(value))
        } else {
          submitData.append(key, value.toString())
        }
      })

      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/customer/submissions/hotel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit hotel')
      }

      // Redirect to dashboard with success message
      router.push('/customer/dashboard?message=Hotel submitted successfully and is pending approval')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit hotel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center space-x-3">
            <Hotel className="w-8 h-8 text-orange-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Hotel</h1>
              <p className="text-gray-600">Submit your hotel for review and approval</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Hotel Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Grand Hotel Kolkata"
                    required
                  />
                </div>
                
                <div className="space-y-2">
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe your hotel, its unique features, and what makes it special..."
                  required
                />
              </div>

              <div className="space-y-2">
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
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Complete address with landmark"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Kolkata"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="West Bengal"
                  />
                </div>
                
                <div className="space-y-2">
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
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="+91 9876543210"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="info@hotel.com"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder="https://www.yourhotel.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Amenities *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {amenitiesList.map(amenity => (
                  <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityChange(amenity)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm">{amenity}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Room Types */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Room Types *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {roomTypesList.map(roomType => (
                  <label key={roomType} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.roomTypes.includes(roomType)}
                      onChange={() => handleRoomTypeChange(roomType)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm">{roomType}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Check-in/Check-out */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Check-in & Check-out Times</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="checkInTime">Check-in Time</Label>
                  <Input
                    id="checkInTime"
                    name="checkInTime"
                    type="time"
                    value={formData.checkInTime}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
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
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
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

              <div className="space-y-2">
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
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Hotel Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="images">Upload Images (Max 10 images)</Label>
                <Input
                  id="images"
                  name="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                />
                <p className="text-sm text-gray-500">
                  Upload high-quality images of your hotel (exterior, rooms, amenities, etc.)
                </p>
              </div>
              
              {formData.images.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Selected files: {formData.images.length}
                  </p>
                  <div className="text-xs text-gray-500">
                    {formData.images.map((file) => (
                      <div key={file.name}>{file.name}</div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Submit Hotel
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
