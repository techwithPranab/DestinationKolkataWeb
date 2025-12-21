import { Router, Request, Response } from 'express';
import { authenticateToken as auth } from '../middleware/auth';
import { Feedback } from '../models';
import mongoose from 'mongoose';

const router = Router();

// Sample feedback data for development
const sampleFeedbackData = [
  {
    type: 'feature',
    subject: 'Add Dark Mode Support',
    message: 'It would be great to have a dark mode option for the website. Many users prefer dark themes, especially for evening browsing.',
    email: 'user@example.com',
    rating: 4,
    likes: ['Easy navigation', 'Good content', 'Fast loading'],
    dislikes: ['Bright colors at night'],
    status: 'new',
    priority: 'medium',
    category: 'UI/UX Enhancement',
    viewCount: 0
  },
  {
    type: 'bug',
    subject: 'Search Not Working Properly',
    message: 'The search function is not returning accurate results when searching for hotels in specific areas.',
    email: 'reporter@example.com',
    rating: 2,
    likes: ['Good hotel listings'],
    dislikes: ['Search functionality', 'Slow results'],
    status: 'reviewed',
    priority: 'high',
    category: 'Technical Issue',
    viewCount: 5
  },
  {
    type: 'general',
    subject: 'Excellent Service',
    message: 'Great website with comprehensive information about Kolkata. Really helped in planning my trip!',
    email: 'happy.user@example.com',
    rating: 5,
    likes: ['Complete information', 'User-friendly', 'Good recommendations'],
    dislikes: [],
    status: 'reviewed',
    priority: 'low',
    category: 'General Feedback',
    viewCount: 2
  },
  {
    type: 'content',
    subject: 'Missing Restaurant Information',
    message: 'Some popular restaurants are missing from the listings. Would be helpful to add more local eateries.',
    rating: 3,
    likes: ['Existing restaurant info is good'],
    dislikes: ['Incomplete listings'],
    status: 'new',
    priority: 'medium',
    category: 'Content Suggestion',
    viewCount: 1
  }
];

// Helper function to initialize sample data
const initializeSampleData = async () => {
  try {
    // Check if database connection is ready
    if (mongoose.connection.readyState !== 1) {
      console.log('⏳ Database not ready, skipping feedback initialization');
      return;
    }

    const existingCount = await Feedback.countDocuments();
    if (existingCount === 0) {
      await Feedback.insertMany(sampleFeedbackData);
      console.log('✅ Sample feedback data initialized');
    }
  } catch (error) {
    console.error('❌ Error initializing feedback sample data:', error);
  }
};

// Remove synchronous initialization - will be called lazily
// initializeSampleData();

// GET /api/feedback - Get all feedback with filtering (admin only)
router.get('/', auth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    // Initialize sample data if needed (lazy initialization)
    await initializeSampleData();

    const {
      page = 1,
      limit = 10,
      type,
      status,
      priority,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter: any = {};
    
    if (type) {
      filter.type = type;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (priority) {
      filter.priority = priority;
    }
    
    if (category) {
      filter.category = new RegExp(category as string, 'i');
    }
    
    if (search) {
      filter.$or = [
        { subject: new RegExp(search as string, 'i') },
        { message: new RegExp(search as string, 'i') },
        { email: new RegExp(search as string, 'i') }
      ];
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const feedback = await Feedback.find(filter)
      .populate('reviewedBy', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const total = await Feedback.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);

    // Get statistics
    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    const typeStats = await Feedback.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: feedback,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      },
      statistics: {
        byStatus: stats,
        byType: typeStats
      },
      filters: {
        type,
        status,
        priority,
        category,
        search
      }
    });

  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// GET /api/feedback/stats - Get feedback statistics (admin only)
router.get('/stats', auth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const totalFeedback = await Feedback.countDocuments();
    const avgRating = await Feedback.aggregate([
      { $match: { rating: { $exists: true } } },
      { $group: { _id: null, average: { $avg: '$rating' } } }
    ]);

    const statusBreakdown = await Feedback.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const typeBreakdown = await Feedback.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityBreakdown = await Feedback.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentFeedback = await Feedback.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('subject type status createdAt rating');

    res.json({
      success: true,
      data: {
        total: totalFeedback,
        averageRating: avgRating.length > 0 ? avgRating[0].average : 0,
        statusBreakdown,
        typeBreakdown,
        priorityBreakdown,
        recentFeedback
      }
    });

  } catch (error) {
    console.error('Error fetching feedback statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback statistics',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// GET /api/feedback/:id - Get specific feedback (admin only)
router.get('/:id', auth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback ID'
      });
    }

    const feedback = await Feedback.findById(id).populate('reviewedBy', 'name email');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Update view tracking
    await Feedback.findByIdAndUpdate(id, {
      $inc: { viewCount: 1 },
      $set: {
        viewedAt: new Date(),
        viewedBy: user.userId
      }
    });

    res.json({
      success: true,
      data: feedback
    });

  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// POST /api/feedback - Submit new feedback (public endpoint)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { type, subject, message, email, rating, likes, dislikes, category } = req.body;

    // Validate required fields
    if (!type || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Type, subject, and message are required'
      });
    }

    // Validate email if provided
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Normalize type to lowercase to match enum values
    const normalizedType = type.toLowerCase();

    const feedback = new Feedback({
      type: normalizedType,
      subject,
      message,
      email,
      rating,
      likes: Array.isArray(likes) ? likes : [],
      dislikes: Array.isArray(dislikes) ? dislikes : [],
      category: category || 'website',
      status: 'new',
      priority: 'medium',
      viewCount: 0
    });

    await feedback.save();

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully. Thank you for your input!',
      data: {
        id: feedback._id,
        status: feedback.status
      }
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// PUT /api/feedback/:id/review - Review feedback (admin only)
router.put('/:id/review', auth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { status, priority, notes } = req.body;
    
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback ID'
      });
    }

    const updateData: any = {
      reviewedAt: new Date(),
      reviewedBy: user.userId
    };

    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (notes) updateData.notes = notes;

    const feedback = await Feedback.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate('reviewedBy', 'name email');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      message: 'Feedback reviewed successfully',
      data: feedback
    });

  } catch (error) {
    console.error('Error reviewing feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error reviewing feedback',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// DELETE /api/feedback/:id - Delete feedback (admin only)
router.delete('/:id', auth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback ID'
      });
    }

    const feedback = await Feedback.findByIdAndDelete(id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting feedback',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

export default router;
