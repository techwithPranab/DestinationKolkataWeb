"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Filter, Grid, Map, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ListingCard from '@/components/shared/ListingCard'
import FilterSidebar from '@/components/shared/FilterSidebar'

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
    type: 'Point'
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
  rating: {
    average: number
    count: number
  }
  amenities: string[]
  tags: string[]
  status: string
  featured: boolean
  promoted: boolean
  cuisine: string[]
  priceRange: string
  openingHours: {
    monday: { open: string; close: string; closed: boolean }
    tuesday: { open: string; close: string; closed: boolean }
    wednesday: { open: string; close: string; closed: boolean }
    thursday: { open: string; close: string; closed: boolean }
    friday: { open: string; close: string; closed: boolean }
    saturday: { open: string; close: string; closed: boolean }
    sunday: { open: string; close: string; closed: boolean }
  }
  avgMealCost: number
  reservationRequired: boolean
}

interface FilterOptions {
  priceRange: [number, number]
  rating: number
  amenities: string[]
  distance: number
  category: string[]
  availability: string
}



export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  // Pagination calculations
  const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentRestaurants = filteredRestaurants.slice(startIndex, endIndex)

  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 1500],
    rating: 0,
    amenities: [],
    distance: 50,
    category: [],
    availability: 'any'
  })

  // Get unique cuisines for filter
  const cuisines = ['all', ...new Set(restaurants.flatMap(r => r.cuisine || []))]
  const fetchRestaurants = useCallback(async (search = '', currentFilters = filters, cuisine = selectedCuisine) => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams({
        limit: '1000', // Load all restaurants
        ...(search && { search }),
        ...(currentFilters.rating > 0 && { rating: currentFilters.rating.toString() }),
        ...(currentFilters.priceRange[0] > 0 && { minPrice: currentFilters.priceRange[0].toString() }),
        ...(currentFilters.priceRange[1] < 1500 && { maxPrice: currentFilters.priceRange[1].toString() }),
        ...(currentFilters.amenities.length > 0 && { amenities: currentFilters.amenities.join(',') }),
        ...(cuisine && cuisine !== 'all' && { cuisine })
      })

      const response = await fetch(`/api/restaurants?${params}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch restaurants')
      }

      setRestaurants(result.restaurants || [])
      setFilteredRestaurants(result.restaurants || [])

    } catch (err) {
      console.error('Error fetching restaurants:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch restaurants')
      setRestaurants([])
      setFilteredRestaurants([])
    } finally {
      setIsLoading(false)
    }
  }, [filters, selectedCuisine])

  // Initial data fetch
  useEffect(() => {
    fetchRestaurants()
  }, [fetchRestaurants])

  // Apply filters
  useEffect(() => {
    let filtered = restaurants

    // Price filter
    filtered = filtered.filter(restaurant => 
      restaurant.avgMealCost >= filters.priceRange[0] && restaurant.avgMealCost <= filters.priceRange[1]
    )

    // Rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(restaurant => restaurant.rating.average >= filters.rating)
    }

    // Cuisine filter
    if (selectedCuisine !== 'all') {
      filtered = filtered.filter(restaurant => 
        restaurant.cuisine?.includes(selectedCuisine)
      )
    }

    // Amenities filter
    if (filters.amenities.length > 0) {
      filtered = filtered.filter(restaurant =>
        filters.amenities.every(amenity => restaurant.amenities.includes(amenity))
      )
    }

    // Search query
    if (searchQuery) {
      filtered = filtered.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.address.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.cuisine?.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    setFilteredRestaurants(filtered)
  }, [filters, searchQuery, restaurants, selectedCuisine])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters, searchQuery, selectedCuisine])

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
    fetchRestaurants(searchQuery, newFilters, selectedCuisine)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    fetchRestaurants(query, filters, selectedCuisine)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg shadow-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Restaurants & Dining</h1>
              <p className="text-gray-600 mt-1">
                Discover the best culinary experiences in Kolkata
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search restaurants..."
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

          {/* Cuisine Filters */}
          {/* <div className="mt-4 flex flex-wrap gap-2">
            {cuisines.map((cuisine) => (
              <Button
                key={cuisine}
                variant={selectedCuisine === cuisine ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedCuisine(cuisine)
                  fetchRestaurants(searchQuery, filters, cuisine)
                }}
                className={selectedCuisine === cuisine ? 'bg-orange-600 hover:bg-orange-700' : ''}
              >
                {cuisine === 'all' ? 'All Cuisines' : cuisine}
              </Button>
            ))}
          </div> */}

          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between">
            {/* <span className="text-sm text-gray-600">
              {error ? 'Error loading restaurants' : `${filteredRestaurants?.length || 0} restaurants found`}
            </span> */}
            <span className="text-sm text-gray-600">
                {!error && totalPages > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalPages)} of {totalPages} restaurant
                </div>
              )}
            </span>
            <select className="text-sm border border-gray-300 rounded-md px-3 py-1">
              <option>Sort by: Recommended</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Rating: High to Low</option>
              <option>Distance</option>
              <option>Most Popular</option>
            </select>
          </div>

          {/* Pagination Info */}
          {/* {!error && filteredRestaurants.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredRestaurants.length)} of {filteredRestaurants.length} restaurants
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
              category="restaurants"
            />
          </div>

          {/* Mobile Filter Sidebar */}
          <FilterSidebar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            category="restaurants"
          />

          {/* Results */}
          <div className="flex-1">
            {(() => {
              if (error) {
                return (
                  <Card className="p-12 text-center">
                    <CardContent>
                      <h3 className="text-lg font-medium text-red-900 mb-2">
                        Error Loading Restaurants
                      </h3>
                      <p className="text-red-600 mb-4">
                        {error}
                      </p>
                      <Button
                        onClick={() => fetchRestaurants()}
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
                    <CardHeader>
                      <CardTitle>Restaurant Map View</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center h-full text-gray-500">
                      Interactive map with restaurant locations will be displayed here
                      <br />
                      (Leaflet integration with food icons coming soon)
                    </CardContent>
                  </Card>
                );
              }

              return (
                <>
                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {Array.from({ length: 6 }, (_, i) => (
                        <Card key={`loading-skeleton-${i + 1}`} className="animate-pulse">
                          <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                          <CardContent className="p-4">
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded mb-4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <>
                      {filteredRestaurants.length > 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                        >
                          {currentRestaurants.map((restaurant, index) => (
                            <motion.div
                              key={restaurant._id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex flex-col"
                            >
                              <ListingCard
                                id={restaurant._id}
                                title={restaurant.name}
                                description={restaurant.description}
                                image={restaurant.images?.[0]?.url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"}
                                rating={restaurant.rating.average}
                                reviewCount={restaurant.rating.count}
                                price={restaurant.avgMealCost}
                                priceUnit="person"
                                location={restaurant.address.area}
                                category="restaurant"
                                amenities={restaurant.amenities}
                                distance=""
                                isPromoted={restaurant.promoted}
                                href={`/restaurants/${restaurant.name.toLowerCase().replace(/\s+/g, '-')}`}
                                openingHours={restaurant.openingHours}
                                priceRange={restaurant.priceRange}
                                cuisine={restaurant.cuisine}
                              />
                            </motion.div>
                          ))}
                        </motion.div>
                      ) : (
                        <Card className="p-12 text-center">
                          <CardContent>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              No restaurants found
                            </h3>
                            <p className="text-gray-600">
                              Try adjusting your filters or search criteria
                            </p>
                            <Button
                              onClick={() => {
                                setFilters({
                                  priceRange: [0, 1500],
                                  rating: 0,
                                  amenities: [],
                                  distance: 50,
                                  category: [],
                                  availability: 'any'
                                })
                                setSearchQuery('')
                                setSelectedCuisine('all')
                                fetchRestaurants()
                              }}
                              className="mt-4"
                            >
                              Clear all filters
                            </Button>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}

                  {/* Pagination */}
                  {filteredRestaurants.length > 0 && totalPages > 1 && (
                    <div className="flex items-center justify-between mt-8">
                      <div className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                              onClick={() => setCurrentPage(pageNum)}
                              className={currentPage === pageNum ? 'text-white bg-orange-600 hover:bg-orange-700' : ''}
                            >
                              {pageNum}
                            </Button>
                          )
                        })}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}
