'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, MapPin, Phone, Globe, Mail, Clock, Star, Camera, Accessibility, Car, Users, Ticket, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import ReviewSection from '@/components/shared/ReviewSection'

interface Attraction {
  _id: string
  name: string
  description: string
  shortDescription: string
  category: string
  location: string
  address: {
    street: string
    area: string
    city: string
    state: string
    pincode: string
    landmark?: string
  }
  contact: {
    phone?: string[]
    email?: string
    website?: string
  }
  entryFee: {
    adult: number
    child: number
    senior: number
    foreigner: number
  }
  openingHours: {
    [key: string]: {
      open: string
      close: string
      closed: boolean
    }
  }
  duration: string
  bestTimeToVisit: string
  images: Array<{
    url: string
    alt: string
    isPrimary: boolean
  }>
  amenities: string[]
  activities: string[]
  restrictions: string[]
  tips: string[]
  nearbyAttractions: string[]
  averageRating: number
  reviewCount: number
  featured: boolean
  promoted: boolean
  status: string
  isWheelchairAccessible: boolean
  hasGuidedTour: boolean
  hasAudioGuide: boolean
  hasParking: boolean
  photographyAllowed: boolean
}

export default function AttractionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [attraction, setAttraction] = useState<Attraction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

  useEffect(() => {
    const fetchAttraction = async () => {
      try {
        const response = await fetch(`${backendURL}/api/attractions/${params.id}`)
        if (!response.ok) {
          throw new Error('Attraction not found')
        }
        const data = await response.json()
        setAttraction(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load attraction')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchAttraction()
    }
  }, [params.id])

  const getCurrentDayHours = () => {
    if (!attraction?.openingHours) return null
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
    const today = days[new Date().getDay()]
    return attraction.openingHours[today] || null
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
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  if (error || !attraction) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Attraction Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.back()} className="bg-green-600 hover:bg-green-700">
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
  const primaryImage = attraction.images?.find(img => img.isPrimary) || attraction.images?.[0]

  return (
    <div className="min-h-screen ">
      {/* Header with Back Button */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg shadow-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="mb-2 hover:bg-green-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Attractions
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
                  src={primaryImage?.url || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'}
                  alt={primaryImage?.alt || attraction.name}
                  fill
                  className="object-cover"
                />
                {attraction.featured && (
                  <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Featured
                  </div>
                )}
                {attraction.promoted && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Promoted
                  </div>
                )}
                {!attraction.photographyAllowed && (
                  <div className="absolute bottom-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                    <Camera className="h-4 w-4 mr-1" />
                    No Photography
                  </div>
                )}
              </div>
            </Card>

            {/* Attraction Info */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{attraction.name}</h1>
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className="ml-1 font-semibold">{attraction.averageRating || 0}</span>
                        <span className="text-gray-500 ml-1">({attraction.reviewCount || 0} reviews)</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{attraction.category || 'No category'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-600">
                      ₹{attraction.entryFee?.adult || 0}
                    </div>
                    <div className="text-sm text-gray-600">adult entry</div>
                  </div>
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed">{attraction.description}</p>

                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {attraction.category ? (
                    <span
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {attraction.category}
                    </span>
                  ) : (
                    <span className="text-gray-500">No categories available</span>
                  )}
                </div>

                {/* Key Features */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <div className="text-sm text-gray-600">Duration</div>
                      <div className="font-semibold">{attraction.duration || 'Not specified'}</div>
                    </div>
                  </div>
                  
                  {attraction.isWheelchairAccessible && (
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <Accessibility className="h-5 w-5 text-blue-600 mr-2" />
                      <div className="text-sm font-semibold text-blue-700">Wheelchair Accessible</div>
                    </div>
                  )}

                  {attraction.hasParking && (
                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                      <Car className="h-5 w-5 text-green-600 mr-2" />
                      <div className="text-sm font-semibold text-green-700">Parking Available</div>
                    </div>
                  )}

                  {attraction.hasGuidedTour && (
                    <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                      <Users className="h-5 w-5 text-purple-600 mr-2" />
                      <div className="text-sm font-semibold text-purple-700">Guided Tours</div>
                    </div>
                  )}
                </div>

                {/* Activities */}
                {attraction.activities && attraction.activities.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Activities</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {attraction.activities.map((activity) => (
                        <div key={activity} className="flex items-center">
                          <span className="text-green-600 mr-2">•</span>
                          <span className="text-sm">{activity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips */}
                {attraction.tips && attraction.tips.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Info className="h-5 w-5 mr-2" />
                      Visitor Tips
                    </h3>
                    <div className="space-y-2">
                      {attraction.tips.map((tip) => (
                        <div key={tip} className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                          <p className="text-sm text-yellow-800">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                  {attraction.openingHours ? Object.entries(attraction.openingHours).map(([day, hours]) => (
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

            {/* Reviews Section */}
            <div className="mt-8">
              <ReviewSection
                entityId={attraction._id}
                entityType="attraction"
                averageRating={attraction.averageRating || 0}
                totalReviews={attraction.reviewCount || 0}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Entry Fees */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Ticket className="h-5 w-5 mr-2" />
                  Entry Fees
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Adult</span>
                    <span className="font-semibold text-green-600">₹{attraction.entryFee?.adult || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Child</span>
                    <span className="font-semibold text-green-600">₹{attraction.entryFee?.child || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Senior</span>
                    <span className="font-semibold text-green-600">₹{attraction.entryFee?.senior || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Foreigner</span>
                    <span className="font-semibold text-green-600">₹{attraction.entryFee?.foreigner || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                        {attraction.address?.street || 'Street not available'}, {attraction.address?.area || 'Area not available'}
                        <br />
                        {attraction.address?.city || 'City not available'}, {attraction.address?.state || 'State not available'} {attraction.address?.pincode || 'Pincode not available'}
                        {attraction.address?.landmark && (
                          <><br /><span className="text-sm text-gray-600">Near {attraction.address.landmark}</span></>
                        )}
                      </p>
                    </div>
                  </div>

                  {attraction.contact?.phone && attraction.contact.phone.map((phone) => (
                    <div key={phone} className="flex items-center">
                      <Phone className="h-5 w-5 text-green-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <a href={`tel:${phone}`} className="font-medium hover:text-green-600">
                          {phone}
                        </a>
                      </div>
                    </div>
                  ))}

                  {attraction.contact?.email && (
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <a href={`mailto:${attraction.contact.email}`} className="font-medium hover:text-green-600">
                          {attraction.contact.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {attraction.contact?.website && (
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 text-purple-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Website</p>
                        <a 
                          href={attraction.contact.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium hover:text-green-600"
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
                    <span>Best Time</span>
                    <span className="font-medium text-green-600">
                      {attraction.bestTimeToVisit || 'Not specified'}
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
                  {attraction.contact?.phone && attraction.contact.phone[0] && (
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => window.open(`tel:${attraction.contact.phone![0]}`, '_self')}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call Now
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full text-white bg-orange-600 hover:bg-orange-700"
                    onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(attraction.location || '')}`, '_blank')}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>

                  {attraction.contact?.website && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.open(attraction.contact.website, '_blank')}
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
