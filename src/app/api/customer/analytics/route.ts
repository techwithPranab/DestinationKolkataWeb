import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { getAuthenticatedUser } from '@/lib/auth-helper'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req)

    if (user.role !== 'customer') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const timeRange = searchParams.get('timeRange') || '30d'

    const { db } = await connectToDatabase()
    const userId = ObjectId.createFromHexString(user.userId)

    // Calculate date ranges
    const now = new Date()
    let startDate: Date
    let compareStartDate: Date

    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        compareStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        compareStartDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        compareStartDate = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000)
        break
      default: // 30d and fallback
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        compareStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    }

    // Get overview stats
    const [
      totalReviews,
      totalFavorites,
      averageRatingResult,
      reviewsThisPeriod,
      reviewsPreviousPeriod,
      favoritesThisPeriod,
      favoritesPreviousPeriod
    ] = await Promise.all([
      db.collection('reviews').countDocuments({ 'customer.userId': userId }),
      db.collection('favorites').countDocuments({ userId: userId }),
      db.collection('reviews').aggregate([
        { $match: { 'customer.userId': userId } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]).toArray(),
      db.collection('reviews').countDocuments({
        'customer.userId': userId,
        createdAt: { $gte: startDate }
      }),
      db.collection('reviews').countDocuments({
        'customer.userId': userId,
        createdAt: { $gte: compareStartDate, $lt: startDate }
      }),
      db.collection('favorites').countDocuments({
        userId: userId,
        createdAt: { $gte: startDate }
      }),
      db.collection('favorites').countDocuments({
        userId: userId,
        createdAt: { $gte: compareStartDate, $lt: startDate }
      })
    ])

    // Get category breakdown
    const categoryBreakdown = await db.collection('reviews').aggregate([
      { $match: { 'customer.userId': userId } },
      { $group: { _id: '$itemType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray()

    const categories = categoryBreakdown.map((cat, index) => ({
      name: cat._id || 'Unknown',
      value: cat.count,
      color: ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#f43f5e'][index % 5]
    }))

    // Get location breakdown
    const locationBreakdown = await db.collection('reviews').aggregate([
      { $match: { 'customer.userId': userId } },
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]).toArray()

    const totalLocations = locationBreakdown.reduce((sum, loc) => sum + loc.count, 0)
    const locations = locationBreakdown.map(loc => ({
      name: loc._id || 'Unknown',
      count: loc.count,
      percentage: totalLocations > 0 ? Math.round((loc.count / totalLocations) * 100) : 0
    }))

    // Calculate engagement score (0-100)
    const engagementScore = Math.min(100, Math.round(
      (totalReviews * 2) + 
      (totalFavorites * 1) + 
      (reviewsThisPeriod * 5)
    ))

    const averageRating = averageRatingResult.length > 0 ? 
      Math.round(averageRatingResult[0].avgRating * 10) / 10 : 0

    // Sample achievements
    const achievements = [
      {
        id: '1',
        title: 'Review Master',
        description: 'Leave 50 reviews',
        progress: totalReviews,
        target: 50,
        completed: totalReviews >= 50
      },
      {
        id: '2',
        title: 'Explorer',
        description: 'Add 100 favorites',
        progress: totalFavorites,
        target: 100,
        completed: totalFavorites >= 100
      },
      {
        id: '3',
        title: 'Frequent Traveler',
        description: 'Make 25 bookings',
        progress: 0, // Bookings not implemented yet
        target: 25,
        completed: false
      },
      {
        id: '4',
        title: 'Social Butterfly',
        description: 'Get 100 helpful votes on reviews',
        progress: 0, // Helpful votes not tracked yet
        target: 100,
        completed: false
      }
    ]

    const analytics = {
      overview: {
        totalReviews,
        averageRating,
        totalFavorites,
        totalBookings: 0, // Not implemented yet
        engagementScore
      },
      trends: {
        reviewsThisMonth: reviewsThisPeriod,
        reviewsLastMonth: reviewsPreviousPeriod,
        favoritesThisMonth: favoritesThisPeriod,
        favoritesLastMonth: favoritesPreviousPeriod,
        bookingsThisMonth: 0,
        bookingsLastMonth: 0
      },
      categories,
      locations,
      timePatterns: {
        hourlyActivity: Array(24).fill(0).map(() => Math.floor(Math.random() * 30)), // Sample data
        weeklyActivity: Array(7).fill(0).map(() => Math.floor(Math.random() * 40)), // Sample data
        monthlyActivity: Array(12).fill(0).map(() => Math.floor(Math.random() * 60)) // Sample data
      },
      achievements
    }

    return NextResponse.json({
      analytics
    })

  } catch (error) {
    console.error('Get analytics API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
