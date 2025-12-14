import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../lib/mongodb';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

interface RecentActivity {
  id: string;
  type: 'hotel' | 'restaurant' | 'attraction' | 'event' | 'user';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info';
}

interface TopPerformer {
  id: string;
  name: string;
  category: string;
  rating: number;
  views: number;
  bookings: number;
}

// POST /api/admin/auth/login - Admin login
router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const { db } = await connectToDatabase();

    // Find admin user
    const user = await db.collection('users').findOne({
      email,
      role: { $in: ['admin', 'super_admin'] }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Admin account is inactive. Please contact system administrator.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Generate JWT token
    const tokenExpiry = rememberMe ? '30d' : '7d';
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        name: `${user.firstName} ${user.lastName}`
      },
      process.env.JWT_SECRET!,
      { expiresIn: tokenExpiry }
    );

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profile: user.profile || {}
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/admin/auth/logout - Admin logout
router.post('/auth/logout', (req: Request, res: Response) => {
  // For stateless JWT, logout is handled on the client side
  res.status(200).json({
    success: true,
    message: 'Admin logout successful'
  });
});

// GET /api/admin/auth/verify - Verify admin token
router.get('/auth/verify', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '') || req.cookies['auth-token'];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    const { db } = await connectToDatabase();

    // Find user and verify they are admin
    const user = await db.collection('users').findOne({
      _id: new ObjectId(decoded.userId),
      role: { $in: ['admin', 'super_admin'] },
      status: 'active'
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin token'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profile: user.profile || {}
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// GET /api/admin/dashboard - Get admin dashboard data
router.get('/dashboard', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();

    // Get counts for different collections
    const [
      hotelsCount,
      restaurantsCount,
      attractionsCount,
      eventsCount,
      sportsCount,
      usersCount,
      reviewsCount
    ] = await Promise.all([
      db.collection('hotels').countDocuments(),
      db.collection('restaurants').countDocuments(),
      db.collection('attractions').countDocuments(),
      db.collection('events').countDocuments(),
      db.collection('sports').countDocuments(),
      db.collection('users').countDocuments(),
      db.collection('reviews').countDocuments()
    ]);

    // Calculate percentage changes (simplified - in real app you'd compare with previous period)
    const statsCards = [
      {
        title: 'Total Hotels',
        value: hotelsCount.toString(),
        change: '+12%',
        changeType: 'increase' as const,
        icon: 'Hotel',
        color: 'blue'
      },
      {
        title: 'Total Restaurants',
        value: restaurantsCount.toString(),
        change: '+8%',
        changeType: 'increase' as const,
        icon: 'UtensilsCrossed',
        color: 'green'
      },
      {
        title: 'Total Attractions',
        value: attractionsCount.toString(),
        change: '+15%',
        changeType: 'increase' as const,
        icon: 'MapPin',
        color: 'purple'
      },
      {
        title: 'Total Events',
        value: eventsCount.toString(),
        change: '+5%',
        changeType: 'increase' as const,
        icon: 'Calendar',
        color: 'orange'
      },
      {
        title: 'Total Sports',
        value: sportsCount.toString(),
        change: '+10%',
        changeType: 'increase' as const,
        icon: 'Trophy',
        color: 'red'
      },
      {
        title: 'Total Users',
        value: usersCount.toString(),
        change: '+20%',
        changeType: 'increase' as const,
        icon: 'Users',
        color: 'indigo'
      },
      {
        title: 'Total Reviews',
        value: reviewsCount.toString(),
        change: '+25%',
        changeType: 'increase' as const,
        icon: 'Eye',
        color: 'yellow'
      },
      {
        title: 'Revenue',
        value: '₹45,231',
        change: '+18%',
        changeType: 'increase' as const,
        icon: 'DollarSign',
        color: 'emerald'
      }
    ];

    // Get recent activities (last 10 items from various collections)
    const recentActivities: RecentActivity[] = [];

    // Get recent hotels
    const recentHotels = await db.collection('hotels')
      .find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();

    recentHotels.forEach(hotel => {
      recentActivities.push({
        id: hotel._id.toString(),
        type: 'hotel' as const,
        title: hotel.name,
        description: `New hotel added: ${hotel.name}`,
        timestamp: hotel.createdAt || new Date().toISOString(),
        status: 'success' as const
      });
    });

    // Get recent restaurants
    const recentRestaurants = await db.collection('restaurants')
      .find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();

    recentRestaurants.forEach(restaurant => {
      recentActivities.push({
        id: restaurant._id.toString(),
        type: 'restaurant' as const,
        title: restaurant.name,
        description: `New restaurant added: ${restaurant.name}`,
        timestamp: restaurant.createdAt || new Date().toISOString(),
        status: 'success' as const
      });
    });

    // Get recent users
    const recentUsers = await db.collection('users')
      .find({})
      .sort({ createdAt: -1 })
      .limit(2)
      .toArray();

    recentUsers.forEach(user => {
      recentActivities.push({
        id: user._id.toString(),
        type: 'user' as const,
        title: `${user.firstName} ${user.lastName}`,
        description: `New user registered: ${user.email}`,
        timestamp: user.createdAt || new Date().toISOString(),
        status: 'info' as const
      });
    });

    // Sort activities by timestamp (most recent first)
    recentActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Get top performers (highest rated items)
    const topPerformers: TopPerformer[] = [];

    // Get top hotels
    const topHotels = await db.collection('hotels')
      .find({ rating: { $exists: true } })
      .sort({ rating: -1 })
      .limit(2)
      .toArray();

    topHotels.forEach(hotel => {
      topPerformers.push({
        id: hotel._id.toString(),
        name: hotel.name,
        category: 'Hotel',
        rating: hotel.rating || 0,
        views: hotel.views || 0,
        bookings: hotel.bookings || 0
      });
    });

    // Get top restaurants
    const topRestaurants = await db.collection('restaurants')
      .find({ rating: { $exists: true } })
      .sort({ rating: -1 })
      .limit(2)
      .toArray();

    topRestaurants.forEach(restaurant => {
      topPerformers.push({
        id: restaurant._id.toString(),
        name: restaurant.name,
        category: 'Restaurant',
        rating: restaurant.rating || 0,
        views: restaurant.views || 0,
        bookings: restaurant.bookings || 0
      });
    });

    // Sort top performers by rating
    topPerformers.sort((a, b) => b.rating - a.rating);

    res.status(200).json({
      success: true,
      data: {
        statsCards,
        recentActivities: recentActivities.slice(0, 10), // Limit to 10 most recent
        topPerformers: topPerformers.slice(0, 6) // Limit to 6 top performers
      }
    });

  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

// GET /api/admin/events - Get all events for admin management
router.get('/events', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};

    // Add filters
    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }

    if (req.query.status && req.query.status !== 'all') {
      // For events, we might want to filter by active/upcoming status
      const now = new Date();
      if (req.query.status === 'upcoming') {
        query.startDate = { $gte: now };
      } else if (req.query.status === 'past') {
        query.endDate = { $lt: now };
      }
    }

    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const events = await db.collection('events')
      .find(query)
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection('events').countDocuments(query);

    res.status(200).json({
      success: true,
      events,
      total,
      page,
      pages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Error fetching admin events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events'
    });
  }
});

// DELETE /api/admin/events/:id - Delete an event
router.delete('/events/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }

    const result = await db.collection('events').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event'
    });
  }
});

// GET /api/admin/analytics - Get analytics data
router.get('/analytics', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const { timeRange = '30d', category = 'all' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Build analytics data
    const analyticsData = {
      entityAnalytics: {
        hotels: {
          count: 0,
          views: 0,
          bookings: 0,
          revenue: 0,
          averageRating: 0
        },
        restaurants: {
          count: 0,
          views: 0,
          bookings: 0,
          revenue: 0,
          averageRating: 0
        },
        attractions: {
          count: 0,
          views: 0,
          bookings: 0,
          revenue: 0,
          averageRating: 0
        },
        events: {
          count: 0,
          views: 0,
          bookings: 0,
          revenue: 0,
          averageRating: 0
        },
        sports: {
          count: 0,
          views: 0,
          bookings: 0,
          revenue: 0,
          averageRating: 0
        }
      },
      userAnalytics: {
        newUsers: [],
        activeUsers: [],
        userRetention: 0,
        userEngagement: 0
      },
      revenueAnalytics: {
        monthlyRevenue: [],
        revenueByCategory: {},
        topRevenueSources: []
      },
      trafficAnalytics: {
        pageViews: [],
        uniqueVisitors: [],
        bounceRate: 0,
        sessionDuration: 0,
        topPages: []
      },
      reviewAnalytics: {
        totalReviews: 0,
        averageRating: 0,
        reviewDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        topRatedEntities: []
      }
    };

    // Get entity counts and basic stats
    const collections = ['hotels', 'restaurants', 'attractions', 'events', 'sports'];
    
    for (const collectionName of collections) {
      try {
        const count = await db.collection(collectionName).countDocuments();
        const avgRating = await db.collection(collectionName).aggregate([
          { $group: { _id: null, avgRating: { $avg: '$rating' } } }
        ]).toArray();

        analyticsData.entityAnalytics[collectionName as keyof typeof analyticsData.entityAnalytics] = {
          count,
          views: Math.floor(Math.random() * 10000) + 1000, // Mock data for now
          bookings: Math.floor(Math.random() * 1000) + 100, // Mock data for now
          revenue: Math.floor(Math.random() * 50000) + 5000, // Mock data for now
          averageRating: avgRating[0]?.avgRating || 0
        };
      } catch (error) {
        console.error(`Error fetching ${collectionName} analytics:`, error);
      }
    }

    // Get review analytics
    try {
      const reviews = await db.collection('reviews').find({}).toArray();
      analyticsData.reviewAnalytics.totalReviews = reviews.length;
      
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
        analyticsData.reviewAnalytics.averageRating = totalRating / reviews.length;
        
        // Review distribution
        reviews.forEach(review => {
          const rating = Math.floor(review.rating || 0);
          if (rating >= 1 && rating <= 5) {
            analyticsData.reviewAnalytics.reviewDistribution[rating as keyof typeof analyticsData.reviewAnalytics.reviewDistribution]++;
          }
        });
      }
    } catch (error) {
      console.error('Error fetching review analytics:', error);
    }

    res.status(200).json({
      success: true,
      data: analyticsData
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data'
    });
  }
});

// PATCH /api/admin/reviews - Update review status
router.patch('/reviews', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const { reviewId, status } = req.body;

    if (!reviewId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Review ID and status are required'
      });
    }

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved, rejected, or pending'
      });
    }

    if (!ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID'
      });
    }

    const result = await db.collection('reviews').updateOne(
      { _id: new ObjectId(reviewId) },
      { 
        $set: { 
          status,
          reviewedAt: new Date(),
          reviewedBy: 'admin' // In a real app, this would be the admin's ID
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Review status updated successfully'
    });

  } catch (error) {
    console.error('Error updating review status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review status'
    });
  }
});

// POST /api/admin/data-ingestion - Run data ingestion process
router.post('/data-ingestion', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { mode } = req.body;

    if (!mode || !['ingest-and-load', 'load-existing'].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mode. Must be either "ingest-and-load" or "load-existing"'
      });
    }

    // For now, return a mock response since the actual data ingestion
    // would be a long-running process that should be handled asynchronously
    const result = {
      success: true,
      message: `Data ingestion started with mode: ${mode}`,
      mode,
      status: 'processing',
      estimatedDuration: '5-10 minutes',
      progress: {
        current: 0,
        total: 100,
        message: 'Initializing data ingestion process...'
      }
    };

    // In a real implementation, you would:
    // 1. Start a background job/worker
    // 2. Execute the data-manager script with the appropriate mode
    // 3. Return a job ID for tracking progress
    // 4. Provide real-time progress updates

    res.status(200).json(result);

  } catch (error) {
    console.error('Error starting data ingestion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start data ingestion process'
    });
  }
});

// POST /api/admin/subscriptions - Create a new subscription
router.post('/subscriptions', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const { userId, planType, status, startDate, endDate, amount, currency, paymentMethod, autoRenew, features } = req.body;

    if (!userId || !planType || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'User ID, plan type, start date, and end date are required'
      });
    }

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Check if user exists
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const subscriptionData = {
      userId: new ObjectId(userId),
      planType,
      status: status || 'active',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      amount: amount || 0,
      currency: currency || 'INR',
      paymentMethod: paymentMethod || 'card',
      autoRenew: autoRenew !== undefined ? autoRenew : true,
      features: features || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('subscriptions').insertOne(subscriptionData);

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      subscription: {
        _id: result.insertedId,
        ...subscriptionData,
        userId: { _id: userId, name: user.name || user.firstName + ' ' + user.lastName, email: user.email }
      }
    });

  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription'
    });
  }
});

// PUT /api/admin/subscriptions/:id - Update a subscription
router.put('/subscriptions/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const { id } = req.params;
    const { userId, planType, status, startDate, endDate, amount, currency, paymentMethod, autoRenew, features } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription ID'
      });
    }

    const updateData: Record<string, any> = {
      updatedAt: new Date()
    };

    if (userId) {
      if (!ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
      }
      updateData.userId = new ObjectId(userId);
    }

    if (planType) updateData.planType = planType;
    if (status) updateData.status = status;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (amount !== undefined) updateData.amount = amount;
    if (currency) updateData.currency = currency;
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (autoRenew !== undefined) updateData.autoRenew = autoRenew;
    if (features) updateData.features = features;

    const result = await db.collection('subscriptions').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subscription updated successfully'
    });

  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subscription'
    });
  }
});

// GET /api/admin/subscriptions - Get all subscriptions for admin management
router.get('/subscriptions', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};

    // Add filters
    if (req.query.plan && req.query.plan !== 'all') {
      query.plan = req.query.plan;
    }

    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    if (req.query.search) {
      query.$or = [
        { 'user.firstName': { $regex: req.query.search, $options: 'i' } },
        { 'user.lastName': { $regex: req.query.search, $options: 'i' } },
        { 'user.email': { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const subscriptions = await db.collection('subscriptions')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection('subscriptions').countDocuments(query);

    res.status(200).json({
      success: true,
      subscriptions,
      total,
      page,
      pages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Error fetching admin subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriptions'
    });
  }
});

// DELETE /api/admin/subscriptions/:id - Delete a subscription
router.delete('/subscriptions/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription ID'
      });
    }

    const result = await db.collection('subscriptions').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subscription deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete subscription'
    });
  }
});

// PATCH /api/admin/subscriptions/:id - Update subscription status
router.patch('/subscriptions/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const { id } = req.params;
    const { status } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription ID'
      });
    }

    if (!status || !['active', 'inactive', 'cancelled', 'expired'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active, inactive, cancelled, or expired'
      });
    }

    const result = await db.collection('subscriptions').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status,
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subscription status updated successfully'
    });

  } catch (error) {
    console.error('Error updating subscription status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subscription status'
    });
  }
});

// POST /api/admin/users - Create a new user
router.post('/users', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const { firstName, lastName, email, phone, role, status, profile } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, and email are required'
      });
    }

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const userData = {
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email,
      phone: phone || '',
      role: role || 'user',
      status: status || 'active',
      profile: profile || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('users').insertOne(userData);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        _id: result.insertedId,
        ...userData
      }
    });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
});

// PUT /api/admin/users/:id - Update a user
router.put('/users/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const { id } = req.params;
    const { firstName, lastName, email, phone, role, status, profile } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const updateData: Record<string, any> = {
      updatedAt: new Date()
    };

    if (firstName) updateData.firstName = firstName;
    if (lastName) {
      updateData.lastName = lastName;
      updateData.name = `${firstName || 'Unknown'} ${lastName}`;
    }
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (profile) updateData.profile = profile;

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// GET /api/admin/users - Get all users for admin management
router.get('/users', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};

    // Add filters
    if (req.query.role && req.query.role !== 'all') {
      query.role = req.query.role;
    }

    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    if (req.query.search) {
      query.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { name: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await db.collection('users')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection('users').countDocuments(query);

    res.status(200).json({
      success: true,
      users,
      total,
      page,
      pages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// DELETE /api/admin/users/:id - Delete a user
router.delete('/users/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const result = await db.collection('users').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// PATCH /api/admin/feedback - Update feedback status and details
router.patch('/feedback', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const { id, status, priority, notes, reviewedBy } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Feedback ID is required'
      });
    }

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback ID'
      });
    }

    const updateData: Record<string, any> = {
      updatedAt: new Date()
    };

    if (status) {
      if (!['pending', 'in-progress', 'resolved', 'closed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be pending, in-progress, resolved, or closed'
        });
      }
      updateData.status = status;
    }

    if (priority) {
      if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid priority. Must be low, medium, high, or urgent'
        });
      }
      updateData.priority = priority;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (reviewedBy) {
      updateData.reviewedBy = reviewedBy;
      updateData.reviewedAt = new Date();
    }

    const result = await db.collection('feedback').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback updated successfully'
    });

  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update feedback'
    });
  }
});

// PATCH /api/admin/contact - Update contact inquiry status and details
router.patch('/contact', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const { id, status, priority, response, notes, resolvedBy } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Contact ID is required'
      });
    }

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contact ID'
      });
    }

    const updateData: Record<string, any> = {
      updatedAt: new Date()
    };

    if (status) {
      if (!['pending', 'in-progress', 'resolved', 'closed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be pending, in-progress, resolved, or closed'
        });
      }
      updateData.status = status;
    }

    if (priority) {
      if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid priority. Must be low, medium, high, or urgent'
        });
      }
      updateData.priority = priority;
    }

    if (response !== undefined) {
      updateData.response = response;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (resolvedBy) {
      updateData.resolvedBy = resolvedBy;
      updateData.resolvedAt = new Date();
    }

    const result = await db.collection('contacts').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contact inquiry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact inquiry updated successfully'
    });

  } catch (error) {
    console.error('Error updating contact inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact inquiry'
    });
  }
});

// GET /api/admin/settings - Get application settings
router.get('/settings', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();

    // Get settings from database, or return default settings
    const settingsDoc = await db.collection('settings').findOne({ type: 'application' });

    const defaultSettings = {
      site: {
        name: 'Destination Kolkata',
        description: 'Discover the best of Kolkata',
        url: 'https://destinationkolkata.com',
        email: 'info@destinationkolkata.com',
        phone: '+91-1234567890'
      },
      features: {
        reviews: true,
        bookings: true,
        subscriptions: false,
        notifications: true
      },
      limits: {
        maxReviewsPerUser: 5,
        maxBookingsPerDay: 10,
        maxImagesPerListing: 10
      },
      maintenance: {
        enabled: false,
        message: 'Site is under maintenance. Please check back later.'
      }
    };

    const settings = settingsDoc ? settingsDoc.settings : defaultSettings;

    res.status(200).json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings'
    });
  }
});

// PUT /api/admin/settings - Update application settings
router.put('/settings', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const newSettings = req.body;

    if (!newSettings) {
      return res.status(400).json({
        success: false,
        message: 'Settings data is required'
      });
    }

    // Update or insert settings
    await db.collection('settings').updateOne(
      { type: 'application' },
      { 
        $set: { 
          settings: newSettings,
          updatedAt: new Date(),
          updatedBy: 'admin' // In a real app, this would be the admin's ID
        } 
      },
      { upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: newSettings
    });

  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
});

// PATCH /api/admin/report-issues - Update reported issue status and details
router.patch('/report-issues', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const { id, status, priority, actionTaken, resolution, investigatedBy, incrementView } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Issue ID is required'
      });
    }

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue ID'
      });
    }

    const updateData: Record<string, any> = {
      updatedAt: new Date()
    };

    // Handle view count increment
    if (incrementView) {
      updateData.$inc = { viewCount: 1 };
    }

    // Handle status update
    if (status) {
      if (!['open', 'investigating', 'resolved', 'closed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be open, investigating, resolved, or closed'
        });
      }
      updateData.status = status;
    }

    if (priority) {
      if (!['low', 'medium', 'high', 'critical'].includes(priority)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid priority. Must be low, medium, high, or critical'
        });
      }
      updateData.priority = priority;
    }

    if (actionTaken !== undefined) {
      updateData.actionTaken = actionTaken;
    }

    if (resolution !== undefined) {
      updateData.resolution = resolution;
    }

    if (investigatedBy) {
      updateData.investigatedBy = investigatedBy;
      updateData.investigatedAt = new Date();
    }

    const result = await db.collection('report-issues').updateOne(
      { _id: new ObjectId(id) },
      updateData
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reported issue not found'
      });
    }

    res.status(200).json({
      success: true,
      message: incrementView ? 'View count incremented' : 'Issue updated successfully'
    });

  } catch (error) {
    console.error('Error updating reported issue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update reported issue'
    });
  }
});

// GET /api/admin/report-issues - Get all reported issues for admin management
router.get('/report-issues', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};

    // Add filters
    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }

    if (req.query.severity && req.query.severity !== 'all') {
      query.severity = req.query.severity;
    }

    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    if (req.query.priority && req.query.priority !== 'all') {
      query.priority = req.query.priority;
    }

    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { 'user.name': { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const issues = await db.collection('report-issues')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection('report-issues').countDocuments(query);

    res.status(200).json({
      success: true,
      data: issues,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Error fetching reported issues:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reported issues'
    });
  }
});

// GET /api/admin/contact - Get all contact inquiries for admin management
router.get('/contact', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};

    // Add filters
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    if (req.query.priority && req.query.priority !== 'all') {
      query.priority = req.query.priority;
    }

    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { subject: { $regex: req.query.search, $options: 'i' } },
        { message: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const contacts = await db.collection('contacts')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection('contacts').countDocuments(query);

    res.status(200).json({
      success: true,
      data: contacts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Error fetching contact inquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact inquiries'
    });
  }
});

// GET /api/admin/feedback - Get all feedback for admin management
router.get('/feedback', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};

    // Add filters
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    if (req.query.priority && req.query.priority !== 'all') {
      query.priority = req.query.priority;
    }

    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }

    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { subject: { $regex: req.query.search, $options: 'i' } },
        { message: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const feedback = await db.collection('feedback')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection('feedback').countDocuments(query);

    res.status(200).json({
      success: true,
      data: feedback,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback'
    });
  }
});

// GET /api/admin/customers - Get list of active customers for tagging resources
router.get('/customers', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {
      role: { $in: ['customer', 'user'] },
      status: 'active'
    };

    // Add search filter
    if (req.query.search) {
      query.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { name: { $regex: req.query.search, $options: 'i' } },
        { businessName: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const customers = await db.collection('users')
      .find(query, {
        projection: {
          password: 0,
          loginHistory: 0
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection('users').countDocuments(query);

    res.status(200).json({
      success: true,
      customers: customers.map(customer => ({
        id: customer._id.toString(),
        email: customer.email,
        name: customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
        firstName: customer.firstName,
        lastName: customer.lastName,
        businessName: customer.businessName,
        businessType: customer.businessType,
        phone: customer.phone,
        city: customer.city,
        membershipType: customer.membershipType || 'free',
        createdAt: customer.createdAt
      })),
      total,
      page,
      pages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers'
    });
  }
});

// GET /api/admin/submissions/:id - Get a specific submission by ID
router.get('/submissions/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid submission ID'
      });
    }

    const submission = await db
      .collection('submissions')
      .findOne({ _id: new ObjectId(id) });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Get customer info
    let customerInfo = null;
    if (submission.userId) {
      const customer = await db.collection('users').findOne(
        { _id: new ObjectId(submission.userId) },
        { projection: { name: 1, email: 1, phone: 1 } }
      );
      customerInfo = customer ? { 
        name: customer.name, 
        email: customer.email,
        phone: customer.phone 
      } : null;
    }

    const submissionWithCustomerInfo = {
      id: submission._id.toString(),
      type: submission.type,
      category: submission.category,
      title: submission.title || submission.data?.name || 'Untitled',
      description: submission.description || submission.data?.description || '',
      status: submission.status,
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt,
      submittedForApprovalAt: submission.submittedForApprovalAt,
      resourceId: submission.resourceId,
      submittedBy: customerInfo,
      submissionData: submission.data || {},
      adminNotes: submission.adminNotes,
      reviewedAt: submission.reviewedAt,
      adminId: submission.adminId
    };

    res.status(200).json({
      success: true,
      submission: submissionWithCustomerInfo
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submission'
    });
  }
});

// PUT /api/admin/submissions/:id/assign - Assign/tag a pending submission to a customer
router.put('/submissions/:id/assign', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const { id } = req.params;
    const { customerId } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid submission ID'
      });
    }

    if (!customerId || !ObjectId.isValid(customerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    // Verify customer exists and is active
    const customer = await db.collection('users').findOne({
      _id: new ObjectId(customerId),
      role: { $in: ['customer', 'user'] },
      status: 'active'
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found or inactive'
      });
    }

    // Update submission with assigned customer
    const result = await db.collection('submissions').findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          userId: new ObjectId(customerId),
          assignedBy: (req as any).user?.userId,
          assignedAt: new Date(),
          updatedAt: new Date(),
          status: 'pending' // Keep as pending for customer to update
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Submission assigned to customer successfully',
      data: result
    });

  } catch (error) {
    console.error('Error assigning submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign submission'
    });
  }
});

// PUT /api/admin/submissions/:id/approve - Approve submission and publish to main website
router.put('/submissions/:id/approve', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const { id } = req.params;
    const { adminNotes } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid submission ID'
      });
    }

    // Get submission details
    const submission = await db.collection('submissions').findOne({
      _id: new ObjectId(id)
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Update submission status to approved
    await db.collection('submissions').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'approved',
          approvedAt: new Date(),
          approvedBy: (req as any).user?.userId,
          adminNotes: adminNotes || '',
          updatedAt: new Date()
        }
      }
    );

    // Publish to main website collection based on type
    const collectionMap: Record<string, string> = {
      'hotel': 'hotels',
      'restaurant': 'restaurants',
      'event': 'events',
      'sports': 'sports',
      'promotion': 'promotions'
    };

    const targetCollection = collectionMap[submission.type];

    if (targetCollection) {
      let publishData: any;
      let existingResource = null;

      // Check if this is an update to existing resource (has resourceId)
      if (submission.resourceId) {
        // Update existing resource
        existingResource = await db.collection(targetCollection).findOne({
          _id: new ObjectId(submission.resourceId)
        });

        if (existingResource) {
          // Update the existing resource with new data
          publishData = {
            ...submission.data,
            _id: new ObjectId(submission.resourceId),
            updatedAt: new Date(),
            status: 'active',
            lastApprovedAt: new Date(),
            lastApprovedBy: (req as any).user?.userId
          };

          await db.collection(targetCollection).replaceOne(
            { _id: new ObjectId(submission.resourceId) },
            publishData
          );
        }
      } else {
        // Create new resource
        publishData = {
          ...submission.data,
          _id: new ObjectId(), // Create new ID for main collection
          submissionId: submission._id, // Keep reference to original submission
          publishedAt: new Date(),
          publishedBy: (req as any).user?.userId,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Insert into main collection
        await db.collection(targetCollection).insertOne(publishData);
      }

      res.status(200).json({
        success: true,
        message: `Submission approved and published to ${targetCollection} successfully`,
        data: {
          submission,
          published: publishData
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid submission type'
      });
    }

  } catch (error) {
    console.error('Error approving submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve submission'
    });
  }
});

// PUT /api/admin/submissions/:id/reject - Reject submission with notes
router.put('/submissions/:id/reject', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const { id } = req.params;
    const { adminNotes } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid submission ID'
      });
    }

    const result = await db.collection('submissions').findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'rejected',
          rejectedAt: new Date(),
          rejectedBy: (req as any).user?.userId,
          adminNotes: adminNotes || '',
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Submission rejected successfully',
      data: result
    });

  } catch (error) {
    console.error('Error rejecting submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject submission'
    });
  }
});

// GET /api/admin/submissions - Get submissions with query parameters
router.get('/submissions', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;
    const type = req.query.type as string;

    // Build query based on parameters
    const query: Record<string, any> = {};
    
    if (status) {
      if (status === 'pending-approval') {
        query.status = 'pending_approval';
      } else {
        query.status = status;
      }
    }
    
    if (type && ['hotel', 'restaurant', 'event', 'sports', 'promotion'].includes(type)) {
      query.type = type;
    }

    const submissions = await db.collection('submissions')
      .find(query)
      .sort({ 
        submittedForApprovalAt: -1, 
        createdAt: -1, 
        updatedAt: -1 
      })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection('submissions').countDocuments(query);

    // Get customer info for each submission
    const submissionsWithCustomerInfo = await Promise.all(
      submissions.map(async (submission) => {
        let customerInfo = null;
        if (submission.userId) {
          const customer = await db.collection('users').findOne(
            { _id: new ObjectId(submission.userId) },
            { projection: { name: 1, email: 1, phone: 1 } }
          );
          customerInfo = customer ? { 
            name: customer.name, 
            email: customer.email,
            phone: customer.phone 
          } : null;
        }

        return {
          id: submission._id.toString(),
          type: submission.type,
          category: submission.category,
          title: submission.title || submission.data?.name || 'Untitled',
          description: submission.description || submission.data?.description || '',
          status: submission.status,
          createdAt: submission.createdAt,
          updatedAt: submission.updatedAt,
          submittedForApprovalAt: submission.submittedForApprovalAt,
          resourceId: submission.resourceId,
          submittedBy: customerInfo,
          submissionData: submission.data || {}
        };
      })
    );

    res.status(200).json({
      success: true,
      submissions: submissionsWithCustomerInfo,
      total,
      page,
      pages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions'
    });
  }
});

// GET /api/admin/submissions/:id - Get single submission by ID
router.get('/submissions/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid submission ID'
      });
    }

    const submission = await db
      .collection('submissions')
      .findOne({ _id: new ObjectId(id) });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Get customer info if submission has a userId
    let customerInfo = null;
    if (submission.userId) {
      const customer = await db.collection('users').findOne(
        { _id: new ObjectId(submission.userId) },
        { projection: { name: 1, email: 1, phone: 1 } }
      );
      if (customer) {
        customerInfo = {
          name: customer.name,
          email: customer.email,
          phone: customer.phone
        };
      }
    }

    const submissionWithCustomerInfo = {
      ...submission,
      submittedBy: customerInfo
    };

    res.status(200).json({
      success: true,
      submission: submissionWithCustomerInfo
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submission'
    });
  }
});

// GET /api/admin/submissions/unassigned - Get unassigned/pending submissions for tagging
router.get('/submissions/unassigned', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type as string; // filter by type: hotel, restaurant, event, sports

    const query: Record<string, any> = {
      $or: [
        { userId: { $exists: false } },
        { userId: null }
      ]
    };

    if (type && ['hotel', 'restaurant', 'event', 'sports', 'promotion'].includes(type)) {
      query.type = type;
    }

    const submissions = await db.collection('submissions')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection('submissions').countDocuments(query);

    res.status(200).json({
      success: true,
      submissions: submissions.map(sub => ({
        id: sub._id.toString(),
        type: sub.type,
        title: sub.title || sub.name,
        status: sub.status,
        createdAt: sub.createdAt,
        data: sub
      })),
      total,
      page,
      pages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Error fetching unassigned submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unassigned submissions'
    });
  }
});

// GET /api/admin/submissions/pending-approval - Get submissions pending admin approval
router.get('/submissions/pending-approval', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type as string; // filter by type: hotel, restaurant, event, sports

    const query: Record<string, any> = {
      status: 'pending_approval' // Filter for submissions pending approval
    };

    if (type && ['hotel', 'restaurant', 'event', 'sports', 'promotion'].includes(type)) {
      query.type = type;
    }

    const submissions = await db.collection('submissions')
      .find(query)
      .sort({ submittedForApprovalAt: -1, updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection('submissions').countDocuments(query);

    // Get customer info for each submission
    const submissionsWithCustomerInfo = await Promise.all(
      submissions.map(async (submission) => {
        let customerInfo = null;
        if (submission.userId) {
          const customer = await db.collection('users').findOne(
            { _id: new ObjectId(submission.userId) },
            { projection: { name: 1, email: 1 } }
          );
          customerInfo = customer ? { name: customer.name, email: customer.email } : null;
        }

        return {
          id: submission._id.toString(),
          type: submission.type,
          category: submission.category,
          title: submission.title || submission.data?.name || 'Untitled',
          description: submission.description || submission.data?.description || '',
          status: submission.status,
          createdAt: submission.createdAt,
          updatedAt: submission.updatedAt,
          submittedForApprovalAt: submission.submittedForApprovalAt,
          resourceId: submission.resourceId, // Include resourceId to identify updates vs new submissions
          customer: customerInfo,
          data: submission.data
        };
      })
    );

    res.status(200).json({
      success: true,
      submissions: submissionsWithCustomerInfo,
      total,
      page,
      pages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Error fetching pending approval submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending approval submissions'
    });
  }
});

// GET /api/admin/resources/pending - Get pending resources from main collections for assignment
router.get('/resources/pending', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 1000; // Increased default limit
    const skip = (page - 1) * limit;
    const type = req.query.type as string; // filter by type: hotel, restaurant, event, sports, promotion

    const collections = ['hotels', 'restaurants', 'events', 'sports', 'promotions'];
    const query = { status: 'pending', assignedTo: { $exists: false } }; // Only unassigned pending resources

    if (type && collections.includes(type + 's')) {
      collections.length = 0;
      collections.push(type + 's');
    }

    const allResources: any[] = [];

    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        // Fetch ALL pending resources from each collection (no limit per collection)
        const resources = await collection
          .find(query)
          .sort({ createdAt: -1 })
          .toArray();

        const resourcesWithType = resources.map(resource => ({
          id: resource._id.toString(),
          type: collectionName.slice(0, -1), // Remove 's' from collection name
          title: resource.name || `${collectionName.slice(0, -1)} ${resource._id.toString().slice(-6)}`,
          status: resource.status,
          createdAt: resource.createdAt,
          data: resource,
          source: 'ingested' // Mark as ingested data
        }));

        allResources.push(...resourcesWithType);
      } catch (error) {
        console.warn(`Warning: Could not fetch from ${collectionName}:`, error);
      }
    }

    // Sort all resources by createdAt
    allResources.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply pagination to combined results
    const paginatedResources = allResources.slice(skip, skip + limit);

    res.status(200).json({
      success: true,
      resources: paginatedResources,
      total: allResources.length,
      page,
      pages: Math.ceil(allResources.length / limit)
    });

  } catch (error) {
    console.error('Error fetching pending resources:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending resources'
    });
  }
});

// PUT /api/admin/resources/:id/assign - Assign a pending resource to a customer
router.put('/resources/:id/assign', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { customerId, type } = req.body;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID is required'
      });
    }

    if (!type || !['hotel', 'restaurant', 'event', 'sports', 'promotion'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Valid resource type is required'
      });
    }

    const { db } = await connectToDatabase();
    const collectionName = type + 's';
    const collection = db.collection(collectionName);

    // Get the resource data
    const resource = await collection.findOne({ _id: new ObjectId(id), status: 'pending' });

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Pending resource not found or already assigned'
      });
    }

    // Create a submission entry for the customer
    const submission = {
      userId: new ObjectId(customerId),
      type,
      title: resource.name || resource.title || 'Untitled Resource',
      name: resource.name || resource.title || 'Untitled Resource',
      status: 'pending',
      data: resource,
      resourceId: new ObjectId(id), // Reference to the original resource
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const submissionResult = await db.collection('submissions').insertOne(submission);

    // Keep the resource status as pending but mark it as assigned
    await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          assignedTo: new ObjectId(customerId),
          assignedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Resource assigned to customer successfully',
      submission: {
        id: submissionResult.insertedId.toString(),
        type,
        title: resource.name,
        status: 'pending',
        assignedTo: customerId
      }
    });

  } catch (error) {
    console.error('Error assigning resource:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign resource'
    });
  }
});

export default router;

