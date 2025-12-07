"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Filter, Calendar, Clock, MapPin, Ticket, Search, Grid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import ListingCard from '@/components/shared/ListingCard'
import FilterSidebar from '@/components/shared/FilterSidebar'

interface Event {
  _id?: string
  name: string
  description: string
  shortDescription?: string
  images?: Array<{
    url: string
    alt: string
    isPrimary: boolean
  }>
  location: {
    type: 'Point'
    coordinates: [number, number]
  }
  address: {
    street?: string
    area?: string
    city: string
    state: string
    pincode?: string
    landmark?: string
  }
  contact: {
    phone: string[]
    email?: string
    website?: string
    socialMedia?: {
      facebook?: string
      instagram?: string
      twitter?: string
    }
  }
  category: 'Concerts' | 'Festivals' | 'Theater' | 'Sports' | 'Workshops' | 'Exhibitions' | 'Cultural' | 'Religious' | 'Food'
  startDate: Date
  endDate: Date
  startTime?: string
  endTime?: string
  ticketPrice: {
    min: number
    max: number
    currency: string
    isFree: boolean
  }
  organizer: {
    name: string
    contact?: string
    email?: string
    website?: string
  }
  venue?: {
    name?: string
    capacity?: number
    type?: string
  }
  ticketing?: {
    bookingUrl?: string
    bookingPhone?: string
    advanceBookingRequired: boolean
    refundPolicy?: string
  }
  isRecurring?: boolean
  recurrencePattern?: string
  ageRestriction?: string
  dresscode?: string
  amenities: string[]
  rating?: {
    average: number
    count: number
  }
  tags?: string[]
  status?: string
  featured?: boolean
  promoted?: boolean
  createdAt?: Date
  updatedAt?: Date
}

interface FilterOptions {
  priceRange: [number, number]
  rating: number
  amenities: string[]
  distance: number
  category: string[]
  availability: string
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEventType, setSelectedEventType] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 1000],
    rating: 0,
    amenities: [],
    distance: 50,
    category: [],
    availability: 'any'
  })

  const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

  // Helper function to get primary image URL
  const getPrimaryImageUrl = (event: Event): string => {
    if (!event.images || !Array.isArray(event.images) || event.images.length === 0) {
      return "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
    }

    const primaryImage = event.images.find(img => img.isPrimary)
    return primaryImage?.url || event.images[0]?.url || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
  }

  // Fetch events from API
  const fetchEvents = async (params: Record<string, string> = {}, page = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...params
      })

      const response = await fetch(`${backendURL}/api/events?${queryParams}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }
      
      const data = await response.json()
      setEvents(data.data || [])
      setFilteredEvents(data.data || [])
      setTotalItems(data.data.total || 0)
      setTotalPages(Math.ceil((data.data.total || 0) / itemsPerPage))
      setCurrentPage(page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events')
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchEvents({}, 1)
  }, [])

  // Get unique event types for filter
  const eventTypes = ['all', ...new Set(events.map(e => e.category))]

  // Apply filters
  useEffect(() => {
    const params: Record<string, string> = {}

    // Price filter - use ticketPrice.min
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) {
      params.priceRange = `${filters.priceRange[0]}-${filters.priceRange[1]}`
    }

    // Rating filter
    if (filters.rating > 0) {
      params.rating = filters.rating.toString()
    }

    // Event type filter
    if (selectedEventType !== 'all') {
      params.category = selectedEventType
    }

    // Search query
    if (searchQuery) {
      params.search = searchQuery
    }

    // Amenities filter (convert to API parameters)
    if (filters.amenities.includes('Guided Tours')) {
      params.hasGuidedTour = 'true'
    }
    if (filters.amenities.includes('Wheelchair Access')) {
      params.isWheelchairAccessible = 'true'
    }
    if (filters.amenities.includes('Parking')) {
      params.hasParking = 'true'
    }

    fetchEvents(params, 1)
    setCurrentPage(1)
  }, [filters, searchQuery, selectedEventType])

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    const params: Record<string, string> = {}

    // Price filter - use ticketPrice.min
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) {
      params.priceRange = `${filters.priceRange[0]}-${filters.priceRange[1]}`
    }

    // Rating filter
    if (filters.rating > 0) {
      params.rating = filters.rating.toString()
    }

    // Event type filter
    if (selectedEventType !== 'all') {
      params.category = selectedEventType
    }

    // Search query
    if (searchQuery) {
      params.search = searchQuery
    }

    // Amenities filter (convert to API parameters)
    if (filters.amenities.includes('Guided Tours')) {
      params.hasGuidedTour = 'true'
    }
    if (filters.amenities.includes('Wheelchair Access')) {
      params.isWheelchairAccessible = 'true'
    }
    if (filters.amenities.includes('Parking')) {
      params.hasParking = 'true'
    }

    fetchEvents(params, page)
  }

  const formatDate = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2024-01-01T${timeString}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  // Render content based on state
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <span className="ml-3 text-gray-600">Loading events...</span>
        </div>
      )
    }

    if (error) {
      return (
        <Card className="p-12 text-center">
          <CardContent>
            <h3 className="text-lg font-medium text-red-600 mb-2">
              Error loading events
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button
              onClick={() => fetchEvents({}, 1)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )
    }

    if (filteredEvents.length === 0) {
      return (
        <Card className="p-12 text-center">
          <CardContent>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No events found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or search criteria
            </p>
            <Button
              onClick={() => {
                setFilters({
                  priceRange: [0, 1000],
                  rating: 0,
                  amenities: [],
                  distance: 50,
                  category: [],
                  availability: 'any'
                })
                setSearchQuery('')
                setSelectedEventType('all')
                setCurrentPage(1)
                fetchEvents({}, 1)
              }}
              className="mt-4"
            >
              Clear all filters
            </Button>
          </CardContent>
        </Card>
      )
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          : "space-y-6"
        }
      >
        {filteredEvents.map((event, index) => (
          <motion.div
            key={event._id || event.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {viewMode === 'grid' ? (
              <div>
                <ListingCard
                  id={event._id || event.name}
                  title={event.name}
                  description={event.description}
                  image={getPrimaryImageUrl(event)}
                  rating={event.rating?.average || 0}
                  reviewCount={event.rating?.count || 0}
                  price={event.ticketPrice.min}
                  priceUnit="ticket"
                  location={`${event.address.area || ''}, ${event.address.city}`}
                  category="event"
                  amenities={event.amenities || []}
                  distance="2 km from city center"
                  isPromoted={event.promoted || false}
                  href={`/events/${event.name.toLowerCase().replace(/\s+/g, '-')}`}
                  startDate={event.startDate}
                  startTime={event.startTime}
                  endDate={event.endDate}
                  endTime={event.endTime}
                  eventCategory={event.category}
                  venueCapacity={event.venue?.capacity}
                  isFree={event.ticketPrice.isFree}
                />
              </div>
            ) : (
              <Card className="flex flex-col md:flex-row overflow-hidden">
                <div className="md:w-72 h-48 md:h-auto bg-gray-200">
                  <img
                    src={getPrimaryImageUrl(event)}
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{event.name}</h3>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {event.category}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDate(event.startDate)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{event.startTime ? formatTime(event.startTime) : 'TBD'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{event.venue?.name || 'TBD'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Ticket className="h-4 w-4 mr-2" />
                      <span>
                        {event.ticketPrice.isFree ? 'Free' : `₹${event.ticketPrice.min}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-600">
                      {event.venue?.capacity?.toLocaleString() || 'N/A'} capacity
                    </div>
                    <Button className="bg-orange-600 hover:bg-orange-700">
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
        ))}
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg shadow-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Events & Festivals</h1>
              <p className="text-gray-600 mt-1">
                Discover exciting events, festivals, and cultural activities in Kolkata
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/90 backdrop-blur-sm shadow-lg rounded-lg focus:ring-2 focus:ring-orange-500 focus:shadow-orange-200 transition-all duration-200 w-64"
                />
              </div>

              {/* View Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="lg:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Event Type Filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            {eventTypes.map((type) => (
              <Button
                key={type}
                variant={selectedEventType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedEventType(type)}
                className={selectedEventType === type ? 'bg-orange-600 hover:bg-orange-700' : ''}
              >
                {type === 'all' ? 'All Events' : type}
              </Button>
            ))}
          </div>

          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {totalItems} events found
            </span>
            <select className="text-sm border border-gray-300 rounded-md px-3 py-1">
              <option>Sort by: Date</option>
              <option>Rating: High to Low</option>
              <option>Price: Low to High</option>
              <option>Most Popular</option>
              <option>Distance</option>
            </select>
          </div>

          {/* Pagination Info */}
          {!error && totalItems > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} events
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <FilterSidebar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              isOpen={true}
              onClose={() => {}}
              category="events"
            />
          </div>

          {/* Mobile Filter Sidebar */}
          <FilterSidebar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            category="events"
          />

          {/* Results */}
          <div className="flex-1">
            {renderContent()}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className={currentPage === pageNum ? 'bg-orange-600 hover:bg-orange-700' : ''}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
