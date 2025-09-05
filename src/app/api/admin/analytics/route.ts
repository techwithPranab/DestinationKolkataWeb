import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Hotel, Restaurant, Attraction, Event, Sports, User, Review } from '@/models'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30d'

    // Calculate date range based on timeRange
    const now = new Date()
    let startDate: Date

    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Parallel queries for better performance
    const [
      totalUsers,
      totalViews,
      totalRevenue,
      totalBookings,
      hotelStats,
      restaurantStats,
      attractionStats,
      eventStats,
      sportsStats,
      reviewStats,
      reviewDistribution,
      topRatedEntities
    ] = await Promise.all([
      User.countDocuments(),
      Promise.resolve(150000), // Mock total views
      Promise.resolve(2400000), // Mock total revenue
      Promise.resolve(850), // Mock total bookings
      getEntityStats(Hotel),
      getEntityStats(Restaurant),
      getEntityStats(Attraction),
      getEntityStats(Event),
      getEntityStats(Sports),
      getReviewStats(),
      getReviewDistribution(startDate),
      getTopRatedEntities(startDate)
    ])

    // Calculate growth rates (comparing with previous period)
    const previousPeriodStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()))
    const [
      previousUsers,
      previousViews,
      previousRevenue,
      previousBookings
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: previousPeriodStart, $lt: startDate } }),
      Promise.resolve(120000), // Mock previous views
      Promise.resolve(1800000), // Mock previous revenue
      Promise.resolve(650) // Mock previous bookings
    ])

    const userGrowth = calculateGrowth(totalUsers, previousUsers)
    const viewGrowth = calculateGrowth(totalViews, previousViews)
    const revenueGrowth = calculateGrowth(totalRevenue, previousRevenue)
    const bookingGrowth = calculateGrowth(totalBookings, previousBookings)

    // Generate mock time series data
    const timeSeriesData = generateTimeSeriesData(startDate, now, timeRange)

    const analyticsData = {
      overview: {
        totalUsers,
        totalViews,
        totalRevenue,
        totalBookings,
        userGrowth,
        viewGrowth,
        revenueGrowth,
        bookingGrowth
      },
      entityStats: {
        hotels: hotelStats,
        restaurants: restaurantStats,
        attractions: attractionStats,
        events: eventStats,
        sports: sportsStats
      },
      userAnalytics: {
        newUsers: timeSeriesData.newUsers,
        activeUsers: timeSeriesData.activeUsers,
        userRetention: 78.5,
        userEngagement: 85
      },
      revenueAnalytics: {
        monthlyRevenue: timeSeriesData.revenue,
        revenueByCategory: {
          'Hotels': 1200000,
          'Restaurants': 650000,
          'Events': 350000,
          'Attractions': 150000,
          'Sports': 50000
        },
        topRevenueSources: [
          { name: 'Hotel Bookings', revenue: 1200000, percentage: 50 },
          { name: 'Restaurant Reservations', revenue: 650000, percentage: 27 },
          { name: 'Event Tickets', revenue: 350000, percentage: 15 },
          { name: 'Attraction Tickets', revenue: 150000, percentage: 6 },
          { name: 'Sports Facilities', revenue: 50000, percentage: 2 }
        ]
      },
      trafficAnalytics: {
        pageViews: timeSeriesData.pageViews,
        uniqueVisitors: timeSeriesData.uniqueVisitors,
        bounceRate: 42.3,
        sessionDuration: 185,
        topPages: [
          { page: '/hotels', views: 25000, percentage: 25 },
          { page: '/restaurants', views: 18000, percentage: 18 },
          { page: '/attractions', views: 15000, percentage: 15 },
          { page: '/events', views: 12000, percentage: 12 },
          { page: '/sports', views: 8000, percentage: 8 }
        ]
      },
      reviewAnalytics: {
        totalReviews: reviewStats.total,
        averageRating: reviewStats.average,
        reviewDistribution,
        topRatedEntities
      }
    }

    return NextResponse.json({
      success: true,
      data: analyticsData
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}

// Helper functions
async function getEntityStats(Model: typeof Hotel) {
  const [count, views, bookings, revenue, avgRating] = await Promise.all([
    Model.countDocuments({ status: 'active' }),
    Model.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]),
    Promise.resolve(Math.floor(Math.random() * 100) + 10), // Mock bookings
    Promise.resolve(Math.floor(Math.random() * 50000) + 10000), // Mock revenue
    Model.aggregate([
      { $match: { status: 'active', 'rating.average': { $exists: true } } },
      { $group: { _id: null, avgRating: { $avg: '$rating.average' } } }
    ])
  ])

  return {
    count,
    views: views.length > 0 ? views[0].totalViews : 0,
    bookings,
    revenue,
    averageRating: avgRating.length > 0 ? avgRating[0].avgRating : 4.2
  }
}

async function getReviewStats() {
  const [total, average] = await Promise.all([
    Review.countDocuments(),
    Review.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ])
  ])

  return {
    total,
    average: average.length > 0 ? average[0].avgRating : 4.3
  }
}

async function getReviewDistribution(startDate: Date) {
  const distribution = await Review.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    { $group: { _id: '$rating', count: { $sum: 1 } } }
  ])

  const result: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  distribution.forEach(item => {
    result[item._id] = item.count
  })

  return result
}

async function getTopRatedEntities(startDate: Date) {
  const entities = await Promise.all([
    Hotel.find({ status: 'active' }).sort({ 'rating.average': -1 }).limit(2).select('name rating'),
    Restaurant.find({ status: 'active' }).sort({ 'rating.average': -1 }).limit(2).select('name rating'),
    Attraction.find({ status: 'active' }).sort({ 'rating.average': -1 }).limit(2).select('name rating'),
    Event.find({ status: 'active' }).sort({ 'rating.average': -1 }).limit(2).select('name rating'),
    Sports.find({ status: 'active' }).sort({ 'rating.average': -1 }).limit(2).select('name rating')
  ])

  const topEntities = [
    ...entities[0].map(h => ({ name: h.name, rating: h.rating?.average || 0, reviewCount: h.rating?.count || 0, category: 'Hotel' })),
    ...entities[1].map(r => ({ name: r.name, rating: r.rating?.average || 0, reviewCount: r.rating?.count || 0, category: 'Restaurant' })),
    ...entities[2].map(a => ({ name: a.name, rating: a.rating?.average || 0, reviewCount: a.rating?.count || 0, category: 'Attraction' })),
    ...entities[3].map(e => ({ name: e.name, rating: e.rating?.average || 0, reviewCount: e.rating?.count || 0, category: 'Event' })),
    ...entities[4].map(s => ({ name: s.name, rating: s.rating?.average || 0, reviewCount: s.rating?.count || 0, category: 'Sports' }))
  ].sort((a, b) => b.rating - a.rating).slice(0, 5)

  return topEntities
}

function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100 * 10) / 10
}

function generateTimeSeriesData(startDate: Date, endDate: Date, timeRange: string) {
  let dataPoints: number
  if (timeRange === '7d') {
    dataPoints = 7
  } else if (timeRange === '30d') {
    dataPoints = 30
  } else if (timeRange === '90d') {
    dataPoints = 90
  } else {
    dataPoints = 365
  }

  return {
    newUsers: Array.from({ length: dataPoints }, () => Math.floor(Math.random() * 50) + 10),
    activeUsers: Array.from({ length: dataPoints }, () => Math.floor(Math.random() * 200) + 100),
    revenue: Array.from({ length: dataPoints }, () => Math.floor(Math.random() * 10000) + 5000),
    pageViews: Array.from({ length: dataPoints }, () => Math.floor(Math.random() * 1000) + 500),
    uniqueVisitors: Array.from({ length: dataPoints }, () => Math.floor(Math.random() * 500) + 200)
  }
}
