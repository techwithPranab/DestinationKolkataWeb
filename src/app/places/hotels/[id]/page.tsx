'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, MapPin, Phone, Globe, Mail, Clock, Star, Users, Bed, Wifi, Car, Dumbbell, Waves, Utensils } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import ReviewSection from '@/components/shared/ReviewSection'

interface Hotel {
  _id: string
  name: string
  description: string
  shortDescription: string
  category: string
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
    landmark?: string
  }
  contact: {
    phone: string[]
    email?: string
    website?: string
    socialMedia?: {
      facebook?: string
      instagram?: string
    }
  }
  priceRange: {
    min: number
    max: number
    currency: string
  }
  checkInTime: string
  checkOutTime: string
  amenities: string[]
  roomTypes: Array<{
    _id: string
    name: string
    price: number
    capacity: number
    amenities: string[]
    images: string[]
    available: boolean
  }>
  images: Array<{
    url: string
    alt: string
    isPrimary: boolean
  }>
  tags: string[]
  status: string
  featured: boolean
  promoted: boolean
  rating: {
    average: number
    count: number
  }
  views: number
}

export default function HotelDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const response = await fetch(`/api/hotels/${params.id}`)
        if (!response.ok) {
          throw new Error('Hotel not found')
        }
        const result = await response.json()
        if (result.success) {
          setHotel(result.data)
        } else {
          throw new Error(result.error || 'Failed to load hotel')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load hotel')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchHotel()
    }
  }, [params.id])

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
        return <Wifi className="h-4 w-4 text-blue-600" />
      case 'pool':
        return <Waves className="h-4 w-4 text-blue-600" />
      case 'gym':
        return <Dumbbell className="h-4 w-4 text-red-600" />
      case 'restaurant':
        return <Utensils className="h-4 w-4 text-orange-600" />
      case 'bar':
        return <span className="text-purple-600">🍷</span>
      case 'spa':
        return <span className="text-pink-600">🧖‍♀️</span>
      case 'room service':
        return <span className="text-green-600">🛎️</span>
      case 'concierge':
        return <Users className="h-4 w-4 text-gray-600" />
      case 'business center':
        return <span className="text-blue-600">💼</span>
      case 'parking':
        return <Car className="h-4 w-4 text-gray-600" />
      default:
        return <span className="text-gray-600">•</span>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Hotel Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.back()} className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const primaryImage = hotel.images.find(img => img.isPrimary) || hotel.images[0]

  return (
    <div className="min-h-screen">
      {/* Header with Back Button */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg shadow-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="mb-2 hover:bg-blue-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Hotels
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
                  src={primaryImage?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'}
                  alt={primaryImage?.alt || hotel.name}
                  fill
                  className="object-cover"
                />
                {hotel.featured && (
                  <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Featured
                  </div>
                )}
                {hotel.promoted && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Promoted
                  </div>
                )}
              </div>
            </Card>

            {/* Hotel Info */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className="ml-1 font-semibold">{hotel.rating.average}</span>
                        <span className="text-gray-500 ml-1">({hotel.rating.count} reviews)</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Bed className="h-4 w-4 mr-1" />
                        <span>{hotel.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-blue-600">
                      ₹{hotel.priceRange.min.toLocaleString()} - ₹{hotel.priceRange.max.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">per night</div>
                  </div>
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed">{hotel.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {hotel.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Room Types */}
                  <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Room Types</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {hotel.roomTypes.map((roomType) => (
                      <div key={roomType._id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Bed className="h-4 w-4 mr-2 text-blue-600" />
                        <div className="flex-1">
                          <span className="text-sm font-medium">{roomType.name}</span>
                          <div className="text-xs text-gray-600 mt-1">
                            <span>₹{roomType.price.toLocaleString()}</span>
                            <span className="mx-2">•</span>
                            <span>Capacity: {roomType.capacity}</span>
                            {roomType.available && (
                              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                Available
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>                {/* Amenities */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {hotel.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center">
                        {getAmenityIcon(amenity)}
                        <span className="text-sm ml-2">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Check-in/Check-out */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Check-in & Check-out
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Check-in</div>
                    <div className="text-lg font-semibold text-green-700">
                      {formatTime(hotel.checkInTime)}
                    </div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Check-out</div>
                    <div className="text-lg font-semibold text-red-700">
                      {formatTime(hotel.checkOutTime)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <div className="mt-8">
              <ReviewSection
                entityId={hotel._id}
                entityType="hotel"
                averageRating={hotel.rating.average}
                totalReviews={hotel.rating.count}
              />
            </div>
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
                        {hotel.address.street}, {hotel.address.area}
                        <br />
                        {hotel.address.city}, {hotel.address.state} {hotel.address.pincode}
                        {hotel.address.landmark && (
                          <><br /><span className="text-sm text-gray-600">Near {hotel.address.landmark}</span></>
                        )}
                      </p>
                    </div>
                  </div>

                  {hotel.contact.phone.map((phone) => (
                    <div key={phone} className="flex items-center">
                      <Phone className="h-5 w-5 text-green-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <a href={`tel:${phone}`} className="font-medium hover:text-blue-600">
                          {phone}
                        </a>
                      </div>
                    </div>
                  ))}

                  {hotel.contact.email && (
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <a href={`mailto:${hotel.contact.email}`} className="font-medium hover:text-blue-600">
                          {hotel.contact.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {hotel.contact.website && (
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 text-purple-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Website</p>
                        <a
                          href={hotel.contact.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium hover:text-blue-600"
                        >
                          Visit Website
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Hotel Stats */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Hotel Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Category</span>
                    <span className="font-medium text-blue-600">{hotel.category}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Views</span>
                    <span className="font-medium">{hotel.views.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {hotel.status === 'active' ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
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
                    onClick={() => window.open(`tel:${hotel.contact.phone[0]}`, '_self')}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call for Booking
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full text-white bg-orange-600 hover:bg-orange-700"
                    onClick={() => window.open(`https://maps.google.com/?q=${hotel.location.coordinates[1]},${hotel.location.coordinates[0]}`, '_blank')}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>

                  {hotel.contact.website && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(hotel.contact.website, '_blank')}
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Visit Website
                    </Button>
                  )}

                  {hotel.contact.email && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(`mailto:${hotel.contact.email}`, '_self')}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
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
