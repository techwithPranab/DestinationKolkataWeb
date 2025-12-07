"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Gift, MapPin, Tag, Star, ExternalLink, Filter, Search, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Promotion {
  id: string
  title: string
  description: string
  image: string
  businessName: string
  businessType: 'hotel' | 'restaurant' | 'attraction' | 'shop' | 'service'
  discount: string
  originalPrice?: number
  discountedPrice?: number
  validFrom: string
  validUntil: string
  location: string
  rating: number
  reviewCount: number
  isExclusive: boolean
  isFeatured: boolean
  code?: string
  terms: string[]
  contact: string
  website?: string
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>('all')
  const [showExpired, setShowExpired] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

  // Get unique business types for filter
  const businessTypes = ['all', ...new Set(promotions.map(p => p.businessType))]

  // Fetch promotions from API
  const fetchPromotions = async (page = 1, search = '', type = 'all') => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(search && { search }),
        ...(type !== 'all' && { type })
      })
      console.log('Fetching promotions with params:', params.toString());
      const response = await fetch(`${backendURL}/api/promotions?${params}`)
      const result = await response.json()
      console.log('Fetched promotions:', result);
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch promotions')
      }

      setPromotions(result.data || [])
      setFilteredPromotions(result.data || [])
      setLoading(false)

    } catch (err) {
      console.error('Error fetching promotions:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch promotions')
      setPromotions([])
      setFilteredPromotions([])
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchPromotions()
  }, [])

  // Apply client-side filters for search and expired toggle
  useEffect(() => {
    let filtered = promotions

    // Hide expired promotions unless specified
    if (!showExpired) {
      const today = new Date()
      filtered = filtered.filter(promotion =>
        new Date(promotion.validUntil) >= today
      )
    }

    // Search query (additional client-side filtering)
    if (searchQuery) {
      filtered = filtered.filter(promotion =>
        promotion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        promotion.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        promotion.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        promotion.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredPromotions(filtered)
  }, [searchQuery, promotions, showExpired])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date()
  }

  const getDaysRemaining = (validUntil: string) => {
    const today = new Date()
    const expiry = new Date(validUntil)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <span className="ml-3 text-gray-600">Loading promotions...</span>
        </div>
      )
    }

    if (error) {
      return (
        <Card className="p-12 text-center">
          <CardContent>
            <h3 className="text-lg font-medium text-red-600 mb-2">
              Error loading promotions
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button
              onClick={() => fetchPromotions()}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )
    }

    if (!filteredPromotions || filteredPromotions.length === 0) {
      return (
        <Card className="p-12 text-center">
          <CardContent>
            <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No promotions found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or check back later for new offers
            </p>
            <Button
              onClick={() => {
                setSearchQuery('')
                setSelectedBusinessType('all')
                setShowExpired(false)
              }}
              className="mt-4"
            >
              Clear filters
            </Button>
          </CardContent>
        </Card>
      )
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredPromotions.map((promotion, index) => (
          <motion.div
            key={promotion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`h-full hover:shadow-xl transition-all duration-300 relative overflow-hidden ${
              isExpired(promotion.validUntil) ? 'opacity-60' : ''
            }`}>
              {/* Featured/Exclusive Badges */}
              <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                {promotion.isFeatured && (
                  <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </span>
                )}
                {promotion.isExclusive && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    Exclusive
                  </span>
                )}
              </div>

              {/* Discount Badge */}
              <div className="absolute top-2 right-2 z-10">
                <span className="bg-orange-500 text-white text-lg font-bold px-3 py-2 rounded-full">
                  {promotion.discount}
                </span>
              </div>

              {/* Image */}
              <div className="h-48 bg-gray-200 overflow-hidden">
                <img
                  src={promotion.image}
                  alt={promotion.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{promotion.title}</CardTitle>
                    <p className="text-sm text-gray-600">{promotion.businessName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getBusinessTypeColor(promotion.businessType)}`}>
                    {promotion.businessType}
                  </span>
                  <div className="flex items-center text-yellow-500">
                    <Star className="h-3 w-3 fill-current" />
                    <span className="text-xs text-gray-600 ml-1">
                      {promotion.rating} ({promotion.reviewCount})
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-2">{promotion.description}</p>

                {/* Pricing */}
                {promotion.originalPrice && promotion.discountedPrice && (
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-green-600">
                      ₹{promotion.discountedPrice}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      ₹{promotion.originalPrice}
                    </span>
                  </div>
                )}

                {/* Location */}
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{promotion.location}</span>
                </div>

                {/* Validity */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>Valid until {formatDate(promotion.validUntil)}</span>
                  </div>
                  {!isExpired(promotion.validUntil) && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      getDaysRemaining(promotion.validUntil) <= 7 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {getDaysRemaining(promotion.validUntil)} days left
                    </span>
                  )}
                </div>

                {/* Promo Code */}
                {promotion.code && (
                  <div className="bg-gray-100 p-2 rounded border-dashed border-2 border-gray-300">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Promo Code:</span>
                      <span className="font-mono font-bold text-orange-600">{promotion.code}</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                  <Button 
                    className="flex-1 text-white bg-orange-600 hover:bg-orange-700"
                    disabled={isExpired(promotion.validUntil)}
                  >
                    <Tag className="h-4 w-4 mr-2" />
                    {isExpired(promotion.validUntil) ? 'Expired' : 'Claim Offer'}
                  </Button>
                  {promotion.website && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(promotion.website, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    )
  }

  const getBusinessTypeColor = (type: string) => {
    switch (type) {
      case 'hotel':
        return 'bg-blue-100 text-blue-800'
      case 'restaurant':
        return 'bg-green-100 text-green-800'
      case 'attraction':
        return 'bg-purple-100 text-purple-800'
      case 'shop':
        return 'bg-orange-100 text-orange-800'
      case 'service':
        return 'bg-pink-100 text-pink-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Gift className="h-8 w-8 mr-3" />
              <h1 className="text-4xl font-bold">Special Offers & Promotions</h1>
            </div>
            <p className="text-xl text-orange-100">
              Discover amazing deals and exclusive offers from top businesses in Kolkata
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg shadow-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search offers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/90 backdrop-blur-sm shadow-lg rounded-lg focus:ring-2 focus:ring-orange-500 focus:shadow-orange-200 transition-all duration-200 w-64"
                />
              </div>

              {/* Show Expired Toggle */}
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={showExpired}
                  onChange={(e) => setShowExpired(e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span>Show expired offers</span>
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Filter by:</span>
              <select
                value={selectedBusinessType}
                onChange={(e) => setSelectedBusinessType(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1"
              >
                <option value="all">All Categories</option>
                {businessTypes.slice(1).map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}s
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {filteredPromotions.length} offers available
            </span>
            <span className="text-sm text-orange-600 font-medium">
              Limited time offers - Act fast!
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  )
}
