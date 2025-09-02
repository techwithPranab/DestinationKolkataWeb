'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, MapPin, Phone, Globe, Mail, Clock, Star, Calendar, Users, Ticket, Info, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface EventDetail {
  _id: string
  name: string
  description: string
  shortDescription: string
  category: string
  location: string
  venue: {
    name: string
    address: {
      street: string
      area: string
      city: string
      state: string
      pincode: string
    }
    capacity: number
  }
  contact: {
    phone?: string[]
    email?: string
    website?: string
    organizer: string
  }
  datetime: {
    start: string
    end: string
    timezone: string
  }
  ticketPrice: {
    min: number
    max: number
    currency: string
  }
  images: Array<{
    url: string
    alt: string
    isPrimary: boolean
  }>
  tags: string[]
  amenities: string[]
  ageRestriction: {
    minimum: number
    maximum?: number
  }
  dresscode?: string
  languages: string[]
  duration: string
  rating: {
    average: number
    count: number
  }
  attendees: {
    registered: number
    capacity: number
  }
  featured: boolean
  promoted: boolean
  status: string
  isRecurring: boolean
  requiresBooking: boolean
  hasTicketsAvailable: boolean
  isFree: boolean
  isOnline: boolean
  isOutdoor: boolean
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${params.id}`)
        if (!response.ok) {
          throw new Error('Event not found')
        }
        const data = await response.json()
        setEvent(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load event')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchEvent()
    }
  }, [params.id])

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    return {
      date: date.toLocaleDateString('en-IN', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    }
  }

  const isEventUpcoming = (startDateTime: string) => {
    return new Date(startDateTime) > new Date()
  }

  const isEventOngoing = (startDateTime: string, endDateTime: string) => {
    const now = new Date()
    return new Date(startDateTime) <= now && new Date(endDateTime) >= now
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.back()} className="bg-indigo-600 hover:bg-indigo-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const startDateTime = event.datetime?.start ? formatDateTime(event.datetime.start) : { date: 'Date TBD', time: 'Time TBD' }
  const isUpcoming = event.datetime?.start ? isEventUpcoming(event.datetime.start) : false
  const isOngoing = event.datetime?.start && event.datetime?.end ? isEventOngoing(event.datetime.start, event.datetime.end) : false
  const primaryImage = event.images?.find(img => img.isPrimary) || event.images?.[0]

  const getEventStatus = () => {
    if (isOngoing) return { label: 'Ongoing', color: 'bg-green-100 text-green-800' }
    if (isUpcoming) return { label: 'Upcoming', color: 'bg-blue-100 text-blue-800' }
    return { label: 'Ended', color: 'bg-gray-100 text-gray-800' }
  }

  const getPriceDisplay = () => {
    if (event.isFree) return 'Free'
    if (event.ticketPrice?.max > event.ticketPrice?.min) {
      return `₹${event.ticketPrice?.min || 0} - ₹${event.ticketPrice?.max || 0}`
    }
    return `₹${event.ticketPrice?.min || 0}`
  }

  const eventStatus = getEventStatus()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Header with Back Button */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg shadow-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="mb-2 hover:bg-indigo-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
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
                  src={primaryImage?.url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'}
                  alt={primaryImage?.alt || event.name}
                  fill
                  className="object-cover"
                />
                {event.featured && (
                  <div className="absolute top-4 left-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Featured
                  </div>
                )}
                {event.promoted && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Promoted
                  </div>
                )}
                {event.isFree && (
                  <div className="absolute bottom-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Free Event
                  </div>
                )}
                {event.isOnline && (
                  <div className="absolute bottom-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Online Event
                  </div>
                )}
              </div>
            </Card>

            {/* Event Info */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.name}</h1>
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className="ml-1 font-semibold">{event.rating?.average || 0}</span>
                        <span className="text-gray-500 ml-1">({event.rating?.count || 0} reviews)</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{event.attendees?.registered || 0}/{event.attendees?.capacity || 0} registered</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${eventStatus.color}`}>
                      {eventStatus.label}
                    </span>
                    <div className="text-lg font-semibold text-indigo-600 mt-2">
                      {getPriceDisplay()}
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed">{event.description}</p>

                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span
                    className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                  >
                    {event.category || 'Uncategorized'}
                  </span>
                </div>

                {/* Key Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-indigo-600 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Start Date & Time</p>
                        <p className="font-semibold">{startDateTime.date}</p>
                        <p className="text-indigo-600">{startDateTime.time}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Clock className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-semibold">{event.duration || 'Duration TBD'}</p>
                      </div>
                    </div>

                    {event.ageRestriction?.minimum > 0 && (
                      <div className="flex items-start">
                        <Info className="h-5 w-5 text-orange-600 mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Age Restriction</p>
                          <p className="font-semibold">
                            {event.ageRestriction.minimum}+
                            {event.ageRestriction.maximum && ` to ${event.ageRestriction.maximum}`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Venue</p>
                        <p className="font-semibold">{event.venue?.name || 'Venue TBD'}</p>
                        <p className="text-sm text-gray-600">
                          {event.venue?.address?.area || 'Area TBD'}, {event.venue?.address?.city || 'City TBD'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Users className="h-5 w-5 text-purple-600 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Organizer</p>
                        <p className="font-semibold">{event.contact?.organizer || 'Organizer TBD'}</p>
                      </div>
                    </div>

                    {event.languages && event.languages.length > 0 && (
                      <div className="flex items-start">
                        <Globe className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Languages</p>
                          <p className="font-semibold">{event.languages.join(', ')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                {event.amenities && event.amenities.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Event Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {event.amenities.map((amenity) => (
                        <div key={amenity} className="flex items-center">
                          <span className="text-indigo-600 mr-2">•</span>
                          <span className="text-sm">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Tag className="h-5 w-5 mr-2" />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Info */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Ticket className="h-5 w-5 mr-2" />
                  Ticket Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Price Range</span>
                    <span className="font-semibold text-indigo-600">
                      {event.isFree ? 'Free' : `₹${event.ticketPrice?.min || 0} - ₹${event.ticketPrice?.max || 0}`}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Booking Required</span>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      event.requiresBooking ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {event.requiresBooking ? 'Yes' : 'No'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Tickets Available</span>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      event.hasTicketsAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {event.hasTicketsAvailable ? 'Available' : 'Sold Out'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Capacity</span>
                    <span className="font-medium">{event.venue?.capacity || 0} people</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Registered</span>
                    <span className="font-medium">{event.attendees?.registered || 0} people</span>
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
                      <p className="text-sm text-gray-600">Venue Address</p>
                      <p className="font-medium">
                        {event.venue?.address?.street || 'Street TBD'}, {event.venue?.address?.area || 'Area TBD'}
                        <br />
                        {event.venue?.address?.city || 'City TBD'}, {event.venue?.address?.state || 'State TBD'} {event.venue?.address?.pincode || 'Pincode TBD'}
                      </p>
                    </div>
                  </div>

                  {event.contact?.phone && event.contact.phone.map((phone) => (
                    <div key={phone} className="flex items-center">
                      <Phone className="h-5 w-5 text-green-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <a href={`tel:${phone}`} className="font-medium hover:text-indigo-600">
                          {phone}
                        </a>
                      </div>
                    </div>
                  ))}

                  {event.contact?.email && (
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <a href={`mailto:${event.contact.email}`} className="font-medium hover:text-indigo-600">
                          {event.contact.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {event.contact?.website && (
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 text-purple-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Website</p>
                        <a 
                          href={event.contact.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium hover:text-indigo-600"
                        >
                          Visit Website
                        </a>
                      </div>
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
                  {isUpcoming && event.hasTicketsAvailable && (
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                      <Ticket className="h-4 w-4 mr-2" />
                      Book Tickets
                    </Button>
                  )}

                  {event.contact?.phone && event.contact.phone[0] && (
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(`tel:${event.contact.phone![0]}`, '_self')}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call Organizer
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(`https://maps.google.com/?q=${event.venue?.address?.street || ''}, ${event.venue?.address?.area || ''}, ${event.venue?.address?.city || ''}`, '_blank')}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>

                  {event.contact?.website && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.open(event.contact.website, '_blank')}
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
