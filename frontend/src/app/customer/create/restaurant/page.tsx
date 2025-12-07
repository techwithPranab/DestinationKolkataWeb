"use client"
import { fetchAPI } from '@/lib/backend-api'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Save,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ImageUpload from '@/components/shared/ImageUpload'
import { getCloudinaryFolder, generateSlug } from '@/lib/cloudinary-utils'
import { useApi } from '@/lib/api-client'

interface RestaurantFormData {
  name: string
  description: string
  address: string
  city: string
  state: string
  pincode: string
  phone: string
  email: string
  website: string
  cuisineTypes: string[]
  priceRange: string
  amenities: string[]
  openingHours: {
    monday: { open: string; close: string; closed: boolean }
    tuesday: { open: string; close: string; closed: boolean }
    wednesday: { open: string; close: string; closed: boolean }
    thursday: { open: string; close: string; closed: boolean }
    friday: { open: string; close: string; closed: boolean }
    saturday: { open: string; close: string; closed: boolean }
    sunday: { open: string; close: string; closed: boolean }
  }
  specialFeatures: string
  images: { url: string; alt?: string; isPrimary?: boolean }[]
}

export default function CreateRestaurantPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const api = useApi()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isEdit, setIsEdit] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

  const [formData, setFormData] = useState<RestaurantFormData>({
    name: '',
    description: '',
    address: '',
    city: 'Kolkata',
    state: 'West Bengal',
    pincode: '',
    phone: '',
    email: '',
    website: '',
    cuisineTypes: [],
    priceRange: '',
    amenities: [],
    openingHours: {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '22:00', closed: false },
      saturday: { open: '09:00', close: '22:00', closed: false },
      sunday: { open: '09:00', close: '22:00', closed: false }
    },
    specialFeatures: '',
    images: []
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
          cuisineTypes: data.cuisineTypes as string[] || [],
          priceRange: data.priceRange as string || '',
          amenities: data.amenities as string[] || [],
          openingHours: data.openingHours as RestaurantFormData['openingHours'] || formData.openingHours,
          specialFeatures: data.specialFeatures as string || '',
          images: data.images as { url: string; alt?: string; isPrimary?: boolean }[] || []
        })
      }
    } catch (err) {
      console.error('Failed to load submission data:', err)
      setError('Failed to load submission data')
    } finally {
      setLoading(false)
    }
  }

  const cuisineTypesList = [
    'Bengali',
    'North Indian',
    'South Indian',
    'Chinese',
    'Continental',
    'Italian',
    'Mexican',
    'Thai',
    'Japanese',
    'Mediterranean',
    'Fast Food',
    'Street Food',
    'Vegetarian',
    'Vegan',
    'Seafood',
    'Bakery & Desserts'
  ]

  const amenitiesList = [
    'Air Conditioning',
    'Free WiFi',
    'Parking Available',
    'Home Delivery',
    'Takeaway',
    'Dine-in',
    'Outdoor Seating',
    'Live Music',
    'Family Friendly',
    'Pet Friendly',
    'Wheelchair Accessible',
    'Private Dining',
    'Bar Available',
    'Credit Cards Accepted',
    'UPI/Digital Payments'
  ]

  const priceRanges = [
    'Budget (₹100 - ₹300 per person)',
    'Mid-range (₹300 - ₹800 per person)',
    'Fine Dining (₹800 - ₹1500 per person)',
    'Luxury (₹1500+ per person)'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCuisineChange = (cuisine: string) => {
    setFormData(prev => ({
      ...prev,
      cuisineTypes: prev.cuisineTypes.includes(cuisine)
        ? prev.cuisineTypes.filter(c => c !== cuisine)
        : [...prev.cuisineTypes, cuisine]
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

  const handleTimeChange = (day: string, field: 'open' | 'close', value: string) => {
    setFormData(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day as keyof typeof prev.openingHours],
          [field]: value
        }
      }
    }))
  }

  const handleClosedToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day as keyof typeof prev.openingHours],
          closed: !prev.openingHours[day as keyof typeof prev.openingHours].closed
        }
      }
    }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Restaurant name is required')
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
    if (formData.cuisineTypes.length === 0) {
      setError('Please select at least one cuisine type')
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
      const submitData = new FormData()
      
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'images') {
          // Send images as JSON string since they're already uploaded to Cloudinary
          submitData.append(key, JSON.stringify(value))
        } else if (typeof value === 'object') {
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
        const response = await fetch(`${backendURL}/api/customer/submissions/${editId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: submitData
        })
        result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.message || 'Failed to update restaurant')
        }
      } else {
        // Create new submission
        const token = localStorage.getItem('authToken')
        const response = await fetchAPI('/api/customer/submissions/restaurant', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: submitData
        })
        result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.message || 'Failed to submit restaurant')
        }
      }

      // Redirect to listings with success message
      const message = isEdit 
        ? 'Restaurant updated successfully. If this was an approved listing, it is now pending admin re-review.' 
        : 'Restaurant submitted successfully and is pending approval'
      router.push(`/customer/listings?message=${encodeURIComponent(message)}`)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit restaurant')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Edit Restaurant' : 'Create New Restaurant'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEdit ? 'Update your restaurant information' : 'Add a new restaurant to the Destination Kolkata platform'}
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
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Amazing Bengali Restaurant"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe your restaurant, specialties, and what makes it unique..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceRange">Price Range *</Label>
                <Select value={formData.priceRange} onValueChange={(value) => handleSelectChange('priceRange', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Price Range" />
                  </SelectTrigger>
                  <SelectContent className='bg-white'>
                    {priceRanges.map(range => (
                      <SelectItem key={range} value={range}>{range}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
          <Card>
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
                      placeholder="info@restaurant.com"
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
                    placeholder="https://www.yourrestaurant.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cuisine Types */}
          <Card>
            <CardHeader>
              <CardTitle>Cuisine Types *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {cuisineTypesList.map(cuisine => (
                  <label key={cuisine} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.cuisineTypes.includes(cuisine)}
                      onChange={() => handleCuisineChange(cuisine)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm">{cuisine}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Opening Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Opening Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(formData.openingHours).map(([day, hours]) => (
                  <div key={day} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div className="font-medium capitalize">{day}</div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={hours.closed}
                        onChange={() => handleClosedToggle(day)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm">Closed</span>
                    </div>
                    
                    {!hours.closed && (
                      <>
                        <Input
                          type="time"
                          value={hours.open}
                          onChange={(e) => handleTimeChange(day, 'open', e.target.value)}
                        />
                        <Input
                          type="time"
                          value={hours.close}
                          onChange={(e) => handleTimeChange(day, 'close', e.target.value)}
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Amenities & Features</CardTitle>
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

          {/* Special Features */}
          <Card>
            <CardHeader>
              <CardTitle>Special Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="specialFeatures">Special Features & Highlights</Label>
                <Textarea
                  id="specialFeatures"
                  name="specialFeatures"
                  value={formData.specialFeatures}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Live music, chef's specials, historical significance, awards, etc."
                />
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Images</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                images={formData.images}
                onImagesChange={(images) => setFormData({ ...formData, images })}
                maxImages={10}
                folder={getCloudinaryFolder('restaurants')}
                subfolder={formData.name ? generateSlug(formData.name) : 'unnamed-restaurant'}
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
                {isEdit ? 'Updating...' : 'Submitting...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEdit ? 'Update Restaurant' : 'Submit Restaurant'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
