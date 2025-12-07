import { Router, Request, Response } from 'express';
import { connectToDatabase } from '../lib/mongodb';
import { ObjectId } from 'mongodb';
import { authenticateToken } from '../middleware/auth';

const router = Router();

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
router.get('/profile', authenticateToken, async (req: Request, res: Response) => {
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
router.get('/preferences', authenticateToken, async (req: Request, res: Response) => {
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
router.put('/profile', authenticateToken, async (req: Request, res: Response) => {
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
router.put('/preferences', authenticateToken, async (req: Request, res: Response) => {
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
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
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
    const [reviewCount, favoriteCount, bookingCount, listingCount] = await Promise.all([
      db.collection('reviews').countDocuments({ 'customer.userId': userObjectId }),
      db.collection('favorites').countDocuments({ userId: userObjectId }),
      db.collection('bookings').countDocuments({ customerId: userObjectId }),
      db.collection('listings').countDocuments({ userId: userObjectId })
    ]);

    res.status(200).json({
      success: true,
      data: {
        reviewCount,
        favoriteCount,
        bookingCount,
        listingCount
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
router.get('/activity-log', authenticateToken, async (req: Request, res: Response) => {
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
router.delete('/account', authenticateToken, async (req: Request, res: Response) => {
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

export default router;
