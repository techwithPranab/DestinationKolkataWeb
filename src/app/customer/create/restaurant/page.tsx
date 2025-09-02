"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  UtensilsCrossed, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Save,
  ArrowLeft,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

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
  images: File[]
}

export default function CreateRestaurantPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
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
          formData.images.forEach(file => {
            submitData.append('images', file)
          })
        } else if (typeof value === 'object') {
          submitData.append(key, JSON.stringify(value))
        } else if (Array.isArray(value)) {
          submitData.append(key, JSON.stringify(value))
        } else {
          submitData.append(key, value.toString())
        }
      })

      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/customer/submissions/restaurant', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit restaurant')
      }

      router.push('/customer/dashboard?message=Restaurant submitted successfully and is pending approval')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit restaurant')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <UtensilsCrossed className="w-8 h-8 text-orange-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Restaurant</h1>
              <p className="text-gray-600">Submit your restaurant for review and approval</p>
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
          <Card className="mb-6">
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
          <Card className="mb-6">
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
          <Card className="mb-6">
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
          <Card className="mb-6">
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
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Restaurant Images</CardTitle>
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
                  Upload high-quality images of your restaurant (interior, exterior, food, etc.)
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
                  Submit Restaurant
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
