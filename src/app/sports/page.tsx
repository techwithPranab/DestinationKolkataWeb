"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Filter, Grid, Map, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import ListingCard from '@/components/shared/ListingCard'
import FilterSidebar from '@/components/shared/FilterSidebar'

interface SportsFacility {
  _id?: string
  name: string
  description: string
  shortDescription?: string
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
  category: 'Stadium' | 'Sports Grounds' | 'Coaching Centers' | 'Sports Clubs' | 'Sports Facilities'
  sport: string
  capacity: number
  facilities: string[]
  entryFee: {
    adult: number
    child: number
    senior: number
    currency: string
    isFree: boolean
  }
  timings: {
    monday: { open: string; close: string; closed: boolean }
    tuesday: { open: string; close: string; closed: boolean }
    wednesday: { open: string; close: string; closed: boolean }
    thursday: { open: string; close: string; closed: boolean }
    friday: { open: string; close: string; closed: boolean }
    saturday: { open: string; close: string; closed: boolean }
    sunday: { open: string; close: string; closed: boolean }
  }
  bestTimeToVisit?: string
  duration?: string
  amenities: string[]
  rating: {
    average: number
    count: number
  }
  tags?: string[]
  status?: string
  featured?: boolean
  promoted?: boolean
  osmId?: number
  source?: string
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


export default function SportsPage() {
  const [facilities, setFacilities] = useState<SportsFacility[]>([])
  const [filteredFacilities, setFilteredFacilities] = useState<SportsFacility[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSportType, setSelectedSportType] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 3000],
    rating: 0,
    amenities: [],
    distance: 50,
    category: [],
    availability: 'any'
  })

  // Fetch sports facilities from API
  const fetchSports = async (params: Record<string, string> = {}, page = 1) => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...params
      })

      const response = await fetch(`/api/sports?${queryParams}`)

      if (!response.ok) {
        throw new Error('Failed to fetch sports facilities')
      }

      const data = await response.json()
      console.log('Fetched sports facilities:', data)
      setFacilities(data.facilities || [])
      setFilteredFacilities(data.facilities || [])
      setTotalItems(data.total || 0)
      setTotalPages(Math.ceil((data.total || 0) / itemsPerPage))
      setCurrentPage(page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sports facilities')
      console.error('Error fetching sports facilities:', err)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchSports({}, 1)
  }, [])

  // Get unique sport types for filter
  const sportTypes = ['all', ...new Set(facilities.map(f => f.sport))]

  // Apply filters
  useEffect(() => {
    const params: Record<string, string> = {}

    // Price filter - use entryFee.adult
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 3000) {
      params.priceRange = `${filters.priceRange[0]}-${filters.priceRange[1]}`
    }

    // Rating filter
    if (filters.rating > 0) {
      params.rating = filters.rating.toString()
    }

    // Sport type filter
    if (selectedSportType !== 'all') {
      params.sport = selectedSportType
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

    fetchSports(params, 1)
    setCurrentPage(1)
  }, [filters, searchQuery, selectedSportType])

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    const params: Record<string, string> = {}

    // Price filter - use entryFee.adult
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 3000) {
      params.priceRange = `${filters.priceRange[0]}-${filters.priceRange[1]}`
    }

    // Rating filter
    if (filters.rating > 0) {
      params.rating = filters.rating.toString()
    }

    // Sport type filter
    if (selectedSportType !== 'all') {
      params.sport = selectedSportType
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

    fetchSports(params, page)
  }

  // Render content based on state
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <span className="ml-3 text-gray-600">Loading sports facilities...</span>
        </div>
      )
    }

    if (error) {
      return (
        <Card className="p-12 text-center">
          <CardContent>
            <h3 className="text-lg font-medium text-red-600 mb-2">
              Error loading sports facilities
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button
              onClick={() => fetchSports({}, 1)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )
    }

    if (filteredFacilities.length === 0) {
      return (
        <Card className="p-12 text-center">
          <CardContent>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No sports facilities found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or search criteria
            </p>
            <Button
              onClick={() => {
                setFilters({
                  priceRange: [0, 3000],
                  rating: 0,
                  amenities: [],
                  distance: 50,
                  category: [],
                  availability: 'any'
                })
                setSearchQuery('')
                setSelectedSportType('all')
                setCurrentPage(1)
                fetchSports({}, 1)
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
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {filteredFacilities.map((facility, index) => (
          <motion.div
            key={facility._id || facility.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ListingCard
              id={facility._id || facility.name}
              title={facility.name}
              description={facility.description}
              image="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
              rating={facility.rating?.average || 0}
              reviewCount={facility.rating?.count || 0}
              price={facility.entryFee?.adult || 0}
              priceUnit="entry"
              location={`${facility.address?.area || ''}, ${facility.address?.city || ''}`}
              category="sports"
              amenities={facility.amenities || []}
              distance="2 km from city center"
              isPromoted={facility.promoted || false}
              href={`/sports/${facility.name.toLowerCase().replace(/\s+/g, '-')}`}
              capacity={facility.capacity}
              facilities={facility.facilities || []}
              sport={facility.sport}
              sportsCategory={facility.category}
              openingHours={facility.timings}
            />
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
              <h1 className="text-3xl font-bold text-gray-900">Sports & Recreation</h1>
              <p className="text-gray-600 mt-1">
                Find the best sports facilities and recreational activities in Kolkata
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search sports facilities..."
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

          {/* Sport Type Filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            {sportTypes.map((type) => (
              <Button
                key={type}
                variant={selectedSportType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSportType(type)}
                className={selectedSportType === type ? 'bg-orange-600 hover:bg-orange-700' : ''}
              >
                {type === 'all' ? 'All Sports' : type}
              </Button>
            ))}
          </div>

          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {totalItems} facilities found
            </span>
            <select className="text-sm border border-gray-300 rounded-md px-3 py-1">
              <option>Sort by: Recommended</option>
              <option>Rating: High to Low</option>
              <option>Price: Low to High</option>
              <option>Distance</option>
              <option>Most Popular</option>
            </select>
          </div>

          {/* Pagination Info */}
          {!error && totalItems > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} facilities
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
              category="sports"
            />
          </div>

          {/* Mobile Filter Sidebar */}
          <FilterSidebar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            category="sports"
          />

          {/* Results */}
          <div className="flex-1">
            {viewMode === 'grid' ? (
              renderContent()
            ) : (
              <Card className="h-96">
                <CardContent className="flex items-center justify-center h-full text-gray-500">
                  Interactive map with sports facility locations will be displayed here
                  <br />
                  (Leaflet integration with sports icons coming soon)
                </CardContent>
              </Card>
            )}

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
