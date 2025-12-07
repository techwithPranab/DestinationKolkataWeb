import { Router, Request, Response } from 'express';
import dbConnect from '../lib/db';
import { Review } from '../models';
import { authenticateToken, optionalAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// GET /api/reviews?entityId=...&entityType=...&page=...&limit=...
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    await dbConnect();

    const entityId = req.query.entityId as string;
    const entityType = req.query.entityType as string;
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '10');
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = req.query.sortOrder as string || 'desc';

    if (!entityId || !entityType) {
      return res.status(400).json({
        success: false,
        message: 'entityId and entityType are required'
      });
    }

    // Validate entityType
    const validEntityTypes = ['hotel', 'restaurant', 'attraction', 'event', 'sports'];
    if (!validEntityTypes.includes(entityType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid entityType'
      });
    }

    // Build query
    const query: Record<string, any> = {
      entityId,
      entityType,
      status: 'approved' // Only show approved reviews to public
    };

    // Admin can see all reviews
    if (req.user && req.user.role === 'admin') {
      delete query.status;
    }

    // Build sort object
    const sortObj: Record<string, 1 | -1> = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Pagination
    const skip = (page - 1) * limit;

    // Get reviews
    const reviews = await Review.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email')
      .lean();

    // Get total count
    const total = await Review.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Calculate rating statistics
    const ratingStats = await Review.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratings: {
            $push: {
              rating: '$rating',
              count: 1
            }
          }
        }
      }
    ]);

    // Calculate rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (ratingStats.length > 0) {
      ratingStats[0].ratings.forEach((r: any) => {
        ratingDistribution[r.rating as keyof typeof ratingDistribution]++;
      });
    }

    res.status(200).json({
      success: true,
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      stats: {
        averageRating: ratingStats[0]?.averageRating || 0,
        totalReviews: ratingStats[0]?.totalReviews || 0,
        ratingDistribution
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// POST /api/reviews - Create new review
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    await dbConnect();

    const { entityId, entityType, rating, title, comment } = req.body;

    // Validation
    if (!entityId || !entityType || !rating) {
      return res.status(400).json({
        success: false,
        message: 'entityId, entityType, and rating are required'
      });
    }

    // Validate entityType
    const validEntityTypes = ['hotel', 'restaurant', 'attraction', 'event', 'sports'];
    if (!validEntityTypes.includes(entityType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid entityType'
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if user already reviewed this entity
    const existingReview = await Review.findOne({
      user: req.user!.userId,
      entityId,
      entityType
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this item'
      });
    }

    // Create new review
    const review = new Review({
      user: req.user!.userId,
      entityId,
      entityType,
      rating,
      title,
      comment,
      status: 'pending', // Reviews require approval
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await review.save();

    res.status(201).json({
      success: true,
      data: review,
      message: 'Review submitted successfully. It will be reviewed before being published.'
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// GET /api/reviews/:id - Get single review
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    await dbConnect();

    const { id } = req.params;
    const review = await Review.findById(id)
      .populate('userId', 'name email')
      .lean();

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user can view this review
    if (review.status !== 'approved' && (!req.user || (req.user.userId !== review.user?.toString() && req.user.role !== 'admin'))) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review'
    });
  }
});

// PUT /api/reviews/:id/helpful - Mark review as helpful
router.put('/:id/helpful', authenticateToken, async (req: Request, res: Response) => {
  try {
    await dbConnect();

    const { id } = req.params;
    const userId = req.user!.userId;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user already marked this review as helpful
    const helpfulUsers = review.helpfulUsers || [];
    const existingVote = helpfulUsers.find(vote => vote.user.toString() === userId);
    
    if (existingVote) {
      // Toggle helpful vote
      existingVote.helpful = !existingVote.helpful;
    } else {
      // Add new helpful vote
      helpfulUsers.push({
        user: userId as any,
        helpful: true,
        votedAt: new Date()
      });
    }

    // Update helpful count
    review.helpful = helpfulUsers.filter(vote => vote.helpful).length;
    review.helpfulUsers = helpfulUsers;

    await review.save();

    res.status(200).json({
      success: true,
      data: {
        helpful: existingVote ? existingVote.helpful : true,
        helpfulCount: review.helpful
      }
    });
  } catch (error) {
    console.error('Error updating helpful votes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update helpful votes'
    });
  }
});

// PUT /api/reviews/:id/report - Report inappropriate review
router.put('/:id/report', authenticateToken, async (req: Request, res: Response) => {
  try {
    await dbConnect();

    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user!.userId;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Add report
    if (!review.reportedBy) {
      review.reportedBy = [];
    }

    // Check if user already reported this review
    const alreadyReported = review.reportedBy.some(reporterId => reporterId.toString() === userId);
    if (alreadyReported) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this review'
      });
    }

    review.reportedBy.push(userId as any);

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review reported successfully'
    });
  } catch (error) {
    console.error('Error reporting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report review'
    });
  }
});

export default router;
