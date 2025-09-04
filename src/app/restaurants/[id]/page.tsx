'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, MapPin, Phone, Globe, Mail, Clock, Star, Users, Utensils, Wifi, Car, CreditCard, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Restaurant {
  _id: string
  name: string
  description: string
  shortDescription: string
  images: Array<{
    url: string
    alt: string
    isPrimary: boolean
  }>
  location: {
    type: string
    coordinates: [number, number]
  }
  address: {
    street: string
    area: string
    city: string
    state: string
    pincode: string
  }
  contact: {
    phone: string[]
    email?: string
    website?: string
  }
  rating: {
    average: number
    count: number
  }
  amenities: string[]
  tags: string[]
  cuisine: string[]
  priceRange: string
  openingHours: {
    [key: string]: {
      open: string
      close: string
      closed: boolean
    }
  }
  avgMealCost: number
  reservationRequired: boolean
  featured: boolean
  promoted: boolean
}

export default function RestaurantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await fetch(`/api/restaurants/${params.id}`)
        if (!response.ok) {
          throw new Error('Restaurant not found')
        }
        const data = await response.json()
        setRestaurant(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load restaurant')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchRestaurant()
    }
  }, [params.id])

  const getCurrentDayHours = () => {
    if (!restaurant?.openingHours) return null
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
    const today = days[new Date().getDay()]
    return restaurant.openingHours[today] || null
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  if (loading) {
    return (
      <div className="min-h-screen ">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </div>
    )
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen ">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Restaurant Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.back()} className="bg-orange-600 hover:bg-orange-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const todayHours = getCurrentDayHours()
  const isOpen = todayHours && !todayHours.closed
  const primaryImage = restaurant.images.find(img => img.isPrimary) || restaurant.images[0]

  return (
    <div className="min-h-screen">
      {/* Header with Back Button */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg shadow-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="mb-2 hover:bg-orange-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Restaurants
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-96">
                <Image
                  src={primaryImage?.url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'}
                  alt={primaryImage?.alt || restaurant.name}
                  fill
                  className="object-cover"
                />
                {restaurant.featured && (
                  <div className="absolute top-4 left-4 bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Featured
                  </div>
                )}
                {restaurant.promoted && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Promoted
                  </div>
                )}
              </div>
            </Card>

            {/* Restaurant Info */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className="ml-1 font-semibold">{restaurant.rating?.average || 0}</span>
                        <span className="text-gray-500 ml-1">({restaurant.rating?.count || 0} reviews)</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Utensils className="h-4 w-4 mr-1" />
                        <span>{restaurant.cuisine?.join(', ') || 'Cuisine not specified'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-orange-600">₹{restaurant.avgMealCost || 0}</div>
                    <div className="text-sm text-gray-600">per person</div>
                  </div>
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed">{restaurant.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {restaurant.tags && restaurant.tags.length > 0 ? restaurant.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  )) : (
                    <span className="text-gray-500">No tags available</span>
                  )}
                </div>

                {/* Amenities */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {restaurant.amenities && restaurant.amenities.length > 0 ? restaurant.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center">
                        {amenity === 'WiFi' && <Wifi className="h-4 w-4 mr-2 text-green-600" />}
                        {amenity === 'Parking' && <Car className="h-4 w-4 mr-2 text-blue-600" />}
                        {amenity === 'AC' && <span className="text-cyan-600 mr-2">❄️</span>}
                        {amenity === 'Outdoor Seating' && <span className="text-green-600 mr-2">🌿</span>}
                        {amenity === 'Takeaway' && <span className="text-orange-600 mr-2">📦</span>}
                        {amenity === 'Home Delivery' && <span className="text-red-600 mr-2">🏠</span>}
                        {amenity === 'Bar' && <span className="text-purple-600 mr-2">🍷</span>}
                        {amenity === 'Live Music' && <span className="text-pink-600 mr-2">🎵</span>}
                        <span className="text-sm">{amenity}</span>
                      </div>
                    )) : (
                      <div className="col-span-full text-center text-gray-500 py-4">
                        No amenities information available
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Opening Hours */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Opening Hours
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {restaurant.openingHours ? Object.entries(restaurant.openingHours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium capitalize">{day}</span>
                      <span className={`${hours.closed ? 'text-red-600' : 'text-green-600'}`}>
                        {hours.closed ? 'Closed' : `${formatTime(hours.open)} - ${formatTime(hours.close)}`}
                      </span>
                    </div>
                  )) : (
                    <div className="col-span-full text-center text-gray-500 py-4">
                      Opening hours not available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium">
                        {restaurant.address.street}, {restaurant.address.area}
                        <br />
                        {restaurant.address.city}, {restaurant.address.state} {restaurant.address.pincode}
                      </p>
                    </div>
                  </div>

                  {restaurant.contact?.phone && restaurant.contact.phone.length > 0 ? restaurant.contact.phone.map((phone) => (
                    <div key={phone} className="flex items-center">
                      <Phone className="h-5 w-5 text-green-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <a href={`tel:${phone}`} className="font-medium hover:text-orange-600">
                          {phone}
                        </a>
                      </div>
                    </div>
                  )) : (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <span className="text-gray-500">Not available</span>
                      </div>
                    </div>
                  )}

                  {restaurant.contact.email && (
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <a href={`mailto:${restaurant.contact.email}`} className="font-medium hover:text-orange-600">
                          {restaurant.contact.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {restaurant.contact.website && (
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 text-purple-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Website</p>
                        <a 
                          href={restaurant.contact.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium hover:text-orange-600"
                        >
                          Visit Website
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Current Status */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Current Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  
                  {todayHours && !todayHours.closed && (
                    <div className="flex items-center justify-between">
                      <span>Today&apos;s Hours</span>
                      <span className="font-medium">
                        {formatTime(todayHours.open)} - {formatTime(todayHours.close)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span>Price Range</span>
                    <span className="font-medium text-orange-600">{restaurant.priceRange || 'Not specified'}</span>
                  </div>

                  {restaurant.reservationRequired && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-orange-600 mr-2" />
                      <span className="text-sm text-orange-600 font-medium">Reservation Required</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button 
                    className="w-full text-white bg-green-600 hover:bg-green-700"
                    onClick={() => window.open(`tel:${restaurant.contact?.phone?.[0] || ''}`, '_self')}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full text-white bg-orange-600 hover:bg-orange-700"
                    onClick={() => window.open(`https://maps.google.com/?q=${restaurant.location?.coordinates?.[1] || 0},${restaurant.location?.coordinates?.[0] || 0}`, '_blank')}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>

                  {restaurant.contact.website && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.open(restaurant.contact.website, '_blank')}
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Visit Website
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
