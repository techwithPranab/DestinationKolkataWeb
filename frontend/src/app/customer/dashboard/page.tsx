"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { 
  Plus, 
  Hotel, 
  UtensilsCrossed, 
  Calendar, 
  Megaphone, 
  Trophy,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Users,
  CreditCard,
  Crown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useApi } from '@/lib/api-client'

interface UserStats {
  totalSubmissions: number
  approvedSubmissions: number
  pendingSubmissions: number
  rejectedSubmissions: number
  totalViews: number
  membershipType: 'free' | 'premium' | 'business'
  membershipExpiry?: string
}

interface Submission {
  id: string
  type: 'hotel' | 'restaurant' | 'event' | 'promotion' | 'sports'
  title: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  views?: number
  adminNotes?: string
}

export default function CustomerDashboard() {
  const { user } = useAuth()
  const { data: session } = useSession()
  const api = useApi()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  // Get user info from either AuthContext (form login) or NextAuth session (OAuth)
  const displayName = user?.firstName || session?.user?.name?.split(' ')[0] || 'User'

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsResult, submissionsResult] = await Promise.all([
        api.get<UserStats>('/api/customer/stats'),
        api.get<{ submissions: Submission[] }>('/api/customer/submissions')
      ])

      if (statsResult.error) {
        console.error('Stats API Error:', statsResult.error)
      } else {
        setStats(statsResult.data as UserStats)
      }

      if (submissionsResult.error) {
        console.error('Submissions API Error:', submissionsResult.error)
      } else {
        const submissionsData = submissionsResult.data as { submissions?: Submission[] } | undefined
        setSubmissions(submissionsData?.submissions || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hotel':
        return <Hotel className="w-5 h-5" />
      case 'restaurant':
        return <UtensilsCrossed className="w-5 h-5" />
      case 'event':
        return <Calendar className="w-5 h-5" />
      case 'promotion':
        return <Megaphone className="w-5 h-5" />
      case 'sports':
        return <Trophy className="w-5 h-5" />
      default:
        return <Plus className="w-5 h-5" />
    }
  }

  const getMembershipBadge = (type: string) => {
    switch (type) {
      case 'premium':
        return <Badge className="bg-blue-100 text-blue-800"><Star className="w-3 h-3 mr-1" />Premium</Badge>
      case 'business':
        return <Badge className="bg-purple-100 text-purple-800"><Crown className="w-3 h-3 mr-1" />Business</Badge>
      default:
        return <Badge variant="outline">Free</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {displayName}!
              </h1>
              <p className="text-gray-600 mt-1">Manage your listings and track performance</p>
            </div>
            <div className="flex items-center space-x-4">
              {stats && getMembershipBadge(stats.membershipType)}
              <Button 
                className="bg-orange-600 hover:bg-orange-700 text-white"
                onClick={() => window.location.href = '/customer/membership'}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Upgrade Membership
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Approved</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.approvedSubmissions}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Clock className="w-8 h-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.pendingSubmissions}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <XCircle className="w-8 h-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Rejected</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.rejectedSubmissions}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Views</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center space-y-2"
              onClick={() => window.location.href = '/customer/create/hotel'}
            >
              <Hotel className="w-8 h-8 text-orange-600" />
              <span>Add Hotel</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center space-y-2"
              onClick={() => window.location.href = '/customer/create/restaurant'}
            >
              <UtensilsCrossed className="w-8 h-8 text-orange-600" />
              <span>Add Restaurant</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center space-y-2"
              onClick={() => window.location.href = '/customer/create/event'}
            >
              <Calendar className="w-8 h-8 text-orange-600" />
              <span>Add Event</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center space-y-2"
              onClick={() => window.location.href = '/customer/create/promotion'}
            >
              <Megaphone className="w-8 h-8 text-orange-600" />
              <span>Add Promotion</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center space-y-2"
              onClick={() => window.location.href = '/customer/create/sports'}
            >
              <Trophy className="w-8 h-8 text-orange-600" />
              <span>Add Sports</span>
            </Button>
          </div>
        </div>

        {/* Recent Submissions */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Submissions</h2>
            <Button variant="outline" onClick={() => window.location.href = '/customer/submissions'}>
              View All
            </Button>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {submissions.length === 0 ? (
              <div className="text-center py-12">
                <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
                <p className="text-gray-600 mb-4">Start by creating your first listing</p>
                <Button 
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={() => window.location.href = '/customer/create/hotel'}
                >
                  Create First Listing
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {submissions.slice(0, 5).map((submission) => (
                  <div key={submission.id} className="p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getTypeIcon(submission.type)}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{submission.title}</h3>
                        <p className="text-sm text-gray-500">
                          {submission.type.charAt(0).toUpperCase() + submission.type.slice(1)} • 
                          {new Date(submission.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {submission.views && (
                        <div className="text-sm text-gray-500">
                          {submission.views} views
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(submission.status)}
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {submission.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
