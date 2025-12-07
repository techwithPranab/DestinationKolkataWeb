"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Filter, Grid, Map, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import ListingCard from '@/components/shared/ListingCard'
import FilterSidebar from '@/components/shared/FilterSidebar'
import { fetchAPI } from '@/lib/backend-api'

interface Hotel {
  name: string
  description: string
  shortDescription?: string
  images: Array<{
    url: string
    alt?: string
    isPrimary?: boolean
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
  rating: {
    average: number
    count: number
  }
  amenities: string[]
  tags: string[]
  status: string
  featured: boolean
  promoted: boolean
  priceRange: {
    min: number
    max: number
    currency: string
  }
  roomTypes: Array<{
    name: string
    price: number
    capacity: number
    amenities: string[]
    images: string[]
    available: boolean
  }>
  checkInTime: string
  checkOutTime: string
  category: string
  distance?: number // Distance from search location (in meters)
  reviewCount?: number
  averagePrice?: number
  createdAt?: Date
}

interface FilterOptions {
  priceRange: [number, number]
  rating: number
  amenities: string[]
  distance: number
  category: string[]
  availability: string
}

export default function PlacesPage() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 20000],
    rating: 0,
    amenities: [],
    distance: 50,
    category: [],
    availability: 'any'
  })

  const renderGridContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {['card1', 'card2', 'card3', 'card4', 'card5', 'card6'].map((cardId) => (
            <Card key={cardId} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (filteredHotels.length > 0) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {filteredHotels.map((hotel, index) => {
            const hotelSlug = hotel.name?.toLowerCase().replace(/\s+/g, '-') || `hotel-${index}`;
            return (
              <motion.div
                key={`${hotel.name}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ListingCard
                  id={hotelSlug}
                  title={hotel.name || 'Unnamed Hotel'}
                  description={hotel.description || 'No description available'}
                  image={hotel.images?.[0]?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80'}
                  rating={hotel.rating?.average || 0}
                  reviewCount={hotel.rating?.count || 0}
                  price={hotel.priceRange?.min || 0}
                  priceUnit="night"
                  location={`${hotel.address?.area || ''}, ${hotel.address?.city || 'Kolkata'}`}
                  category="hotel"
                  amenities={hotel.amenities || []}
                  distance={hotel.distance ? `${Math.round(hotel.distance / 1000)} km from center` : 'Distance not available'}
                  isPromoted={hotel.promoted || false}
                  href={`/places/hotels/${hotelSlug}`}
                  checkInTime={hotel.checkInTime}
                  checkOutTime={hotel.checkOutTime}
                  roomTypes={hotel.roomTypes}
                  hotelCategory={hotel.category}
                />
              </motion.div>
            );
          })}
        </motion.div>
      );
    }

    return (
      <Card className="p-12 text-center">
        <CardContent>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hotels found
          </h3>
          <p className="text-gray-600">
            Try adjusting your filters or search criteria
          </p>
          <Button
            onClick={() => {
              setFilters({
                priceRange: [0, 20000],
                rating: 0,
                amenities: [],
                distance: 50,
                category: [],
                availability: 'any'
              })
              setSearchQuery('')
              fetchHotels()
            }}
            className="mt-4"
          >
            Clear all filters
          </Button>
        </CardContent>
      </Card>
    );
  };

  // Fetch hotels from API
  const fetchHotels = async (page = 1, search = '', currentFilters = filters) => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...(search && { search }),
        ...(currentFilters.rating > 0 && { rating: currentFilters.rating.toString() }),
        ...(currentFilters.priceRange[0] > 0 && { minPrice: currentFilters.priceRange[0].toString() }),
        ...(currentFilters.priceRange[1] < 20000 && { maxPrice: currentFilters.priceRange[1].toString() }),
        ...(currentFilters.amenities.length > 0 && { amenities: currentFilters.amenities.join(',') })
      })

      const response = await fetchAPI(`/api/hotels?${params}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch hotels')
      }

      setHotels(result.hotels || [])
      setFilteredHotels(result.hotels || [])
      setPagination(result.pagination || {
        page: 1,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      })
      setCurrentPage(page)

    } catch (err) {
      console.error('Error fetching hotels:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch hotels')
      setHotels([])
      setFilteredHotels([])
    } finally {
      setIsLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchHotels()
  }, [])

  // Apply client-side filters for search
  useEffect(() => {
    if (!searchQuery) {
      setFilteredHotels(hotels)
      return
    }

    const filtered = hotels.filter(hotel =>
      hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.address?.area?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.address?.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    setFilteredHotels(filtered)
  }, [searchQuery, hotels])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
    fetchHotels(1, searchQuery, filters)
  }, [filters])

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
    setCurrentPage(1)
    // Refetch with new filters
    fetchHotels(1, searchQuery, newFilters)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    // If query is empty, refetch all data
    if (!query) {
      fetchHotels(1, '', filters)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg shadow-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Places to Stay</h1>
              <p className="text-gray-600 mt-1">
                Discover comfortable accommodations in Kolkata
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search hotels..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
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
                  variant={viewMode === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className={viewMode === 'map' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                >
                  <Map className="h-4 w-4" />
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

          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">
                {!error && pagination.total > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, pagination.total)} of {pagination.total} properties
                </div>
              )}
            </span>
            <select className="text-sm border border-gray-300 rounded-md px-3 py-1">
              <option>Sort by: Recommended</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Rating: High to Low</option>
              <option>Distance</option>
            </select>
          </div>

          {/* Pagination Info */}
          {/* {!error && pagination.total > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, pagination.total)} of {pagination.total} properties
            </div>
          )} */}
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
              category="hotels"
            />
          </div>

          {/* Mobile Filter Sidebar */}
          <FilterSidebar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            category="hotels"
          />

          {/* Results */}
          <div className="flex-1">
            {(() => {
              if (error) {
                return (
                  <Card className="p-12 text-center">
                    <CardContent>
                      <h3 className="text-lg font-medium text-red-900 mb-2">
                        Error Loading Hotels
                      </h3>
                      <p className="text-red-600 mb-4">
                        {error}
                      </p>
                      <Button
                        onClick={() => fetchHotels()}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Try Again
                      </Button>
                    </CardContent>
                  </Card>
                );
              }

              if (viewMode === 'map') {
                return (
                  <Card className="h-96">
                    <CardContent className="flex items-center justify-center h-full text-gray-500">
                      Interactive map with hotel locations will be displayed here
                      <br />
                      (Leaflet integration coming soon)
                    </CardContent>
                  </Card>
                );
              }

              return renderGridContent();
            })()}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {pagination.totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchHotels(currentPage - 1, searchQuery, filters)}
                    disabled={!pagination.hasPrev}
                  >
                    Previous
                  </Button>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, currentPage - 2)) + i
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => fetchHotels(pageNum, searchQuery, filters)}
                        className={currentPage === pageNum ? 'text-white bg-orange-600 hover:bg-orange-700' : ''}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchHotels(currentPage + 1, searchQuery, filters)}
                    disabled={!pagination.hasNext}
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
