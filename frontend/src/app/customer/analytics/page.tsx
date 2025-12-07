"use client"

import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, BarChart3, PieChart, Calendar, Star, Heart, MapPin, Target, Award } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useApi } from '@/lib/api-client'

// Simple Progress component
const Progress: React.FC<{ value: number; className?: string }> = ({ value, className = '' }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div
      className="bg-orange-600 h-2 rounded-full transition-all duration-300"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    ></div>
  </div>
)

interface AnalyticsData {
  overview: {
    totalReviews: number
    averageRating: number
    totalFavorites: number
    totalBookings: number
    engagementScore: number
  }
  trends: {
    reviewsThisMonth: number
    reviewsLastMonth: number
    favoritesThisMonth: number
    favoritesLastMonth: number
    bookingsThisMonth: number
    bookingsLastMonth: number
  }
  categories: Array<{
    name: string
    value: number
    color: string
  }>
  locations: Array<{
    name: string
    count: number
    percentage: number
  }>
  timePatterns: {
    hourlyActivity: number[]
    weeklyActivity: number[]
    monthlyActivity: number[]
  }
  achievements: Array<{
    id: string
    title: string
    description: string
    progress: number
    target: number
    completed: boolean
  }>
}

export default function AnalyticsDashboard() {
  const api = useApi()
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    overview: {
      totalReviews: 0,
      averageRating: 0,
      totalFavorites: 0,
      totalBookings: 0,
      engagementScore: 0
    },
    trends: {
      reviewsThisMonth: 0,
      reviewsLastMonth: 0,
      favoritesThisMonth: 0,
      favoritesLastMonth: 0,
      bookingsThisMonth: 0,
      bookingsLastMonth: 0
    },
    categories: [],
    locations: [],
    timePatterns: {
      hourlyActivity: [],
      weeklyActivity: [],
      monthlyActivity: []
    },
    achievements: []
  })

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/customer/analytics?timeRange=${timeRange}`)
      if (response.data) {
        setAnalytics((response.data as { analytics?: AnalyticsData }).analytics || analytics)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  // Sample data for demonstration
  const sampleData: AnalyticsData = {
    overview: {
      totalReviews: 47,
      averageRating: 4.3,
      totalFavorites: 128,
      totalBookings: 23,
      engagementScore: 85
    },
    trends: {
      reviewsThisMonth: 8,
      reviewsLastMonth: 5,
      favoritesThisMonth: 15,
      favoritesLastMonth: 12,
      bookingsThisMonth: 4,
      bookingsLastMonth: 6
    },
    categories: [
      { name: 'Restaurants', value: 35, color: '#f59e0b' },
      { name: 'Hotels', value: 28, color: '#3b82f6' },
      { name: 'Events', value: 20, color: '#10b981' },
      { name: 'Sports', value: 12, color: '#8b5cf6' },
      { name: 'Attractions', value: 5, color: '#f43f5e' }
    ],
    locations: [
      { name: 'Salt Lake', count: 32, percentage: 25 },
      { name: 'Park Street', count: 28, percentage: 22 },
      { name: 'New Market', count: 24, percentage: 19 },
      { name: 'Howrah', count: 20, percentage: 16 },
      { name: 'Ballygunge', count: 16, percentage: 12 },
      { name: 'Others', count: 8, percentage: 6 }
    ],
    timePatterns: {
      hourlyActivity: [2, 1, 0, 0, 1, 3, 8, 12, 15, 18, 22, 25, 28, 24, 20, 18, 22, 26, 24, 18, 12, 8, 5, 3],
      weeklyActivity: [15, 22, 18, 25, 28, 35, 20],
      monthlyActivity: [45, 52, 38, 62, 55, 48, 58, 42, 38, 45, 52, 47]
    },
    achievements: [
      {
        id: '1',
        title: 'Review Master',
        description: 'Leave 50 reviews',
        progress: 47,
        target: 50,
        completed: false
      },
      {
        id: '2',
        title: 'Explorer',
        description: 'Add 100 favorites',
        progress: 128,
        target: 100,
        completed: true
      },
      {
        id: '3',
        title: 'Frequent Traveler',
        description: 'Make 25 bookings',
        progress: 23,
        target: 25,
        completed: false
      },
      {
        id: '4',
        title: 'Social Butterfly',
        description: 'Get 100 helpful votes on reviews',
        progress: 76,
        target: 100,
        completed: false
      }
    ]
  }

  // Use sample data if no real data is available
  const displayData = analytics.overview.totalReviews > 0 ? analytics : sampleData

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-green-600" />
    if (current < previous) return <TrendingDown className="w-4 h-4 text-red-600" />
    return <div className="w-4 h-4" />
  }

  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return 'text-green-600'
    if (current < previous) return 'text-red-600'
    return 'text-gray-600'
  }

  const getTrendPercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Insights into your travel and dining preferences</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 3 months</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{displayData.overview.totalReviews}</p>
                <div className="flex items-center mt-2">
                  {getTrendIcon(displayData.trends.reviewsThisMonth, displayData.trends.reviewsLastMonth)}
                  <span className={`text-sm ml-1 ${getTrendColor(displayData.trends.reviewsThisMonth, displayData.trends.reviewsLastMonth)}`}>
                    {getTrendPercentage(displayData.trends.reviewsThisMonth, displayData.trends.reviewsLastMonth)}%
                  </span>
                </div>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{displayData.overview.averageRating}</p>
                <div className="flex items-center mt-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((starNum) => (
                      <Star
                        key={`rating-star-${starNum}`}
                        className={`w-3 h-3 ${
                          starNum <= Math.floor(displayData.overview.averageRating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <Award className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Favorites</p>
                <p className="text-2xl font-bold text-gray-900">{displayData.overview.totalFavorites}</p>
                <div className="flex items-center mt-2">
                  {getTrendIcon(displayData.trends.favoritesThisMonth, displayData.trends.favoritesLastMonth)}
                  <span className={`text-sm ml-1 ${getTrendColor(displayData.trends.favoritesThisMonth, displayData.trends.favoritesLastMonth)}`}>
                    {getTrendPercentage(displayData.trends.favoritesThisMonth, displayData.trends.favoritesLastMonth)}%
                  </span>
                </div>
              </div>
              <Heart className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{displayData.overview.totalBookings}</p>
                <div className="flex items-center mt-2">
                  {getTrendIcon(displayData.trends.bookingsThisMonth, displayData.trends.bookingsLastMonth)}
                  <span className={`text-sm ml-1 ${getTrendColor(displayData.trends.bookingsThisMonth, displayData.trends.bookingsLastMonth)}`}>
                    {getTrendPercentage(displayData.trends.bookingsThisMonth, displayData.trends.bookingsLastMonth)}%
                  </span>
                </div>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Engagement Score</p>
                <p className="text-2xl font-bold text-gray-900">{displayData.overview.engagementScore}</p>
                <Progress value={displayData.overview.engagementScore} className="mt-2 h-2" />
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Category Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayData.categories.map((category) => (
                <div key={`category-${category.name}`} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${(category.value / displayData.categories.reduce((sum, c) => sum + c.value, 0)) * 100}%`,
                          backgroundColor: category.color
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">{category.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Location Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Popular Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {displayData.locations.map((location) => (
                <div key={`location-${location.name}`} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{location.name}</span>
                      <span className="text-sm text-gray-600">{location.count} visits</span>
                    </div>
                    <Progress value={location.percentage} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Activity Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-3">Hourly Activity (24h)</h4>
              <div className="flex items-end space-x-1 h-20">
                {displayData.timePatterns.hourlyActivity.map((value, index) => (
                  <div
                    key={`hour-${index}`}
                    className="flex-1 bg-orange-200 rounded-t"
                    style={{ height: `${(value / Math.max(...displayData.timePatterns.hourlyActivity)) * 100}%` }}
                    title={`${index}:00 - ${value} activities`}
                  ></div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>00</span>
                <span>06</span>
                <span>12</span>
                <span>18</span>
                <span>23</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Weekly Activity</h4>
              <div className="flex items-end space-x-2 h-16">
                {displayData.timePatterns.weeklyActivity.map((value, index) => {
                  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                  return (
                    <div key={`day-${days[index]}`} className="flex flex-col items-center flex-1">
                      <div
                        className="w-full bg-blue-200 rounded-t mb-1"
                        style={{ height: `${(value / Math.max(...displayData.timePatterns.weeklyActivity)) * 100}%` }}
                        title={`${days[index]} - ${value} activities`}
                      ></div>
                      <span className="text-xs text-gray-600">{days[index]}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayData.achievements.map((achievement) => (
              <div key={achievement.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{achievement.title}</h4>
                  {achievement.completed && (
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{achievement.progress}/{achievement.target}</span>
                  </div>
                  <Progress 
                    value={(achievement.progress / achievement.target) * 100} 
                    className="h-2"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
