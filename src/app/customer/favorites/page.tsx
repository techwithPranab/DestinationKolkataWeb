"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Heart,
  Search,
  Eye,
  Hotel,
  UtensilsCrossed,
  Calendar,
  Trophy,
  MapPin,
  Star,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { useFavorites } from '@/hooks/useFavorites'

interface FavoriteItem {
  type: 'hotel' | 'restaurant' | 'attraction' | 'event' | 'sports'
  itemId: string
  itemName: string
  addedDate: string
  notes?: string
  // Additional fields that might come from the actual item data
  location?: string
  rating?: number
  image?: string
  description?: string
}

export default function CustomerFavorites() {
  const { user, isAuthenticated } = useAuth()
  const { favorites, removeFromFavorites, isLoading: favoritesLoading } = useFavorites()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('addedDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(12)
  const [enrichedFavorites, setEnrichedFavorites] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated && user && favorites.length > 0) {
      enrichFavoritesData()
    } else if (favorites.length === 0) {
      setEnrichedFavorites([])
      setLoading(false)
    }
  }, [favorites, isAuthenticated, user])

  const enrichFavoritesData = async () => {
    try {
      setLoading(true)
      // For now, we'll just use the basic favorite data
      // In a real implementation, you might want to fetch additional details
      // for each favorited item from their respective APIs
      const enriched = favorites.map(fav => ({
        type: fav.type,
        itemId: fav.itemId,
        itemName: fav.itemName,
        addedDate: fav.addedDate,
        notes: fav.notes,
        // Mock additional data - in real app, fetch from APIs
        location: 'Kolkata, India',
        rating: Math.floor(Math.random() * 5) + 1,
        description: `A wonderful ${fav.type} in Kolkata`
      }))
      setEnrichedFavorites(enriched)
    } catch (error) {
      console.error('Error enriching favorites data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hotel':
        return <Hotel className="w-5 h-5" />
      case 'restaurant':
        return <UtensilsCrossed className="w-5 h-5" />
      case 'attraction':
        return <MapPin className="w-5 h-5" />
      case 'event':
        return <Calendar className="w-5 h-5" />
      case 'sports':
        return <Trophy className="w-5 h-5" />
      default:
        return <Heart className="w-5 h-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hotel':
        return 'bg-blue-100 text-blue-800'
      case 'restaurant':
        return 'bg-green-100 text-green-800'
      case 'attraction':
        return 'bg-purple-100 text-purple-800'
      case 'event':
        return 'bg-orange-100 text-orange-800'
      case 'sports':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleView = (favorite: FavoriteItem) => {
    // Navigate to the appropriate detail page based on type
    // For now, we'll show an alert
    alert(`Viewing: ${favorite.itemName}
Type: ${favorite.type}
Location: ${favorite.location}
Rating: ${favorite.rating}/5`)
  }

  const handleRemoveFavorite = async (favorite: FavoriteItem) => {
    if (!confirm(`Remove "${favorite.itemName}" from favorites?`)) {
      return
    }

    const result = await removeFromFavorites(favorite.type, favorite.itemId)
    if (!result.success) {
      alert('Failed to remove from favorites')
    }
  }

  // Filter and sort favorites
  const filteredFavorites = enrichedFavorites
    .filter(fav => {
      const matchesSearch = fav.itemName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = typeFilter === 'all' || fav.type === typeFilter
      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      let aValue: string | number = a[sortBy as keyof FavoriteItem] as string | number
      let bValue: string | number = b[sortBy as keyof FavoriteItem] as string | number

      if (sortBy === 'addedDate') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  // Pagination
  const totalPages = Math.ceil(filteredFavorites.length / pageSize)
  const paginatedFavorites = filteredFavorites.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  if (loading || favoritesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your favorites...</p>
        </div>
      </div>
    )
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to view your favorites.</p>
          <Button
            className="bg-orange-600 hover:bg-orange-700 text-white"
            onClick={() => window.location.href = '/auth/login'}
          >
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  // Check if user has customer role
  if (user && user.role !== 'customer') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">This page is only accessible to customers.</p>
          <Button
            className="bg-orange-600 hover:bg-orange-700 text-white"
            onClick={() => window.location.href = '/'}
          >
            Go to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
          <p className="text-gray-600 mt-1">Your saved places and experiences</p>
        </div>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {favorites.length} favorites
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search favorites..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className='bg-white'>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="hotel">Hotels</SelectItem>
                <SelectItem value="restaurant">Restaurants</SelectItem>
                <SelectItem value="attraction">Attractions</SelectItem>
                <SelectItem value="event">Events</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
              </SelectContent>
            </Select>
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [field, order] = value.split('-')
              setSortBy(field)
              setSortOrder(order as 'asc' | 'desc')
            }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className='bg-white'>
                <SelectItem value="addedDate-desc">Recently Added</SelectItem>
                <SelectItem value="addedDate-asc">Oldest First</SelectItem>
                <SelectItem value="itemName-asc">Name A-Z</SelectItem>
                <SelectItem value="itemName-desc">Name Z-A</SelectItem>
                <SelectItem value="type-asc">Type A-Z</SelectItem>
                <SelectItem value="type-desc">Type Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Favorites Grid */}
      {paginatedFavorites.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {favorites.length === 0 ? 'No favorites yet' : 'No favorites match your filters'}
            </h3>
            <p className="text-gray-600 mb-4">
              {favorites.length === 0
                ? 'Start exploring and save places you love!'
                : 'Try adjusting your search or filters'
              }
            </p>
            {favorites.length === 0 && (
              <Button
                className="bg-orange-600 hover:bg-orange-700 text-white"
                onClick={() => window.location.href = '/places'}
              >
                Explore Places
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedFavorites.map((favorite) => (
            <motion.div
              key={`${favorite.type}-${favorite.itemId}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(favorite.type)}
                      <Badge className={getTypeColor(favorite.type)}>
                        {favorite.type}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveFavorite(favorite)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </Button>
                  </div>
                  <CardTitle className="text-lg">{favorite.itemName}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {favorite.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        {favorite.location}
                      </div>
                    )}
                    {favorite.rating && (
                      <div className="flex items-center">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < favorite.rating!
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          {favorite.rating}/5
                        </span>
                      </div>
                    )}
                    {favorite.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {favorite.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-gray-500">
                        Added {new Date(favorite.addedDate).toLocaleDateString()}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(favorite)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredFavorites.length)} of {filteredFavorites.length} favorites
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            {/* Page numbers */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                if (pageNum > totalPages) return null
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={currentPage === pageNum ? "bg-orange-600 hover:bg-orange-700" : ""}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
