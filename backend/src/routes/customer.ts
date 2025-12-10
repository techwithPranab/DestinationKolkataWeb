import { Router, Request, Response } from 'express';
import { connectToDatabase } from '../lib/mongodb';
import { ObjectId } from 'mongodb';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Helper function to check if user has customer access
const requireCustomerAccess = (req: Request, res: Response, next: any) => {
  const userRole = (req as any).user?.role;
  if (!['customer', 'user'].includes(userRole)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Customer access required.'
    });
  }
  next();
};

interface CustomerProfile {
  userId: ObjectId;
  phone: string;
  profilePicture?: string;
  bio?: string;
  preferences: {
    language: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    privacyLevel: 'public' | 'private' | 'friends-only';
    marketingEmails: boolean;
  };
  verificationStatus: {
    emailVerified: boolean;
    phoneVerified: boolean;
    identityVerified: boolean;
  };
  metadata?: {
    lastLogin: Date;
    loginCount: number;
    deviceInfo?: string[];
  };
}

// GET - Get customer profile
router.get('/profile', authenticateToken, requireCustomerAccess, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const customer = await db
      .collection('customers')
      .findOne({ userId: new ObjectId(userId) });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Get customer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer profile'
    });
  }
});

// GET - Get customer preferences
router.get('/preferences', authenticateToken, requireCustomerAccess, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const customer = await db
      .collection('customers')
      .findOne(
        { userId: new ObjectId(userId) },
        { projection: { preferences: 1 } }
      );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: customer.preferences || {}
    });
  } catch (error) {
    console.error('Get customer preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch preferences'
    });
  }
});

// PUT - Update customer profile
router.put('/profile', authenticateToken, requireCustomerAccess, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const userId = (req as any).user?.userId;
    const { phone, profilePicture, bio } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const updates: any = {};
    if (phone) updates.phone = phone;
    if (profilePicture) updates.profilePicture = profilePicture;
    if (bio) updates.bio = bio;

    const result = await db
      .collection('customers')
      .findOneAndUpdate(
        { userId: new ObjectId(userId) },
        {
          $set: {
            ...updates,
            'metadata.lastLogin': new Date()
          }
        },
        { returnDocument: 'after' }
      );

    if (!result || !result.value) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.value,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update customer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// PUT - Update customer preferences
router.put('/preferences', authenticateToken, requireCustomerAccess, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const userId = (req as any).user?.userId;
    const preferences = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Validate preferences structure
    if (preferences.language) {
      const validLanguages = ['en', 'hi', 'bn'];
      if (!validLanguages.includes(preferences.language)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid language selected'
        });
      }
    }

    if (preferences.privacyLevel) {
      const validLevels = ['public', 'private', 'friends-only'];
      if (!validLevels.includes(preferences.privacyLevel)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid privacy level'
        });
      }
    }

    const result = await db
      .collection('customers')
      .findOneAndUpdate(
        { userId: new ObjectId(userId) },
        {
          $set: {
            'preferences.language': preferences.language || 'en',
            'preferences.notifications.email': preferences.notifications?.email !== false,
            'preferences.notifications.sms': preferences.notifications?.sms !== false,
            'preferences.notifications.push': preferences.notifications?.push !== false,
            'preferences.privacyLevel': preferences.privacyLevel || 'public',
            'preferences.marketingEmails': preferences.marketingEmails !== false
          }
        },
        { returnDocument: 'after' }
      );

    if (!result || !result.value) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.value.preferences,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    console.error('Update customer preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences'
    });
  }
});

// GET - Get customer statistics
router.get('/stats', authenticateToken, requireCustomerAccess, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const userObjectId = new ObjectId(userId);

    // Get various stats
    const [totalSubmissions, approvedSubmissions, pendingSubmissions, rejectedSubmissions, totalViews] = await Promise.all([
      db.collection('submissions').countDocuments({ userId: userObjectId }),
      db.collection('submissions').countDocuments({ userId: userObjectId, status: 'approved' }),
      db.collection('submissions').countDocuments({ userId: userObjectId, status: 'pending' }),
      db.collection('submissions').countDocuments({ userId: userObjectId, status: 'rejected' }),
      db.collection('submissions').aggregate([
        { $match: { userId: userObjectId } },
        { $group: { _id: null, totalViews: { $sum: { $ifNull: ["$views", 0] } } } }
      ]).toArray().then(result => result[0]?.totalViews || 0)
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalSubmissions,
        approvedSubmissions,
        pendingSubmissions,
        rejectedSubmissions,
        totalViews,
        membershipType: 'free',
        membershipExpiry: null
      }
    });
  } catch (error) {
    console.error('Get customer stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer statistics'
    });
  }
});

// GET - Get customer activity log
router.get('/activity-log', authenticateToken, requireCustomerAccess, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const userId = (req as any).user?.userId;
    const { limit = 20, skip = 0 } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const userObjectId = new ObjectId(userId);

    // Fetch activity logs
    const activities = await db
      .collection('activitylogs')
      .find({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .toArray();

    const totalCount = await db
      .collection('activitylogs')
      .countDocuments({ userId: userObjectId });

    res.status(200).json({
      success: true,
      data: activities,
      pagination: {
        total: totalCount,
        limit: Number(limit),
        skip: Number(skip)
      }
    });
  } catch (error) {
    console.error('Get activity log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity log'
    });
  }
});

// DELETE - Delete customer account (soft delete)
router.delete('/account', authenticateToken, requireCustomerAccess, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const userId = (req as any).user?.userId;
    const { password } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required for account deletion'
      });
    }

    // Soft delete - mark as deleted instead of removing
    const result = await db
      .collection('customers')
      .findOneAndUpdate(
        { userId: new ObjectId(userId) },
        {
          $set: {
            isDeleted: true,
            deletedAt: new Date(),
            'preferences.marketingEmails': false
          }
        },
        { returnDocument: 'after' }
      );

    if (!result || !result.value) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    });
  }
});

// GET - Get customer submissions
router.get('/submissions', authenticateToken, requireCustomerAccess, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const userId = (req as any).user?.userId;
    const { limit = 10, skip = 0 } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const userObjectId = new ObjectId(userId);

    // Fetch submissions
    const submissions = await db
      .collection('submissions')
      .find({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .toArray();

    const totalCount = await db
      .collection('submissions')
      .countDocuments({ userId: userObjectId });

    res.status(200).json({
      success: true,
      data: {
        submissions: submissions.map(sub => ({
          id: sub._id.toString(),
          type: sub.type || 'hotel',
          title: sub.title || sub.name || 'Untitled',
          status: sub.status || 'pending',
          createdAt: sub.createdAt || new Date(),
          views: sub.views || 0,
          adminNotes: sub.adminNotes || null
        }))
      },
      pagination: {
        total: totalCount,
        limit: Number(limit),
        skip: Number(skip)
      }
    });
  } catch (error) {
    console.error('Get customer submissions error:', error);
    res.status(500).json({
      success: true,
      data: {
        submissions: []
      },
      message: 'Failed to fetch submissions'
    });
  }
});

// GET - Get customer favorites
router.get('/favorites', authenticateToken, requireCustomerAccess, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const userObjectId = new ObjectId(userId);

    // Fetch user favorites
    const favorites = await db
      .collection('favorites')
      .find({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      data: {
        favorites: favorites.map(fav => ({
          id: fav._id.toString(),
          type: fav.type,
          itemId: fav.itemId,
          createdAt: fav.createdAt || new Date()
        }))
      }
    });
  } catch (error) {
    console.error('Get customer favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch favorites'
    });
  }
});

// POST - Add to favorites
router.post('/favorites', authenticateToken, requireCustomerAccess, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const userId = (req as any).user?.userId;
    const { type, itemId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (!type || !itemId) {
      return res.status(400).json({
        success: false,
        message: 'Type and itemId are required'
      });
    }

    const userObjectId = new ObjectId(userId);

    // Check if already favorited
    const existing = await db.collection('favorites').findOne({
      userId: userObjectId,
      type,
      itemId
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Already in favorites'
      });
    }

    // Add to favorites
    const result = await db.collection('favorites').insertOne({
      userId: userObjectId,
      type,
      itemId,
      createdAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Added to favorites',
      data: {
        id: result.insertedId.toString()
      }
    });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add to favorites'
    });
  }
});

// DELETE - Remove from favorites
router.delete('/favorites', authenticateToken, requireCustomerAccess, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const userId = (req as any).user?.userId;
    const { type, itemId } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (!type || !itemId) {
      return res.status(400).json({
        success: false,
        message: 'Type and itemId are required'
      });
    }

    const userObjectId = new ObjectId(userId);

    // Remove from favorites
    const result = await db.collection('favorites').deleteOne({
      userId: userObjectId,
      type: type as string,
      itemId: itemId as string
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Removed from favorites'
    });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from favorites'
    });
  }
});

// GET - Get customer reviews
router.get('/reviews', authenticateToken, requireCustomerAccess, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const userObjectId = new ObjectId(userId);

    // Fetch user reviews
    const reviews = await db
      .collection('reviews')
      .find({ user: userObjectId })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      data: {
        reviews: reviews.map(review => ({
          id: review._id.toString(),
          entityId: review.entityId,
          entityType: review.entityType,
          rating: review.rating,
          comment: review.comment,
          status: review.status,
          createdAt: review.createdAt || new Date()
        }))
      }
    });
  } catch (error) {
    console.error('Get customer reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
});

// GET /api/customer/submissions/:id - Get a specific submission for editing
router.get('/submissions/:id', authenticateToken, requireCustomerAccess, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const userId = (req as any).user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid submission ID'
      });
    }

    const submission = await db.collection('submissions').findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId)
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: submission
    });

  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submission'
    });
  }
});

// PUT /api/customer/submissions/:id - Update a submission assigned to customer
router.put('/submissions/:id', authenticateToken, requireCustomerAccess, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const userId = (req as any).user?.userId;
    const { id } = req.params;
    const updateData = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid submission ID'
      });
    }

    // Verify submission belongs to user
    const existingSubmission = await db.collection('submissions').findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId)
    });

    if (!existingSubmission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found or access denied'
      });
    }

    // Remove fields that shouldn't be updated by customer
    delete updateData._id;
    delete updateData.userId;
    delete updateData.assignedBy;
    delete updateData.assignedAt;
    delete updateData.createdAt;

    // Update submission
    const result = await db.collection('submissions').findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
          status: 'pending' // Keep as pending after update
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Failed to update submission'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Submission updated successfully',
      data: result
    });

  } catch (error) {
    console.error('Update submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update submission'
    });
  }
});

// POST /api/customer/submissions/:id/submit - Submit updated submission for approval
router.post('/submissions/:id/submit', authenticateToken, requireCustomerAccess, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const userId = (req as any).user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid submission ID'
      });
    }

    // Verify submission belongs to user and is pending
    const submission = await db.collection('submissions').findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId)
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found or access denied'
      });
    }

    // Update status to submitted/pending review
    const result = await db.collection('submissions').findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'pending',
          submittedAt: new Date(),
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    res.status(200).json({
      success: true,
      message: 'Submission sent for approval successfully',
      data: result
    });

  } catch (error) {
    console.error('Submit submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit submission'
    });
  }
});

export default router;

