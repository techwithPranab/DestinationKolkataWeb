"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Hotel, 
  UtensilsCrossed, 
  MapPin, 
  Calendar, 
  Trophy, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Eye,
  Star,
  Activity,
  DollarSign
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { fetchAuthenticatedAPI } from '@/lib/backend-api'

interface StatsCard {
  title: string
  value: string
  change: string
  changeType: 'increase' | 'decrease'
  icon: string
  color: string
}

interface RecentActivity {
  id: string
  type: 'hotel' | 'restaurant' | 'attraction' | 'event' | 'user'
  title: string
  description: string
  timestamp: string
  status: 'success' | 'warning' | 'info'
}

interface TopPerformer {
  id: string
  name: string
  category: string
  rating: number
  views: number
  bookings: number
}

export default function AdminDashboard() {
  const [statsCards, setStatsCards] = useState<StatsCard[]>([])
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetchAuthenticatedAPI('/api/admin/dashboard')
      const data = await response.json()

      if (data.success) {
        setStatsCards(data.data.statsCards)
        setRecentActivities(data.data.recentActivities)
        setTopPerformers(data.data.topPerformers)
      } else {
        setError('Failed to fetch dashboard data')
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'hotel':
        return <Hotel className="h-4 w-4" />
      case 'restaurant':
        return <UtensilsCrossed className="h-4 w-4" />
      case 'attraction':
        return <MapPin className="h-4 w-4" />
      case 'event':
        return <Calendar className="h-4 w-4" />
      case 'user':
        return <Users className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: RecentActivity['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'info':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Hotel':
        return Hotel
      case 'UtensilsCrossed':
        return UtensilsCrossed
      case 'MapPin':
        return MapPin
      case 'Calendar':
        return Calendar
      case 'Trophy':
        return Trophy
      case 'Users':
        return Users
      case 'Eye':
        return Eye
      case 'DollarSign':
        return DollarSign
      default:
        return Activity
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Here&apos;s what&apos;s happening with Destination Kolkata today.
          </p>
        </div>

        {/* Loading skeleton for stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }, (_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Recent Activities</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }, (_, index) => (
                  <div key={index} className="flex items-start space-x-3 animate-pulse">
                    <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5" />
                <span>Top Performers</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }, (_, index) => (
                  <div key={index} className="flex items-center justify-between animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-12"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Here&apos;s what&apos;s happening with Destination Kolkata today.
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchDashboardData}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here&apos;s what&apos;s happening with Destination Kolkata today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      {stat.changeType === 'increase' ? (
                        <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${
                        stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">from last month</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    {React.createElement(getIconComponent(stat.icon), { className: "h-6 w-6 text-white" })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Recent Activities</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4">
                View All Activities
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5" />
              <span>Top Performers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((performer, index) => (
                <div key={performer.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-orange-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{performer.name}</p>
                      <p className="text-xs text-gray-500">{performer.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">
                        {typeof performer.rating === 'number' && !isNaN(performer.rating) 
                          ? performer.rating.toFixed(1) 
                          : 'N/A'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {typeof performer.views === 'number' && !isNaN(performer.views) 
                        ? performer.views.toLocaleString() 
                        : '0'} views
                    </p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4">
                View Detailed Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <Button className="flex flex-col items-center p-4 h-auto bg-blue-50 text-blue-700 hover:bg-blue-100">
              <Hotel className="h-6 w-6 mb-2" />
              <span className="text-sm">Add Hotel</span>
            </Button>
            <Button className="flex flex-col items-center p-4 h-auto bg-green-50 text-green-700 hover:bg-green-100">
              <UtensilsCrossed className="h-6 w-6 mb-2" />
              <span className="text-sm">Add Restaurant</span>
            </Button>
            <Button className="flex flex-col items-center p-4 h-auto bg-purple-50 text-purple-700 hover:bg-purple-100">
              <MapPin className="h-6 w-6 mb-2" />
              <span className="text-sm">Add Attraction</span>
            </Button>
            <Button className="flex flex-col items-center p-4 h-auto bg-orange-50 text-orange-700 hover:bg-orange-100">
              <Calendar className="h-6 w-6 mb-2" />
              <span className="text-sm">Add Event</span>
            </Button>
            <Button className="flex flex-col items-center p-4 h-auto bg-red-50 text-red-700 hover:bg-red-100">
              <Trophy className="h-6 w-6 mb-2" />
              <span className="text-sm">Add Sports</span>
            </Button>
            <Button className="flex flex-col items-center p-4 h-auto bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
              <Users className="h-6 w-6 mb-2" />
              <span className="text-sm">Manage Users</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
