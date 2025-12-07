"use client"

import React, { useState } from 'react'
import { Building2, Plus, CheckCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRouter } from 'next/navigation'
import { fetchAPI } from '@/lib/backend-api'

type SubmissionType = 'hotel' | 'restaurant' | 'attraction' | 'event' | 'sports' | 'travel'

interface SubmissionFormData {
  type: SubmissionType
  title: string
  description: string
  name: string
  email: string
  phone: string
  // Common fields
  address: {
    street: string
    area: string
    city: string
    state: string
    pincode: string
  }
  location: {
    latitude: number
    longitude: number
  }
  // Type-specific fields will be added dynamically
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export default function SubmitBusinessPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<'landing' | 'form'>('landing')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<SubmissionFormData>({
    type: 'hotel',
    title: '',
    description: '',
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      area: '',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: ''
    },
    location: {
      latitude: 22.5726,
      longitude: 88.3639
    }
  })

  const handleInputChange = (field: string, value: unknown) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const submissionData = {
        type: formData.type,
        title: formData.title,
        description: formData.description,
        userId: null, // Will be set from auth if available
        submissionData: {
          ...formData,
          submittedAt: new Date().toISOString()
        }
      }

      const response = await fetchAPI('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Submission failed')
      }

      setSubmitSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderTypeSpecificFields = () => {
    switch (formData.type) {
      case 'hotel':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Hotel Category</Label>
                <Select value={formData.category || ''} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className='bg-white'>
                    <SelectItem value="luxury">Luxury</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="budget">Budget</SelectItem>
                    <SelectItem value="boutique">Boutique</SelectItem>
                    <SelectItem value="resort">Resort</SelectItem>
                    <SelectItem value="heritage">Heritage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priceRange">Price Range (per night)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min ₹"
                    value={formData.priceRange?.min || ''}
                    onChange={(e) => handleInputChange('priceRange.min', parseInt(e.target.value) || 0)}
                  />
                  <Input
                    type="number"
                    placeholder="Max ₹"
                    value={formData.priceRange?.max || ''}
                    onChange={(e) => handleInputChange('priceRange.max', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="amenities">Amenities (comma-separated)</Label>
              <Input
                placeholder="WiFi, Pool, Gym, Restaurant, etc."
                value={formData.amenities?.join(', ') || ''}
                onChange={(e) => handleInputChange('amenities', e.target.value.split(',').map(s => s.trim()))}
              />
            </div>
          </div>
        )

      case 'restaurant':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cuisine">Cuisine Type</Label>
                <Input
                  placeholder="Bengali, Chinese, Italian, etc."
                  value={formData.cuisine?.join(', ') || ''}
                  onChange={(e) => handleInputChange('cuisine', e.target.value.split(',').map(s => s.trim()))}
                />
              </div>
              <div>
                <Label htmlFor="priceRange">Price Range</Label>
                <Select value={formData.priceRange || ''} onValueChange={(value) => handleInputChange('priceRange', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select price range" />
                  </SelectTrigger>
                  <SelectContent className='bg-white'>
                    <SelectItem value="budget">Budget (₹)</SelectItem>
                    <SelectItem value="mid-range">Mid-range (₹₹)</SelectItem>
                    <SelectItem value="fine-dining">Fine Dining (₹₹₹)</SelectItem>
                    <SelectItem value="luxury">Luxury (₹₹₹₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="openingHours">Opening Hours</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Opens at (e.g., 10:00)"
                  value={formData.openingHours?.open || ''}
                  onChange={(e) => handleInputChange('openingHours.open', e.target.value)}
                />
                <Input
                  placeholder="Closes at (e.g., 22:00)"
                  value={formData.openingHours?.close || ''}
                  onChange={(e) => handleInputChange('openingHours.close', e.target.value)}
                />
              </div>
            </div>
          </div>
        )

      case 'attraction':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="category">Attraction Category</Label>
              <Select value={formData.category || ''} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className='bg-white'>
                  <SelectItem value="historical">Historical</SelectItem>
                  <SelectItem value="religious">Religious</SelectItem>
                  <SelectItem value="museums">Museums</SelectItem>
                  <SelectItem value="parks">Parks</SelectItem>
                  <SelectItem value="architecture">Architecture</SelectItem>
                  <SelectItem value="cultural">Cultural</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="entryFee">Entry Fee (₹)</Label>
                <Input
                  type="number"
                  placeholder="0 for free"
                  value={formData.entryFee?.adult || ''}
                  onChange={(e) => handleInputChange('entryFee.adult', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="duration">Typical Visit Duration</Label>
                <Input
                  placeholder="e.g., 2-3 hours"
                  value={formData.duration || ''}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                />
              </div>
            </div>
          </div>
        )

      case 'event':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="category">Event Category</Label>
              <Select value={formData.category || ''} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className='bg-white'>
                  <SelectItem value="concerts">Concerts</SelectItem>
                  <SelectItem value="festivals">Festivals</SelectItem>
                  <SelectItem value="theater">Theater</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="workshops">Workshops</SelectItem>
                  <SelectItem value="exhibitions">Exhibitions</SelectItem>
                  <SelectItem value="cultural">Cultural</SelectItem>
                  <SelectItem value="religious">Religious</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  type="date"
                  value={formData.startDate || ''}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  type="date"
                  value={formData.endDate || ''}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ticketPrice">Ticket Price (₹)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={formData.ticketPrice?.min || ''}
                    onChange={(e) => handleInputChange('ticketPrice.min', parseInt(e.target.value) || 0)}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={formData.ticketPrice?.max || ''}
                    onChange={(e) => handleInputChange('ticketPrice.max', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  type="number"
                  placeholder="Expected attendees"
                  value={formData.capacity || ''}
                  onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
        )

      case 'sports':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Sports Category</Label>
                <Select value={formData.category || ''} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className='bg-white'>
                    <SelectItem value="stadium">Stadium</SelectItem>
                    <SelectItem value="sports-grounds">Sports Grounds</SelectItem>
                    <SelectItem value="coaching-centers">Coaching Centers</SelectItem>
                    <SelectItem value="sports-clubs">Sports Clubs</SelectItem>
                    <SelectItem value="sports-facilities">Sports Facilities</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sport">Primary Sport</Label>
                <Input
                  placeholder="Cricket, Football, Tennis, etc."
                  value={formData.sport || ''}
                  onChange={(e) => handleInputChange('sport', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  type="number"
                  placeholder="Number of people"
                  value={formData.capacity || ''}
                  onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="entryFee">Entry Fee (₹)</Label>
                <Input
                  type="number"
                  placeholder="0 for free"
                  value={formData.entryFee?.adult || ''}
                  onChange={(e) => handleInputChange('entryFee.adult', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
        )

      case 'travel':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Travel Category</Label>
                <Select value={formData.category || ''} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className='bg-white'>
                    <SelectItem value="transport">Transport</SelectItem>
                    <SelectItem value="travel-tip">Travel Tip</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="transportType">Transport Type</Label>
                <Select value={formData.transportType || ''} onValueChange={(value) => handleInputChange('transportType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transport type" />
                  </SelectTrigger>
                  <SelectContent className='bg-white'>
                    <SelectItem value="air">Air</SelectItem>
                    <SelectItem value="train">Train</SelectItem>
                    <SelectItem value="bus">Bus</SelectItem>
                    <SelectItem value="taxi">Taxi</SelectItem>
                    <SelectItem value="metro">Metro</SelectItem>
                    <SelectItem value="tram">Tram</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="from">From</Label>
                <Input
                  placeholder="Starting point"
                  value={formData.from || ''}
                  onChange={(e) => handleInputChange('from', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="to">To</Label>
                <Input
                  placeholder="Destination"
                  value={formData.to || ''}
                  onChange={(e) => handleInputChange('to', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input
                  placeholder="e.g., 2 hours"
                  value={formData.duration || ''}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="priceRange">Price Range (₹)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={formData.priceRange?.min || ''}
                    onChange={(e) => handleInputChange('priceRange.min', parseInt(e.target.value) || 0)}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={formData.priceRange?.max || ''}
                    onChange={(e) => handleInputChange('priceRange.max', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Submission Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your submission has been received and is pending review. We&apos;ll notify you once it&apos;s approved.
            </p>
            <Button onClick={() => router.push('/')} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentStep === 'form') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setCurrentStep('landing')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Overview
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Submit Your Business</h1>
            <p className="text-gray-600 mt-2">Fill out the form below to get your business listed on Destination Kolkata.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Tell us about your business</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="type">Business Type</Label>
                  <Select value={formData.type} onValueChange={(value: SubmissionType) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent className='bg-white'>
                      <SelectItem value="hotel">Hotel</SelectItem>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="attraction">Attraction</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="sports">Sports Facility</SelectItem>
                      <SelectItem value="travel">Travel Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="title">Business Name</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter your business name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your business, services, and what makes it special..."
                    rows={4}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>How can customers reach you?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+91-9876543210"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle>Location & Address</CardTitle>
                <CardDescription>Where is your business located?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={formData.address.street}
                    onChange={(e) => handleInputChange('address.street', e.target.value)}
                    placeholder="Street name and number"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="area">Area/Locality</Label>
                    <Input
                      id="area"
                      value={formData.address.area}
                      onChange={(e) => handleInputChange('address.area', e.target.value)}
                      placeholder="Area or locality"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode">PIN Code</Label>
                    <Input
                      id="pincode"
                      value={formData.address.pincode}
                      onChange={(e) => handleInputChange('address.pincode', e.target.value)}
                      placeholder="700001"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="0.000001"
                      value={formData.location.latitude}
                      onChange={(e) => handleInputChange('location.latitude', parseFloat(e.target.value) || 22.5726)}
                      placeholder="22.5726"
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="0.000001"
                      value={formData.location.longitude}
                      onChange={(e) => handleInputChange('location.longitude', parseFloat(e.target.value) || 88.3639)}
                      placeholder="88.3639"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Type-specific fields */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>Specific details for your business type</CardDescription>
              </CardHeader>
              <CardContent>
                {renderTypeSpecificFields()}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isSubmitting ? 'Submitting...' : 'Submit for Review'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg shadow-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Building2 className="h-16 w-16 text-orange-500" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              List Your Business
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of businesses in Kolkata and reach more customers through our platform.
              Get discovered by travelers and locals looking for your services.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Benefits */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Why List Your Business?</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Increase Visibility</h3>
                  <p className="text-gray-600">Get discovered by thousands of potential customers searching for your services in Kolkata.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Build Trust</h3>
                  <p className="text-gray-600">Display customer reviews, ratings, and detailed information to build credibility.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Easy Management</h3>
                  <p className="text-gray-600">Update your business information, add photos, and respond to reviews from your dashboard.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Analytics & Insights</h3>
                  <p className="text-gray-600">Track views, clicks, and customer engagement to understand your audience better.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Business Types */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Perfect For</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Hotels & Accommodations</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Showcase your rooms, amenities, and packages to travelers.</CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Restaurants & Cafes</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Display your menu, photos, and customer reviews.</CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Tour & Travel Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Promote your tours, packages, and travel expertise.</CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Local Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Taxi services, guides, and other local businesses.</CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Attractions & Venues</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Museums, parks, and entertainment venues.</CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Sports & Recreation</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Gyms, sports clubs, and recreational facilities.</CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-orange-50 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our community of successful businesses in Kolkata. It&apos;s free to list your business and start attracting customers today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-white bg-orange-600 hover:bg-orange-700" onClick={() => setCurrentStep('form')}>
              <Plus className="h-5 w-5 mr-2" />
              List Your Business Now
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is it free to list my business?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Yes, basic listing is completely free. We also offer premium features for enhanced visibility.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How long does it take to get listed?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Most businesses are approved and live within 24-48 hours after submission and verification.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I update my business information?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Yes, you can update your business details, add photos, and manage your listing anytime.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you verify businesses?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Yes, we verify all businesses to ensure quality and authenticity for our users.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
