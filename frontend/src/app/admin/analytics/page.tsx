"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Users,
  Eye,
  Calendar,
  MapPin,
  UtensilsCrossed,
  Hotel,
  Trophy,
  DollarSign,
  PieChart,
  LineChart,
  Download,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { fetchAuthenticatedAPI } from '@/lib/backend-api'

interface AnalyticsData {
  overview: {
    totalUsers: number
    totalViews: number
    totalRevenue: number
    totalBookings: number
    userGrowth: number
    viewGrowth: number
    revenueGrowth: number
    bookingGrowth: number
  }
  entityStats: {
    hotels: {
      count: number
      views: number
      bookings: number
      revenue: number
      averageRating: number
    }
    restaurants: {
      count: number
      views: number
      bookings: number
      revenue: number
      averageRating: number
    }
    attractions: {
      count: number
      views: number
      bookings: number
      revenue: number
      averageRating: number
    }
    events: {
      count: number
      views: number
      bookings: number
      revenue: number
      averageRating: number
    }
    sports: {
      count: number
      views: number
      bookings: number
      revenue: number
      averageRating: number
    }
  }
  userAnalytics: {
    newUsers: number[]
    activeUsers: number[]
    userRetention: number
    userEngagement: number
  }
  revenueAnalytics: {
    monthlyRevenue: number[]
    revenueByCategory: { [key: string]: number }
    topRevenueSources: Array<{
      name: string
      revenue: number
      percentage: number
    }>
  }
  trafficAnalytics: {
    pageViews: number[]
    uniqueVisitors: number[]
    bounceRate: number
    sessionDuration: number
    topPages: Array<{
      page: string
      views: number
      percentage: number
    }>
  }
  reviewAnalytics: {
    totalReviews: number
    averageRating: number
    reviewDistribution: { [key: number]: number }
    topRatedEntities: Array<{
      name: string
      rating: number
      reviewCount: number
      category: string
    }>
  }
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [activeTab, setActiveTab] = useState('entities')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange, selectedCategory])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetchAuthenticatedAPI(`/api/admin/analytics?timeRange=${timeRange}&category=${selectedCategory}`)
      const data = await response.json()
      setAnalyticsData(data.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatCurrency = (num: number) => {
    return `₹${formatNumber(num)}`
  }

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600'
    if (growth < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return '↗️'
    if (growth < 0) return '↘️'
    return '➡️'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
        <p className="text-gray-600">Unable to load analytics data at this time.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-white">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Comprehensive insights into your platform performance</p>
        </div>
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className='bg-white'>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className='bg-white'>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="hotels">Hotels</SelectItem>
              <SelectItem value="restaurants">Restaurants</SelectItem>
              <SelectItem value="attractions">Attractions</SelectItem>
              <SelectItem value="events">Events</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(analyticsData.overview.totalUsers)}</div>
              <p className={`text-xs flex items-center ${getGrowthColor(analyticsData.overview.userGrowth)}`}>
                {getGrowthIcon(analyticsData.overview.userGrowth)}
                {Math.abs(analyticsData.overview.userGrowth)}% from last period
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(analyticsData.overview.totalViews)}</div>
              <p className={`text-xs flex items-center ${getGrowthColor(analyticsData.overview.viewGrowth)}`}>
                {getGrowthIcon(analyticsData.overview.viewGrowth)}
                {Math.abs(analyticsData.overview.viewGrowth)}% from last period
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analyticsData.overview.totalRevenue)}</div>
              <p className={`text-xs flex items-center ${getGrowthColor(analyticsData.overview.revenueGrowth)}`}>
                {getGrowthIcon(analyticsData.overview.revenueGrowth)}
                {Math.abs(analyticsData.overview.revenueGrowth)}% from last period
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(analyticsData.overview.totalBookings)}</div>
              <p className={`text-xs flex items-center ${getGrowthColor(analyticsData.overview.bookingGrowth)}`}>
                {getGrowthIcon(analyticsData.overview.bookingGrowth)}
                {Math.abs(analyticsData.overview.bookingGrowth)}% from last period
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6">
        <Button
          variant={activeTab === 'entities' ? 'default' : 'outline'}
          onClick={() => setActiveTab('entities')}
          className="flex-1"
        >
          Entities
        </Button>
        <Button
          variant={activeTab === 'users' ? 'default' : 'outline'}
          onClick={() => setActiveTab('users')}
          className="flex-1"
        >
          Users
        </Button>
        <Button
          variant={activeTab === 'revenue' ? 'default' : 'outline'}
          onClick={() => setActiveTab('revenue')}
          className="flex-1"
        >
          Revenue
        </Button>
        <Button
          variant={activeTab === 'traffic' ? 'default' : 'outline'}
          onClick={() => setActiveTab('traffic')}
          className="flex-1"
        >
          Traffic
        </Button>
        <Button
          variant={activeTab === 'reviews' ? 'default' : 'outline'}
          onClick={() => setActiveTab('reviews')}
          className="flex-1"
        >
          Reviews
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'entities' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Hotels */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Hotel className="h-5 w-5 mr-2 text-blue-600" />
                  Hotels
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Count:</span>
                  <span className="font-medium">{analyticsData.entityStats.hotels.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Views:</span>
                  <span className="font-medium">{formatNumber(analyticsData.entityStats.hotels.views)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bookings:</span>
                  <span className="font-medium">{analyticsData.entityStats.hotels.bookings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Revenue:</span>
                  <span className="font-medium">{formatCurrency(analyticsData.entityStats.hotels.revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Rating:</span>
                  <Badge variant="outline">{analyticsData.entityStats.hotels.averageRating.toFixed(1)} ⭐</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Restaurants */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UtensilsCrossed className="h-5 w-5 mr-2 text-green-600" />
                  Restaurants
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Count:</span>
                  <span className="font-medium">{analyticsData.entityStats.restaurants.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Views:</span>
                  <span className="font-medium">{formatNumber(analyticsData.entityStats.restaurants.views)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bookings:</span>
                  <span className="font-medium">{analyticsData.entityStats.restaurants.bookings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Revenue:</span>
                  <span className="font-medium">{formatCurrency(analyticsData.entityStats.restaurants.revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Rating:</span>
                  <Badge variant="outline">{analyticsData.entityStats.restaurants.averageRating.toFixed(1)} ⭐</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Attractions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-purple-600" />
                  Attractions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Count:</span>
                  <span className="font-medium">{analyticsData.entityStats.attractions.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Views:</span>
                  <span className="font-medium">{formatNumber(analyticsData.entityStats.attractions.views)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bookings:</span>
                  <span className="font-medium">{analyticsData.entityStats.attractions.bookings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Revenue:</span>
                  <span className="font-medium">{formatCurrency(analyticsData.entityStats.attractions.revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Rating:</span>
                  <Badge variant="outline">{analyticsData.entityStats.attractions.averageRating.toFixed(1)} ⭐</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-orange-600" />
                  Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Count:</span>
                  <span className="font-medium">{analyticsData.entityStats.events.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Views:</span>
                  <span className="font-medium">{formatNumber(analyticsData.entityStats.events.views)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bookings:</span>
                  <span className="font-medium">{analyticsData.entityStats.events.bookings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Revenue:</span>
                  <span className="font-medium">{formatCurrency(analyticsData.entityStats.events.revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Rating:</span>
                  <Badge variant="outline">{analyticsData.entityStats.events.averageRating.toFixed(1)} ⭐</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Sports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-red-600" />
                  Sports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Count:</span>
                  <span className="font-medium">{analyticsData.entityStats.sports.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Views:</span>
                  <span className="font-medium">{formatNumber(analyticsData.entityStats.sports.views)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bookings:</span>
                  <span className="font-medium">{analyticsData.entityStats.sports.bookings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Revenue:</span>
                  <span className="font-medium">{formatCurrency(analyticsData.entityStats.sports.revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Rating:</span>
                  <Badge variant="outline">{analyticsData.entityStats.sports.averageRating.toFixed(1)} ⭐</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <LineChart className="h-8 w-8 mr-2" />
                  Chart visualization would go here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Retention Rate:</span>
                  <span className="font-medium">{analyticsData.userAnalytics.userRetention}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Engagement Score:</span>
                  <span className="font-medium">{analyticsData.userAnalytics.userEngagement}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Users:</span>
                  <span className="font-medium">{formatNumber(analyticsData.userAnalytics.activeUsers.reduce((a, b) => a + b, 0))}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <PieChart className="h-8 w-8 mr-2" />
                  Pie chart visualization would go here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Revenue Sources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analyticsData.revenueAnalytics.topRevenueSources.map((source, index) => (
                  <div key={`revenue-${source.name}-${index}`} className="flex justify-between items-center">
                    <span className="text-sm">{source.name}</span>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(source.revenue)}</div>
                      <div className="text-xs text-gray-500">{source.percentage}%</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'traffic' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bounce Rate:</span>
                  <span className="font-medium">{analyticsData.trafficAnalytics.bounceRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Session Duration:</span>
                  <span className="font-medium">{Math.round(analyticsData.trafficAnalytics.sessionDuration)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Unique Visitors:</span>
                  <span className="font-medium">{formatNumber(analyticsData.trafficAnalytics.uniqueVisitors.reduce((a, b) => a + b, 0))}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analyticsData.trafficAnalytics.topPages.map((page, index) => (
                  <div key={`page-${page.page}-${index}`} className="flex justify-between items-center">
                    <span className="text-sm truncate flex-1 mr-2">{page.page}</span>
                    <div className="text-right">
                      <div className="font-medium">{formatNumber(page.views)}</div>
                      <div className="text-xs text-gray-500">{page.percentage}%</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Reviews:</span>
                  <span className="font-medium">{formatNumber(analyticsData.reviewAnalytics.totalReviews)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Average Rating:</span>
                  <Badge variant="outline">{analyticsData.reviewAnalytics.averageRating.toFixed(1)} ⭐</Badge>
                </div>
                <div className="space-y-2">
                  <span className="text-sm text-gray-600">Rating Distribution:</span>
                  {[5, 4, 3, 2, 1].map(rating => (
                    <div key={`rating-${rating}`} className="flex items-center justify-between text-sm">
                      <span>{rating} ⭐</span>
                      <div className="flex-1 mx-2 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{
                            width: `${(analyticsData.reviewAnalytics.reviewDistribution[rating] || 0) / analyticsData.reviewAnalytics.totalReviews * 100}%`
                          }}
                        ></div>
                      </div>
                      <span>{analyticsData.reviewAnalytics.reviewDistribution[rating] || 0}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Rated Entities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analyticsData.reviewAnalytics.topRatedEntities.map((entity, index) => (
                  <div key={`entity-${entity.name}-${index}`} className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{entity.name}</div>
                      <div className="text-xs text-gray-500">{entity.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{entity.rating.toFixed(1)} ⭐</div>
                      <div className="text-xs text-gray-500">{entity.reviewCount} reviews</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
