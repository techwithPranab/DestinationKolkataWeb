"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Star,
  ChefHat,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Restaurant {
  _id: string
  name: string
  description: string
  cuisine: string
  location: {
    address: string
    coordinates: [number, number]
  }
  contact: {
    phone: string
    email: string
    website?: string
  }
  priceRange: string
  rating: {
    average: number
    count: number
  }
  reviews: number
  openHours: {
    open: string
    close: string
  }
  features: string[]
  images: string[]
  status: 'active' | 'inactive' | 'pending'
  createdAt: string
  updatedAt: string
}

const cuisineTypes = [
  'Bengali', 'North Indian', 'South Indian', 'Chinese', 'Continental',
  'Italian', 'Mexican', 'Thai', 'Japanese', 'Mughlai', 'Street Food'
]

const priceRanges = [
  { value: 'budget', label: '₹ - Budget (Under ₹500)' },
  { value: 'moderate', label: '₹₹ - Moderate (₹500-₹1500)' },
  { value: 'expensive', label: '₹₹₹ - Expensive (₹1500+)' }
]

const restaurantFeatures = [
  'WiFi', 'AC', 'Parking', 'Home Delivery', 'Takeaway', 'Live Music',
  'Outdoor Seating', 'Bar', 'Family Friendly', 'Pet Friendly', 'Vegetarian Only'
]

export default function RestaurantsAdmin() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCuisine, setFilterCuisine] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRestaurants, setTotalRestaurants] = useState(0)
  const [pageSize] = useState(10) // Items per page
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisine: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    priceRange: '',
    openTime: '',
    closeTime: '',
    features: [] as string[],
    images: [] as string[]
  })

  const fetchRestaurants = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        status: 'all' // Include all statuses for admin
      })

      if (searchTerm) params.append('search', searchTerm)
      if (filterCuisine && filterCuisine !== 'all') params.append('cuisine', filterCuisine)
      if (filterStatus && filterStatus !== 'all') params.append('status', filterStatus)

      const response = await fetch(`/api/restaurants?${params}`)
      const data = await response.json()
      
      setRestaurants(data.restaurants || [])
      setTotalRestaurants(data.pagination?.total || 0)
      setTotalPages(data.pagination?.totalPages || 1)
      setCurrentPage(data.pagination?.page || 1)
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    } finally {
      setLoading(false)
    }
  }, [searchTerm, filterCuisine, filterStatus, pageSize])

  useEffect(() => {
    fetchRestaurants(currentPage)
  }, [currentPage, fetchRestaurants])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterCuisine, filterStatus])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const restaurantData = {
      name: formData.name,
      description: formData.description,
      cuisine: formData.cuisine,
      location: {
        address: formData.address,
        coordinates: editingRestaurant?.location?.coordinates || [88.3639, 22.5726] // Default to Kolkata coordinates
      },
      contact: {
        phone: formData.phone,
        email: formData.email,
        website: formData.website
      },
      priceRange: formData.priceRange,
      openHours: {
        open: formData.openTime,
        close: formData.closeTime
      },
      features: formData.features,
      images: formData.images,
      status: 'active'
    }

    try {
      const url = editingRestaurant 
        ? `/api/restaurants/${editingRestaurant._id}`
        : '/api/restaurants'
      
      const method = editingRestaurant ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(restaurantData),
      })

      if (response.ok) {
        await fetchRestaurants()
        resetForm()
        setIsAddModalOpen(false)
        setEditingRestaurant(null)
      }
    } catch (error) {
      console.error('Error saving restaurant:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this restaurant?')) {
      try {
        const response = await fetch(`/api/restaurants/${id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          await fetchRestaurants()
        }
      } catch (error) {
        console.error('Error deleting restaurant:', error)
      }
    }
  }

  const handleEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant)
    setFormData({
      name: restaurant.name || '',
      description: restaurant.description || '',
      cuisine: restaurant.cuisine || '',
      address: restaurant.location?.address || '',
      phone: restaurant.contact?.phone || '',
      email: restaurant.contact?.email || '',
      website: restaurant.contact?.website || '',
      priceRange: restaurant.priceRange || '',
      openTime: restaurant.openHours?.open || '',
      closeTime: restaurant.openHours?.close || '',
      features: restaurant.features || [],
      images: restaurant.images || []
    })
    setIsAddModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      cuisine: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      priceRange: '',
      openTime: '',
      closeTime: '',
      features: [],
      images: []
    })
  }

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Restaurant Management</h1>
          <p className="text-gray-600 mt-2">Manage all restaurants in Kolkata</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm()
              setEditingRestaurant(null)
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Restaurant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRestaurant ? 'Edit Restaurant' : 'Add New Restaurant'}
              </DialogTitle>
              <DialogDescription>
                {editingRestaurant 
                  ? 'Update the restaurant information below.'
                  : 'Fill in the details to add a new restaurant.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Restaurant Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="cuisine">Cuisine Type</Label>
                  <Select value={formData.cuisine} onValueChange={(value: string) => setFormData({ ...formData, cuisine: value })}>
                    <SelectTrigger className="bg-white text-black">
                      <SelectValue placeholder="Select cuisine" />
                    </SelectTrigger>
                    <SelectContent>
                      {cuisineTypes.map((cuisine) => (
                        <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, address: e.target.value })}
                  required
                  className="bg-white text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="bg-white text-black"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website">Website (Optional)</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, website: e.target.value })}
                  className="bg-white text-black"
                />
              </div>

              <div>
                <Label htmlFor="priceRange">Price Range</Label>
                <Select value={formData.priceRange} onValueChange={(value: string) => setFormData({ ...formData, priceRange: value })}>
                  <SelectTrigger className="bg-white text-black">
                    <SelectValue placeholder="Select price range" />
                  </SelectTrigger>
                  <SelectContent>
                    {priceRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="openTime">Opening Time</Label>
                  <Input
                    id="openTime"
                    type="time"
                    value={formData.openTime}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, openTime: e.target.value })}
                    required
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="closeTime">Closing Time</Label>
                  <Input
                    id="closeTime"
                    type="time"
                    value={formData.closeTime}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, closeTime: e.target.value })}
                    required
                    className="bg-white text-black"
                  />
                </div>
              </div>

              <div>
                <Label>Features</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {restaurantFeatures.map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={feature}
                        checked={formData.features.includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                        className="rounded"
                      />
                      <Label htmlFor={feature} className="text-sm">{feature}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingRestaurant ? 'Update Restaurant' : 'Add Restaurant'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Restaurants</p>
                <p className="text-2xl font-bold text-gray-900">{totalRestaurants}</p>
              </div>
              <ChefHat className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {restaurants.filter(r => r.status === 'active').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {restaurants.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {restaurants.length > 0 
                    ? (restaurants.reduce((acc, r) => acc + (r.rating?.average || 0), 0) / restaurants.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search restaurants..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white text-black"
                />
              </div>
            </div>
            <Select value={filterCuisine} onValueChange={setFilterCuisine}>
              <SelectTrigger className="w-48 bg-white text-black">
                <SelectValue placeholder="Filter by cuisine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cuisines</SelectItem>
                {cuisineTypes.map((cuisine) => (
                  <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40 bg-white text-black">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Restaurants Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Restaurant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cuisine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(() => {
                  if (loading) {
                    return Array.from({ length: pageSize }, (_, index) => (
                      <tr key={`skeleton-${index}`} className="animate-pulse">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                            <div className="ml-4">
                              <div className="h-4 bg-gray-200 rounded w-32"></div>
                              <div className="h-3 bg-gray-200 rounded w-24 mt-1"></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-6 bg-gray-200 rounded w-16"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <div className="h-8 w-8 bg-gray-200 rounded"></div>
                            <div className="h-8 w-8 bg-gray-200 rounded"></div>
                            <div className="h-8 w-8 bg-gray-200 rounded"></div>
                          </div>
                        </td>
                      </tr>
                    ))
                  } else if (restaurants.length === 0) {
                    return (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No restaurants found matching your criteria.</p>
                        </td>
                      </tr>
                    )
                  } else {
                    return restaurants.map((restaurant) => (
                      <tr key={restaurant._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {restaurant.images && restaurant.images.length > 0 ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={restaurant.images[0]}
                                  alt={restaurant.name}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <ChefHat className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{restaurant.name}</div>
                              <div className="text-sm text-gray-500">{restaurant.cuisine}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{restaurant.cuisine}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{restaurant.location?.address || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {priceRanges.find(p => p.value === restaurant.priceRange)?.label || restaurant.priceRange}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {restaurant.openHours?.open || 'N/A'} - {restaurant.openHours?.close || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                            <span className="text-sm font-medium">{restaurant.rating?.average ? restaurant.rating.average.toFixed(1) : '0.0'}</span>
                            <span className="text-sm text-gray-500 ml-1">({restaurant.rating?.count || 0})</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusColor(restaurant.status)}>
                            {restaurant.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(restaurant)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleDelete(restaurant._id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                })()}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
          <div className="flex items-center text-sm text-gray-700">
            <p>
              Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * pageSize, totalRestaurants)}
              </span>{' '}
              of <span className="font-medium">{totalRestaurants}</span> results
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                if (pageNumber > totalPages) return null
                
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNumber}
                  </Button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
