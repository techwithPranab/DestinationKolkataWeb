"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, X, Star, DollarSign, MapPin, Clock, IndianRupee } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

interface FilterOptions {
  priceRange: [number, number]
  rating: number
  amenities: string[]
  distance: number
  category: string[]
  availability: string
}

interface FilterSidebarProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  isOpen: boolean
  onClose: () => void
  category: 'hotels' | 'restaurants' | 'attractions' | 'events' | 'sports'
}

const filterConfig = {
  hotels: {
    amenities: ['WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Parking', 'AC', 'Room Service'],
    categories: ['Luxury', 'Business', 'Budget', 'Boutique', 'Resort']
  },
  restaurants: {
    amenities: ['Outdoor Seating', 'WiFi', 'Parking', 'Live Music', 'AC', 'Home Delivery', 'Takeaway'],
    categories: ['Bengali', 'North Indian', 'Chinese', 'Continental', 'Street Food', 'Sweets', 'Fast Food']
  },
  attractions: {
    amenities: ['Guided Tours', 'Audio Guide', 'Parking', 'Wheelchair Access', 'Photography', 'Gift Shop'],
    categories: ['Historical', 'Religious', 'Museums', 'Parks', 'Architecture', 'Cultural', 'Educational']
  },
  events: {
    amenities: ['Online Booking', 'Parking', 'Food Available', 'Wheelchair Access', 'Photography', 'Recording'],
    categories: ['Concerts', 'Festivals', 'Theater', 'Sports', 'Workshops', 'Exhibitions', 'Cultural']
  },
  sports: {
    amenities: ['Changing Rooms', 'Showers', 'Equipment Rental', 'Parking', 'Cafeteria', 'First Aid', 'WiFi', 'AC'],
    categories: ['Football', 'Cricket', 'Basketball', 'Tennis', 'Swimming', 'Badminton', 'Volleyball', 'Gym']
  }
}

export default function FilterSidebar({ 
  filters, 
  onFiltersChange, 
  isOpen, 
  onClose, 
  category 
}: FilterSidebarProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters)
  const config = filterConfig[category]

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    const newAmenities = checked 
      ? [...localFilters.amenities, amenity]
      : localFilters.amenities.filter(a => a !== amenity)
    
    setLocalFilters({ ...localFilters, amenities: newAmenities })
  }

  const handleCategoryChange = (cat: string, checked: boolean) => {
    const newCategories = checked 
      ? [...localFilters.category, cat]
      : localFilters.category.filter(c => c !== cat)
    
    setLocalFilters({ ...localFilters, category: newCategories })
  }

  const applyFilters = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  const clearFilters = () => {
    const resetFilters: FilterOptions = {
      priceRange: [0, 10000],
      rating: 0,
      amenities: [],
      distance: 50,
      category: [],
      availability: 'any'
    }
    setLocalFilters(resetFilters)
    onFiltersChange(resetFilters)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 lg:static lg:shadow-none overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-white/95 backdrop-blur-sm shadow-lg shadow-gray-200/50">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 space-y-6">
              {/* Price Range */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <IndianRupee className="h-4 w-4 mr-2 text-green-600" />
                    Price Range
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={localFilters.priceRange[0]}
                      onChange={(e) => setLocalFilters({
                        ...localFilters,
                        priceRange: [parseInt(e.target.value) || 0, localFilters.priceRange[1]]
                      })}
                      className="w-full px-3 py-2 rounded-md text-sm bg-white shadow-md focus:ring-2 focus:ring-orange-500 focus:shadow-orange-200 transition-all duration-200"
                      placeholder="Min"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      value={localFilters.priceRange[1]}
                      onChange={(e) => setLocalFilters({
                        ...localFilters,
                        priceRange: [localFilters.priceRange[0], parseInt(e.target.value) || 10000]
                      })}
                      className="w-full px-3 py-2 rounded-md text-sm bg-white shadow-md focus:ring-2 focus:ring-orange-500 focus:shadow-orange-200 transition-all duration-200"
                      placeholder="Max"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Rating */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Star className="h-4 w-4 mr-2 text-yellow-600" />
                    Minimum Rating
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setLocalFilters({ ...localFilters, rating })}
                          className={`flex items-center px-2 py-1.5 rounded text-xs transition-colors ${
                            localFilters.rating >= rating
                              ? 'bg-yellow-100 text-yellow-800 shadow-sm'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <Star className="h-3 w-3 mr-1" />
                          {rating}+
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Distance */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                    Distance (km)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={localFilters.distance}
                    onChange={(e) => setLocalFilters({ ...localFilters, distance: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>1 km</span>
                    <span>{localFilters.distance} km</span>
                    <span>50+ km</span>
                  </div>
                </CardContent>
              </Card>

              {/* Categories */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {config.categories.map((cat) => (
                    <div key={cat} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${cat}`}
                        checked={localFilters.category.includes(cat)}
                        onCheckedChange={(checked) => handleCategoryChange(cat, checked as boolean)}
                      />
                      <label htmlFor={`category-${cat}`} className="text-sm text-gray-700 cursor-pointer">
                        {cat}
                      </label>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Amenities */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Amenities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {config.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={`amenity-${amenity}`}
                        checked={localFilters.amenities.includes(amenity)}
                        onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                      />
                      <label htmlFor={`amenity-${amenity}`} className="text-sm text-gray-700 cursor-pointer">
                        {amenity}
                      </label>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Availability */}
              {category === 'hotels' && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-purple-600" />
                      Availability
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <select
                      value={localFilters.availability}
                      onChange={(e) => setLocalFilters({ ...localFilters, availability: e.target.value })}
                      className="w-full px-3 py-2 rounded-md text-sm bg-white shadow-md focus:ring-2 focus:ring-orange-500 focus:shadow-orange-200 transition-all duration-200"
                    >
                      <option value="any">Any time</option>
                      <option value="today">Available today</option>
                      <option value="weekend">This weekend</option>
                      <option value="week">This week</option>
                    </select>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm shadow-lg shadow-gray-200/50 p-4 space-y-2">
              <Button onClick={applyFilters} className="w-full bg-orange-600 hover:bg-orange-700">
                Apply Filters
              </Button>
              <Button onClick={clearFilters} variant="outline" className="w-full shadow-sm">
                Clear All
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
