import { Router, Request, Response } from 'express';
import { connectToDatabase } from '../lib/mongodb';
import { ObjectId } from 'mongodb';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Interface for vote request
interface VoteRequest {
  reviewId: string;
  helpful: boolean;
}

/**
 * GET /api/helpful-votes/review/:reviewId
 * Get vote statistics for a review
 */
router.get('/review/:reviewId', async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;

    // Validate reviewId
    if (!ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID'
      });
    }

    const { db } = await connectToDatabase();
    const reviewObjectId = ObjectId.createFromHexString(reviewId);

    // Get review with vote stats
    const review = await db.collection('reviews').findOne({
      _id: reviewObjectId
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Get vote statistics
    const voteStats = await db.collection('helpful_votes').aggregate([
      { $match: { reviewId: reviewObjectId } },
      {
        $group: {
          _id: null,
          helpful: {
            $sum: {
              $cond: [{ $eq: ['$helpful', true] }, 1, 0]
            }
          },
          notHelpful: {
            $sum: {
              $cond: [{ $eq: ['$helpful', false] }, 1, 0]
            }
          },
          total: { $sum: 1 }
        }
      }
    ]).toArray();

    const stats = voteStats.length > 0 ? voteStats[0] : {
      helpful: 0,
      notHelpful: 0,
      total: 0
    };

    res.status(200).json({
      success: true,
      data: {
        reviewId,
        helpfulCount: stats.helpful || 0,
        notHelpfulCount: stats.notHelpful || 0,
        totalVotes: stats.total || 0,
        helpfulPercentage: stats.total > 0 ? Math.round(((stats.helpful || 0) / stats.total) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Get helpful votes stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /api/helpful-votes
 * Submit a helpful vote on a review
 * Body: { reviewId, helpful: boolean }
 */
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const { reviewId, helpful } = req.body as VoteRequest;

    // Validate input
    if (!reviewId || typeof helpful !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'reviewId and helpful (boolean) are required'
      });
    }

    if (!ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID'
      });
    }

    const { db } = await connectToDatabase();
    const reviewObjectId = ObjectId.createFromHexString(reviewId);
    const userId = ObjectId.createFromHexString(user.userId);

    // Check if review exists
    const review = await db.collection('reviews').findOne({
      _id: reviewObjectId
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user has already voted
    const existingVote = await db.collection('helpful_votes').findOne({
      reviewId: reviewObjectId,
      userId
    });

    if (existingVote) {
      // Update existing vote
      if (existingVote.helpful === helpful) {
        // Same vote, remove it (toggle off)
        const deleteResult = await db.collection('helpful_votes').deleteOne({
          reviewId: reviewObjectId,
          userId
        });

        return res.status(200).json({
          success: true,
          message: 'Vote removed',
          data: {
            reviewId,
            voted: false,
            helpful: null
          }
        });
      } else {
        // Different vote, update it
        const updateResult = await db.collection('helpful_votes').updateOne(
          { reviewId: reviewObjectId, userId },
          {
            $set: {
              helpful,
              updatedAt: new Date()
            }
          }
        );

        return res.status(200).json({
          success: true,
          message: 'Vote updated',
          data: {
            reviewId,
            voted: true,
            helpful
          }
        });
      }
    }

    // Create new vote
    const voteDocument = {
      reviewId: reviewObjectId,
      userId,
      helpful,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const insertResult = await db.collection('helpful_votes').insertOne(voteDocument);

    res.status(201).json({
      success: true,
      message: 'Vote recorded',
      data: {
        reviewId,
        voteId: insertResult.insertedId,
        voted: true,
        helpful
      }
    });
  } catch (error) {
    console.error('Submit helpful vote error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/helpful-votes/user/review/:reviewId
 * Check if current user has voted on a review
 */
router.get('/user/review/:reviewId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const { reviewId } = req.params;

    if (!ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID'
      });
    }

    const { db } = await connectToDatabase();
    const reviewObjectId = ObjectId.createFromHexString(reviewId);
    const userId = ObjectId.createFromHexString(user.userId);

    // Find user's vote
    const userVote = await db.collection('helpful_votes').findOne({
      reviewId: reviewObjectId,
      userId
    });

    res.status(200).json({
      success: true,
      data: {
        reviewId,
        hasVoted: !!userVote,
        vote: userVote ? {
          helpful: userVote.helpful,
          votedAt: userVote.createdAt
        } : null
      }
    });
  } catch (error) {
    console.error('Get user vote error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/helpful-votes/leaderboard
 * Get most helpful reviews leaderboard
 * Query params: limit=10, page=1
 */
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string || '10'), 100);
    const page = Math.max(parseInt(req.query.page as string || '1'), 1);
    const skip = (page - 1) * limit;

    const { db } = await connectToDatabase();

    // Get reviews with helpful votes count
    const leaderboard = await db.collection('helpful_votes').aggregate([
      {
        $group: {
          _id: '$reviewId',
          helpfulCount: {
            $sum: {
              $cond: [{ $eq: ['$helpful', true] }, 1, 0]
            }
          },
          totalVotes: { $sum: 1 }
        }
      },
      {
        $addFields: {
          helpfulPercentage: {
            $round: [
              {
                $multiply: [
                  { $divide: ['$helpfulCount', '$totalVotes'] },
                  100
                ]
              },
              2
            ]
          }
        }
      },
      { $sort: { helpfulCount: -1, helpfulPercentage: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: '_id',
          as: 'review'
        }
      },
      { $unwind: '$review' }
    ]).toArray();

    const totalCount = await db.collection('helpful_votes').aggregate([
      {
        $group: {
          _id: '$reviewId'
        }
      },
      {
        $count: 'count'
      }
    ]).toArray();

    res.status(200).json({
      success: true,
      data: leaderboard.map((item: any) => ({
        reviewId: item._id,
        helpfulCount: item.helpfulCount,
        totalVotes: item.totalVotes,
        helpfulPercentage: item.helpfulPercentage,
        review: {
          title: item.review.title,
          rating: item.review.rating,
          text: item.review.text
        }
      })),
      pagination: {
        total: totalCount.length > 0 ? totalCount[0].count : 0,
        limit,
        page,
        pages: totalCount.length > 0 ? Math.ceil(totalCount[0].count / limit) : 0
      }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * DELETE /api/helpful-votes/:voteId
 * Remove a vote (admin only or vote owner)
 */
router.delete('/:voteId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const { voteId } = req.params;

    if (!ObjectId.isValid(voteId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vote ID'
      });
    }

    const { db } = await connectToDatabase();
    const voteObjectId = ObjectId.createFromHexString(voteId);
    const userId = ObjectId.createFromHexString(user.userId);

    // Find the vote
    const vote = await db.collection('helpful_votes').findOne({
      _id: voteObjectId
    });

    if (!vote) {
      return res.status(404).json({
        success: false,
        message: 'Vote not found'
      });
    }

    // Check authorization (owner or admin)
    if (vote.userId.toString() !== userId.toString() && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only delete your own votes'
      });
    }

    // Delete the vote
    const deleteResult = await db.collection('helpful_votes').deleteOne({
      _id: voteObjectId
    });

    res.status(200).json({
      success: true,
      message: 'Vote deleted',
      data: {
        deletedCount: deleteResult.deletedCount
      }
    });
  } catch (error) {
    console.error('Delete vote error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
