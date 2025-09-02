'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, MapPin, Phone, Globe, Mail, Clock, Star, Trophy, Users, Dumbbell, Car, Calendar, CreditCard, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface SportsFacility {
  _id: string
  name: string
  description: string
  shortDescription: string
  category: string
  sport: string
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
    phone?: string[]
    email?: string
    website?: string
  }
  entryFee: {
    adult: number
    child: number
    senior: number
    member: number
  }
  operatingHours: {
    [key: string]: {
      open: string
      close: string
      closed: boolean
    }
  }
  facilities: string[]
  equipment: string[]
  coaching: {
    available: boolean
    sports: string[]
    fees: {
      individual: number
      group: number
    }
  }
  membership: {
    available: boolean
    monthly: number
    quarterly: number
    annual: number
  }
  images: Array<{
    url: string
    alt: string
    isPrimary: boolean
  }>
  amenities: string[]
  rules: string[]
  features: string[]
  rating: {
    average: number
    count: number
  }
  featured: boolean
  promoted: boolean
  status: string
  hasParking: boolean
  hasChangingRooms: boolean
  hasShower: boolean
  hasLockers: boolean
  hasEquipmentRental: boolean
}

export default function SportsFacilityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [facility, setFacility] = useState<SportsFacility | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFacility = async () => {
      try {
        const response = await fetch(`/api/sports/${params.id}`)
        if (!response.ok) {
          throw new Error('Sports facility not found')
        }
        const data = await response.json()
        setFacility(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load sports facility')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchFacility()
    }
  }, [params.id])

  const getCurrentDayHours = () => {
    if (!facility || !facility.operatingHours) return null
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const today = days[new Date().getDay()]
    return facility.operatingHours[today]
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    )
  }

  if (error || !facility) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Sports Facility Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.back()} className="bg-purple-600 hover:bg-purple-700">
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
  const primaryImage = facility.images?.find(img => img.isPrimary) || facility.images?.[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header with Back Button */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg shadow-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="mb-2 hover:bg-purple-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sports
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
                  src={primaryImage?.url || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'}
                  alt={primaryImage?.alt || facility.name}
                  fill
                  className="object-cover"
                />
                {facility.featured && (
                  <div className="absolute top-4 left-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Featured
                  </div>
                )}
                {facility.promoted && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Promoted
                  </div>
                )}
              </div>
            </Card>

            {/* Facility Info */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{facility.name}</h1>
                  <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className="ml-1 font-semibold">{facility.rating?.average || 0}</span>
                        <span className="text-gray-500 ml-1">({facility.rating?.count || 0} reviews)</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Trophy className="h-4 w-4 mr-1" />
                        <span>{facility.sport || 'Sports not specified'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-purple-600">
                      ₹{facility.entryFee?.adult || 0}
                    </div>
                    <div className="text-sm text-gray-600">per day</div>
                  </div>
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed">{facility.description}</p>

                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {facility.category ? (
                    <span
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                    >
                      {facility.category}
                    </span>
                  ) : (
                    <span className="text-gray-500">No categories available</span>
                  )}
                </div>

                {/* Key Features */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {facility.hasParking && (
                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                      <Car className="h-5 w-5 text-green-600 mr-2" />
                      <div className="text-sm font-semibold text-green-700">Parking</div>
                    </div>
                  )}

                  {facility.hasChangingRooms && (
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600 mr-2" />
                      <div className="text-sm font-semibold text-blue-700">Changing Rooms</div>
                    </div>
                  )}

                  {facility.hasEquipmentRental && (
                    <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                      <Dumbbell className="h-5 w-5 text-orange-600 mr-2" />
                      <div className="text-sm font-semibold text-orange-700">Equipment Rental</div>
                    </div>
                  )}

                  {facility.coaching?.available && (
                    <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                      <Zap className="h-5 w-5 text-purple-600 mr-2" />
                      <div className="text-sm font-semibold text-purple-700">Coaching</div>
                    </div>
                  )}
                </div>

                {/* Sports Available */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Sports Available</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {facility.sport ? (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Trophy className="h-4 w-4 mr-2 text-purple-600" />
                        <span className="text-sm font-medium">{facility.sport}</span>
                      </div>
                    ) : (
                      <div className="col-span-full text-center text-gray-500 py-4">
                        No sports information available
                      </div>
                    )}
                  </div>
                </div>

                {/* Facilities */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Facilities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {facility.facilities.map((facilityItem) => (
                      <div key={facilityItem} className="flex items-center">
                        <span className="text-purple-600 mr-2">•</span>
                        <span className="text-sm">{facilityItem}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Equipment */}
                {facility.equipment && facility.equipment.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Equipment Available</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {facility.equipment.map((equipmentItem) => (
                        <div key={equipmentItem} className="flex items-center">
                          <Dumbbell className="h-4 w-4 mr-2 text-orange-600" />
                          <span className="text-sm">{equipmentItem}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Operating Hours */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Operating Hours
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {facility.operatingHours ? Object.entries(facility.operatingHours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium capitalize">{day}</span>
                      <span className={`${hours.closed ? 'text-red-600' : 'text-green-600'}`}>
                        {hours.closed ? 'Closed' : `${formatTime(hours.open)} - ${formatTime(hours.close)}`}
                      </span>
                    </div>
                  )) : (
                    <div className="col-span-full text-center text-gray-500 py-4">
                      Operating hours not available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Entry Fees */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Entry Fees
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Adult</span>
                    <span className="font-semibold text-purple-600">₹{facility.entryFee?.adult || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Child</span>
                    <span className="font-semibold text-purple-600">₹{facility.entryFee?.child || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Senior</span>
                    <span className="font-semibold text-purple-600">₹{facility.entryFee?.senior || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Member</span>
                    <span className="font-semibold text-purple-600">₹{facility.entryFee?.member || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Membership */}
            {facility.membership?.available && (
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Membership Plans
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Monthly</span>
                      <span className="font-semibold text-purple-600">₹{facility.membership?.monthly || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Quarterly</span>
                      <span className="font-semibold text-purple-600">₹{facility.membership?.quarterly || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Annual</span>
                      <span className="font-semibold text-purple-600">₹{facility.membership?.annual || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Coaching */}
            {facility.coaching?.available && (
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Coaching Available
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Sports</p>
                      <div className="flex flex-wrap gap-1">
                        {facility.coaching?.sports?.map((sport) => (
                          <span key={sport} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                            {sport}
                          </span>
                        )) || <span className="text-sm text-gray-500">No sports specified</span>}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Individual</span>
                      <span className="font-semibold text-purple-600">₹{facility.coaching?.fees?.individual || 0}/session</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Group</span>
                      <span className="font-semibold text-purple-600">₹{facility.coaching?.fees?.group || 0}/session</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
                        {facility.address.street}, {facility.address.area}
                        <br />
                        {facility.address.city}, {facility.address.state} {facility.address.pincode}
                        {facility.address.landmark && (
                          <><br /><span className="text-sm text-gray-600">Near {facility.address.landmark}</span></>
                        )}
                      </p>
                    </div>
                  </div>

                  {facility.contact?.phone && facility.contact.phone.map((phone) => (
                    <div key={phone} className="flex items-center">
                      <Phone className="h-5 w-5 text-green-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <a href={`tel:${phone}`} className="font-medium hover:text-purple-600">
                          {phone}
                        </a>
                      </div>
                    </div>
                  ))}

                  {facility.contact?.email && (
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <a href={`mailto:${facility.contact.email}`} className="font-medium hover:text-purple-600">
                          {facility.contact.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {facility.contact?.website && (
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 text-purple-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Website</p>
                        <a 
                          href={facility.contact.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium hover:text-purple-600"
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
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {facility.contact?.phone && facility.contact.phone[0] && (
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => window.open(`tel:${facility.contact.phone![0]}`, '_self')}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call Now
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(`https://maps.google.com/?q=${facility.location?.coordinates?.[1] || 0},${facility.location?.coordinates?.[0] || 0}`, '_blank')}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>

                  {facility.contact?.website && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.open(facility.contact.website, '_blank')}
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
