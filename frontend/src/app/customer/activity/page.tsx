"use client"

import React, { useState, useEffect } from 'react'
import { Calendar, Heart, MessageSquare, Star, User, Plus, Clock, MapPin, Tag, Bell, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useApi } from '@/lib/api-client'

interface ActivityItem {
  id: string
  type: 'review' | 'favorite' | 'booking' | 'listing' | 'profile' | 'message' | 'system'
  action: string
  title: string
  description: string
  timestamp: string
  metadata?: {
    itemId?: string
    itemType?: string
    rating?: number
    location?: string
    category?: string
    status?: string
    priority?: string
  }
}

interface ActivityStats {
  totalActivities: number
  reviewsCount: number
  favoritesCount: number
  bookingsCount: number
  listingsCount: number
}

export default function ActivityFeedPage() {
  const api = useApi()
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [stats, setStats] = useState<ActivityStats>({
    totalActivities: 0,
    reviewsCount: 0,
    favoritesCount: 0,
    bookingsCount: 0,
    listingsCount: 0
  })
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [timeFilter, setTimeFilter] = useState('all')

  useEffect(() => {
    fetchActivityFeed()
    fetchActivityStats()
  }, [])

  const fetchActivityFeed = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/customer/activity-feed')
      if (response.data) {
        setActivities((response.data as { activities?: ActivityItem[] }).activities || [])
      }
    } catch (error) {
      console.error('Error fetching activity feed:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchActivityStats = async () => {
    try {
      const response = await api.get('/api/customer/activity-stats')
      if (response.data) {
        setStats((response.data as { stats?: ActivityStats }).stats || stats)
      }
    } catch (error) {
      console.error('Error fetching activity stats:', error)
    }
  }

  // Sample data for demonstration
  const sampleActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'review',
      action: 'created',
      title: 'Reviewed Park Hotel',
      description: 'You left a 5-star review for Park Hotel in Kolkata',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      metadata: {
        rating: 5,
        location: 'Kolkata',
        category: 'Hotel'
      }
    },
    {
      id: '2',
      type: 'favorite',
      action: 'added',
      title: 'Added to Favorites',
      description: 'You added Flurys Restaurant to your favorites',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      metadata: {
        location: 'Park Street',
        category: 'Restaurant'
      }
    },
    {
      id: '3',
      type: 'booking',
      action: 'confirmed',
      title: 'Booking Confirmed',
      description: 'Your reservation at Oh! Calcutta has been confirmed',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      metadata: {
        status: 'confirmed',
        location: 'Salt Lake',
        category: 'Restaurant'
      }
    },
    {
      id: '4',
      type: 'listing',
      action: 'created',
      title: 'Created New Listing',
      description: 'You created a new event listing: "Kolkata Book Fair 2025"',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      metadata: {
        category: 'Event',
        location: 'Maidan'
      }
    },
    {
      id: '5',
      type: 'profile',
      action: 'updated',
      title: 'Profile Updated',
      description: 'You updated your profile information and preferences',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    },
    {
      id: '6',
      type: 'message',
      action: 'received',
      title: 'New Message',
      description: 'You received a response from customer support',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
      metadata: {
        priority: 'medium'
      }
    },
    {
      id: '7',
      type: 'system',
      action: 'notification',
      title: 'Welcome!',
      description: 'Welcome to Destination Kolkata! Complete your profile to get better recommendations.',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    }
  ]

  // Use sample data if no real data is available
  const displayActivities = activities.length > 0 ? activities : sampleActivities

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'review':
        return Star
      case 'favorite':
        return Heart
      case 'booking':
        return Calendar
      case 'listing':
        return Plus
      case 'profile':
        return User
      case 'message':
        return MessageSquare
      case 'system':
        return Bell
      default:
        return Clock
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'review':
        return 'text-yellow-600 bg-yellow-100'
      case 'favorite':
        return 'text-red-600 bg-red-100'
      case 'booking':
        return 'text-blue-600 bg-blue-100'
      case 'listing':
        return 'text-green-600 bg-green-100'
      case 'profile':
        return 'text-purple-600 bg-purple-100'
      case 'message':
        return 'text-indigo-600 bg-indigo-100'
      case 'system':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`
    return time.toLocaleDateString()
  }

  const filteredActivities = displayActivities.filter(activity => {
    if (selectedFilter !== 'all' && activity.type !== selectedFilter) {
      return false
    }

    if (timeFilter === 'today') {
      const today = new Date()
      const activityDate = new Date(activity.timestamp)
      return activityDate.toDateString() === today.toDateString()
    }

    if (timeFilter === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return new Date(activity.timestamp) > weekAgo
    }

    if (timeFilter === 'month') {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      return new Date(activity.timestamp) > monthAgo
    }

    return true
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Activity Feed</h1>
        <p className="text-gray-600 mt-1">Track your recent activities and engagement</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Activities</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalActivities}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reviews</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.reviewsCount}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Favorites</p>
                <p className="text-2xl font-bold text-red-600">{stats.favoritesCount}</p>
              </div>
              <Heart className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bookings</p>
                <p className="text-2xl font-bold text-blue-600">{stats.bookingsCount}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Listings</p>
                <p className="text-2xl font-bold text-green-600">{stats.listingsCount}</p>
              </div>
              <Plus className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedFilter} onValueChange={setSelectedFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activities</SelectItem>
            <SelectItem value="review">Reviews</SelectItem>
            <SelectItem value="favorite">Favorites</SelectItem>
            <SelectItem value="booking">Bookings</SelectItem>
            <SelectItem value="listing">Listings</SelectItem>
            <SelectItem value="profile">Profile</SelectItem>
            <SelectItem value="message">Messages</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>

        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredActivities.map((activity) => {
              const IconComponent = getActivityIcon(activity.type)
              const colorClasses = getActivityColor(activity.type)
              
              return (
                <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colorClasses}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {getTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.description}
                    </p>
                    
                    {activity.metadata && (
                      <div className="flex items-center gap-2 mt-2">
                        {activity.metadata.rating && (
                          <Badge variant="outline" className="text-yellow-600">
                            <Star className="w-3 h-3 mr-1" />
                            {activity.metadata.rating}
                          </Badge>
                        )}
                        {activity.metadata.location && (
                          <Badge variant="outline" className="text-gray-600">
                            <MapPin className="w-3 h-3 mr-1" />
                            {activity.metadata.location}
                          </Badge>
                        )}
                        {activity.metadata.category && (
                          <Badge variant="outline" className="text-blue-600">
                            <Tag className="w-3 h-3 mr-1" />
                            {activity.metadata.category}
                          </Badge>
                        )}
                        {activity.metadata.status && (
                          <Badge 
                            variant="outline" 
                            className={activity.metadata.status === 'confirmed' ? 'text-green-600' : 'text-gray-600'}
                          >
                            {activity.metadata.status}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {filteredActivities.length === 0 && (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
              <p className="text-gray-600">Try adjusting your filters or start engaging with the platform</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
