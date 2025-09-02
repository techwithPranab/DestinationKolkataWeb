import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Hotel, Restaurant, Attraction, Event, Sports, User } from '@/models'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Get current date and date from last month for comparison
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

    // Check if events exist, if not create sample events
    const eventCount = await Event.countDocuments()
    if (eventCount === 0) {
      const sampleEvents = [
        {
          name: 'Durga Puja 2024',
          description: 'The grand festival of Durga Puja in Kolkata featuring magnificent pandals and cultural celebrations.',
          category: 'Cultural',
          location: {
            type: 'Point',
            coordinates: [88.3639, 22.5726]
          },
          address: {
            street: 'Kumartuli',
            area: 'North Kolkata',
            city: 'Kolkata',
            state: 'West Bengal',
            pincode: '700001'
          },
          startDate: new Date('2024-10-01'),
          endDate: new Date('2024-10-05'),
          startTime: '06:00',
          endTime: '22:00',
          ticketPrice: {
            min: 0,
            max: 0,
            currency: 'INR',
            isFree: true
          },
          organizer: {
            name: 'Kolkata Durga Puja Committee',
            contact: '+91-9876543210',
            email: 'info@durgapuja2024.com'
          },
          venue: {
            name: 'Various Pandal Locations',
            capacity: 10000,
            type: 'Outdoor'
          },
          status: 'active',
          featured: true,
          rating: {
            average: 4.8,
            count: 1250
          },
          tags: ['Festival', 'Cultural', 'Religious'],
          images: [{
            url: '/images/durga-puja-2024.jpg',
            alt: 'Durga Puja celebrations in Kolkata',
            isPrimary: true
          }]
        },
        {
          name: 'Kolkata Book Fair 2024',
          description: 'Asia\'s largest book fair showcasing books from publishers across India and the world.',
          category: 'Cultural',
          location: {
            type: 'Point',
            coordinates: [88.3639, 22.5726]
          },
          address: {
            street: 'Milan Mela',
            area: 'Salt Lake',
            city: 'Kolkata',
            state: 'West Bengal',
            pincode: '700091'
          },
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-01-28'),
          startTime: '11:00',
          endTime: '20:00',
          ticketPrice: {
            min: 50,
            max: 100,
            currency: 'INR',
            isFree: false
          },
          organizer: {
            name: 'Publishers & Booksellers Guild',
            contact: '+91-9876543211',
            email: 'info@kolkatabookfair.com'
          },
          venue: {
            name: 'Milan Mela Complex',
            capacity: 5000,
            type: 'Indoor'
          },
          status: 'active',
          featured: true,
          rating: {
            average: 4.6,
            count: 890
          },
          tags: ['Books', 'Cultural', 'Education'],
          images: [{
            url: '/images/book-fair-2024.jpg',
            alt: 'Kolkata Book Fair',
            isPrimary: true
          }]
        },
        {
          name: 'Kolkata International Film Festival',
          description: 'Showcasing international and Indian cinema with screenings, workshops, and celebrity appearances.',
          category: 'Cultural',
          location: {
            type: 'Point',
            coordinates: [88.3639, 22.5726]
          },
          address: {
            street: 'Nandan Complex',
            area: 'Central Kolkata',
            city: 'Kolkata',
            state: 'West Bengal',
            pincode: '700013'
          },
          startDate: new Date('2024-11-20'),
          endDate: new Date('2024-11-27'),
          startTime: '10:00',
          endTime: '22:00',
          ticketPrice: {
            min: 200,
            max: 500,
            currency: 'INR',
            isFree: false
          },
          organizer: {
            name: 'Kolkata Film Festival Committee',
            contact: '+91-9876543212',
            email: 'info@kifffest.com',
            website: 'https://kifffest.com'
          },
          venue: {
            name: 'Nandan Complex',
            capacity: 2000,
            type: 'Indoor'
          },
          status: 'active',
          featured: true,
          rating: {
            average: 4.7,
            count: 650
          },
          tags: ['Film', 'Cultural', 'Entertainment'],
          images: [{
            url: '/images/film-festival-2024.jpg',
            alt: 'Kolkata International Film Festival',
            isPrimary: true
          }]
        }
      ]

      try {
        await Event.insertMany(sampleEvents)
        console.log('Sample events created successfully')
      } catch (error) {
        console.error('Error creating sample events:', error)
      }
    }

    // Parallel queries for better performance
    const [
      totalHotels,
      totalRestaurants,
      totalAttractions,
      totalEvents,
      totalSports,
      totalUsers,
      monthlyViews,
      totalRevenue,
      // Previous month counts for comparison
      lastMonthHotels,
      lastMonthRestaurants,
      lastMonthAttractions,
      lastMonthEvents,
      lastMonthSports,
      lastMonthUsers,
      lastMonthViews,
      // Recent activities
      recentHotels,
      recentRestaurants,
      recentAttractions,
      recentEvents,
      recentUsers,
      // Top performers
      topAttractions,
      topHotels,
      topRestaurants,
      topEvents
    ] = await Promise.all([
      // Current totals
      Hotel.countDocuments({ status: 'active' }),
      Restaurant.countDocuments({ status: 'active' }),
      Attraction.countDocuments({ status: 'active' }),
      Event.countDocuments({
        status: 'active',
        endDate: { $gte: now }
      }),
      Sports.countDocuments({ status: 'active' }),
      User.countDocuments(),
      Hotel.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: null, totalViews: { $sum: '$views' } } }
      ]),
      // Mock revenue calculation - in real app this would come from bookings/payments
      Promise.resolve(2400000), // ₹2.4L

      // Last month counts
      Hotel.countDocuments({
        status: 'active',
        createdAt: { $lt: lastMonth }
      }),
      Restaurant.countDocuments({
        status: 'active',
        createdAt: { $lt: lastMonth }
      }),
      Attraction.countDocuments({
        status: 'active',
        createdAt: { $lt: lastMonth }
      }),
      Event.countDocuments({
        status: 'active',
        endDate: { $gte: lastMonth },
        createdAt: { $lt: lastMonth }
      }),
      Sports.countDocuments({
        status: 'active',
        createdAt: { $lt: lastMonth }
      }),
      User.countDocuments({
        createdAt: { $lt: lastMonth }
      }),
      Hotel.aggregate([
        { $match: {
          status: 'active',
          createdAt: { $lt: lastMonth }
        }},
        { $group: { _id: null, totalViews: { $sum: '$views' } } }
      ]),

      // Recent activities (last 7 days)
      Hotel.find({ status: 'active' })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('name createdAt'),
      Restaurant.find({ status: 'active' })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('name createdAt'),
      Attraction.find({ status: 'active' })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('name createdAt'),
      Event.find({ status: 'active' })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('name createdAt'),
      User.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .select('name createdAt'),

      // Top performers
      Attraction.find({ status: 'active' })
        .sort({ 'rating.average': -1, views: -1 })
        .limit(5)
        .select('name category rating views'),
      Hotel.find({ status: 'active' })
        .sort({ 'rating.average': -1, views: -1 })
        .limit(5)
        .select('name category rating views'),
      Restaurant.find({ status: 'active' })
        .sort({ 'rating.average': -1, views: -1 })
        .limit(5)
        .select('name category rating views'),
      Event.find({ status: 'active' })
        .sort({ 'rating.average': -1, views: -1 })
        .limit(5)
        .select('name category rating views')
    ])

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous * 100).toFixed(1)
    }

    // Process monthly views
    const currentViews = monthlyViews.length > 0 ? monthlyViews[0].totalViews : 0
    const previousViews = lastMonthViews.length > 0 ? lastMonthViews[0].totalViews : 0

    // Combine recent activities from all entities
    const recentActivities = [
      ...recentHotels.map(h => ({
        id: `hotel-${h._id}`,
        type: 'hotel' as const,
        title: 'New Hotel Added',
        description: `${h.name} has been added to the listings`,
        timestamp: h.createdAt.toISOString(),
        status: 'success' as const
      })),
      ...recentRestaurants.map(r => ({
        id: `restaurant-${r._id}`,
        type: 'restaurant' as const,
        title: 'New Restaurant Added',
        description: `${r.name} has been added to the listings`,
        timestamp: r.createdAt.toISOString(),
        status: 'success' as const
      })),
      ...recentAttractions.map(a => ({
        id: `attraction-${a._id}`,
        type: 'attraction' as const,
        title: 'New Attraction Added',
        description: `${a.name} has been added to the listings`,
        timestamp: a.createdAt.toISOString(),
        status: 'success' as const
      })),
      ...recentEvents.map(e => ({
        id: `event-${e._id}`,
        type: 'event' as const,
        title: 'New Event Added',
        description: `${e.name} has been added to the listings`,
        timestamp: e.createdAt.toISOString(),
        status: 'success' as const
      })),
      ...recentUsers.map(u => ({
        id: `user-${u._id}`,
        type: 'user' as const,
        title: 'New User Registration',
        description: `${u.name} registered on the platform`,
        timestamp: u.createdAt.toISOString(),
        status: 'success' as const
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5)

    // Combine top performers from all categories
    const topPerformers = [
      ...topAttractions.map(a => ({
        id: a._id.toString(),
        name: a.name,
        category: 'Attraction',
        rating: a.rating?.average || 0,
        views: a.views || 0,
        bookings: Math.floor((a.views || 0) * 0.1) // Mock booking calculation
      })),
      ...topHotels.map(h => ({
        id: h._id.toString(),
        name: h.name,
        category: 'Hotel',
        rating: h.rating?.average || 0,
        views: h.views || 0,
        bookings: Math.floor((h.views || 0) * 0.15) // Mock booking calculation
      })),
      ...topRestaurants.map(r => ({
        id: r._id.toString(),
        name: r.name,
        category: 'Restaurant',
        rating: r.rating?.average || 0,
        views: r.views || 0,
        bookings: Math.floor((r.views || 0) * 0.2) // Mock booking calculation
      })),
      ...topEvents.map(e => ({
        id: e._id.toString(),
        name: e.name,
        category: 'Event',
        rating: e.rating?.average || 0,
        views: e.views || 0,
        bookings: Math.floor((e.views || 0) * 0.25) // Mock booking calculation
      }))
    ].sort((a, b) => b.rating - a.rating).slice(0, 5)

    // Format numbers for display
    const formatNumber = (num: number) => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
      return num.toString()
    }

    const statsCards = [
      {
        title: 'Total Hotels',
        value: totalHotels.toString(),
        change: `+${calculateChange(totalHotels, lastMonthHotels)}%`,
        changeType: totalHotels >= lastMonthHotels ? 'increase' as const : 'decrease' as const,
        icon: 'Hotel',
        color: 'bg-blue-500'
      },
      {
        title: 'Total Restaurants',
        value: totalRestaurants.toString(),
        change: `+${calculateChange(totalRestaurants, lastMonthRestaurants)}%`,
        changeType: totalRestaurants >= lastMonthRestaurants ? 'increase' as const : 'decrease' as const,
        icon: 'UtensilsCrossed',
        color: 'bg-green-500'
      },
      {
        title: 'Total Attractions',
        value: totalAttractions.toString(),
        change: `+${calculateChange(totalAttractions, lastMonthAttractions)}%`,
        changeType: totalAttractions >= lastMonthAttractions ? 'increase' as const : 'decrease' as const,
        icon: 'MapPin',
        color: 'bg-purple-500'
      },
      {
        title: 'Active Events',
        value: totalEvents.toString(),
        change: `+${calculateChange(totalEvents, lastMonthEvents)}%`,
        changeType: totalEvents >= lastMonthEvents ? 'increase' as const : 'decrease' as const,
        icon: 'Calendar',
        color: 'bg-orange-500'
      },
      {
        title: 'Sports Facilities',
        value: totalSports.toString(),
        change: `+${calculateChange(totalSports, lastMonthSports)}%`,
        changeType: totalSports >= lastMonthSports ? 'increase' as const : 'decrease' as const,
        icon: 'Trophy',
        color: 'bg-red-500'
      },
      {
        title: 'Total Users',
        value: formatNumber(totalUsers),
        change: `+${calculateChange(totalUsers, lastMonthUsers)}%`,
        changeType: totalUsers >= lastMonthUsers ? 'increase' as const : 'decrease' as const,
        icon: 'Users',
        color: 'bg-indigo-500'
      },
      {
        title: 'Monthly Views',
        value: formatNumber(currentViews),
        change: `+${calculateChange(currentViews, previousViews)}%`,
        changeType: currentViews >= previousViews ? 'increase' as const : 'decrease' as const,
        icon: 'Eye',
        color: 'bg-teal-500'
      },
      {
        title: 'Revenue',
        value: `₹${formatNumber(totalRevenue)}`,
        change: '+32.1%',
        changeType: 'increase' as const,
        icon: 'DollarSign',
        color: 'bg-yellow-500'
      }
    ]

    return NextResponse.json({
      success: true,
      data: {
        statsCards,
        recentActivities,
        topPerformers
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    )
  }
}
