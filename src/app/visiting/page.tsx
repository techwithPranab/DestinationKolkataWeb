"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Filter, Grid, Map, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ListingCard from '@/components/shared/ListingCard'
import FilterSidebar from '@/components/shared/FilterSidebar'

interface Attraction {
  _id: string
  name: string
  description: string
  shortDescription?: string
  images: Array<{
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
    area: string
    city: string
    state: string
    pincode?: string
    landmark?: string
  }
  contact?: {
    phone?: string[]
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
  status: 'active' | 'inactive' | 'pending' | 'rejected'
  featured: boolean
  promoted: boolean
  category: 'Historical' | 'Religious' | 'Museums' | 'Parks' | 'Architecture' | 'Cultural' | 'Educational' | 'Entertainment'
  entryFee: {
    adult: number
    child: number
    senior: number
    currency: string
    isFree: boolean
  }
  timings: {
    open: string
    close: string
    closedDays: string[]
    specialHours?: Array<{
      date: Date
      open: string
      close: string
      note: string
    }>
  }
  bestTimeToVisit: string
  duration: string
  guidedTours?: {
    available: boolean
    languages: string[]
    price: number
    duration: string
  }
  accessibility?: {
    wheelchairAccessible: boolean
    parkingAvailable: boolean
    publicTransport: string
  }
}

interface FilterOptions {
  priceRange: [number, number]
  rating: number
  amenities: string[]
  distance: number
  category: string[]
  availability: string
}


export default function VisitingPage() {
  const [attractions, setAttractions] = useState<Attraction[]>([])
  const [filteredAttractions, setFilteredAttractions] = useState<Attraction[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 500],
    rating: 0,
    amenities: [],
    distance: 50,
    category: [],
    availability: 'any'
  })

  // Fetch attractions from API
  const fetchAttractions = async (params: Record<string, string> = {}, page = 1) => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...params
      })

      const response = await fetch(`/api/attractions?${queryParams}`)

      if (!response.ok) {
        throw new Error('Failed to fetch attractions')
      }

      const data = await response.json()
      console.log('Fetched attractions:', data)
      setAttractions(data.places || [])
      setFilteredAttractions(data.places || [])
      setTotalItems(data.total || 0)
      setTotalPages(Math.ceil((data.total || 0) / itemsPerPage))
      setCurrentPage(page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attractions')
      console.error('Error fetching attractions:', err)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchAttractions({}, 1)
  }, [])

  // Get unique categories for filter
  const categories = ['all', ...new Set(attractions.map(a => a.category))]

  // Apply filters
  useEffect(() => {
    const params: Record<string, string> = {}

    // Price filter
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 500) {
      params.priceRange = `${filters.priceRange[0]}-${filters.priceRange[1]}`
    }

    // Rating filter
    if (filters.rating > 0) {
      params.rating = filters.rating.toString()
    }

    // Category filter
    if (selectedCategory !== 'all') {
      params.category = selectedCategory
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

    fetchAttractions(params, 1)
    setCurrentPage(1)
  }, [filters, searchQuery, selectedCategory])

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    const params: Record<string, string> = {}

    // Price filter
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 500) {
      params.priceRange = `${filters.priceRange[0]}-${filters.priceRange[1]}`
    }

    // Rating filter
    if (filters.rating > 0) {
      params.rating = filters.rating.toString()
    }

    // Category filter
    if (selectedCategory !== 'all') {
      params.category = selectedCategory
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

    fetchAttractions(params, page)
  }

  // Render content based on state
  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }, (_, i) => (
            <Card key={`loading-attraction-${i + 1}`} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    if (error) {
      return (
        <Card className="p-12 text-center">
          <CardContent>
            <h3 className="text-lg font-medium text-red-600 mb-2">
              Error loading attractions
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button
              onClick={() => fetchAttractions({}, 1)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )
    }

    if (filteredAttractions.length === 0) {
      return (
        <Card className="p-12 text-center">
          <CardContent>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No attractions found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or search criteria
            </p>
            <Button
              onClick={() => {
                setFilters({
                  priceRange: [0, 500],
                  rating: 0,
                  amenities: [],
                  distance: 50,
                  category: [],
                  availability: 'any'
                })
                setSearchQuery('')
                setSelectedCategory('all')
                setCurrentPage(1)
                fetchAttractions({}, 1)
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
        {filteredAttractions.map((attraction, index) => (
          <motion.div
            key={attraction._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ListingCard
              id={attraction._id}
              title={attraction.name}
              description={attraction.description}
              image={attraction.images?.[0]?.url || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"}
              rating={attraction.rating?.average || 0}
              reviewCount={attraction.rating?.count || 0}
              price={attraction.entryFee?.adult || 0}
              priceUnit="person"
              location={attraction.address?.area || ''}
              category="attraction"
              amenities={attraction.amenities || []}
              distance=""
              isPromoted={attraction.promoted || false}
              href={`/visiting/${attraction.name.toLowerCase().replace(/\s+/g, '-')}`}
              duration={attraction.duration}
              entryFee={attraction.entryFee}
              timings={attraction.timings}
              attractionCategory={attraction.category}
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
              <h1 className="text-3xl font-bold text-gray-900">Places to Visit</h1>
              <p className="text-gray-600 mt-1">
                Explore Kolkata&apos;s rich heritage and cultural attractions
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search attractions..."
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

          {/* Category Filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? 'bg-orange-600 hover:bg-orange-700' : ''}
              >
                {category === 'all' ? 'All Categories' : category}
              </Button>
            ))}
          </div>

          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {totalItems} attractions found
            </span>
            <select className="text-sm border border-gray-300 rounded-md px-3 py-1">
              <option>Sort by: Recommended</option>
              <option>Rating: High to Low</option>
              <option>Distance</option>
              <option>Entry Fee: Low to High</option>
              <option>Most Popular</option>
            </select>
          </div>

          {/* Pagination Info */}
          {!error && totalItems > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} attractions
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
              category="attractions"
            />
          </div>

          {/* Mobile Filter Sidebar */}
          <FilterSidebar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            category="attractions"
          />

          {/* Results */}
          <div className="flex-1">
            {viewMode === 'grid' ? (
              renderContent()
            ) : (
              <Card className="h-96">
                <CardHeader>
                  <CardTitle>Attractions Map View</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-full text-gray-500">
                  Interactive map with attraction locations will be displayed here
                  <br />
                  (Leaflet integration with landmark icons coming soon)
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
