import { Router, Request, Response } from 'express';
import { connectToDatabase } from '../lib/mongodb';
import { ObjectId } from 'mongodb';
import { authenticateToken } from '../middleware/auth';

const router = Router();

interface Submission {
  _id?: ObjectId;
  userId: ObjectId;
  type: 'place' | 'event' | 'business' | 'general-inquiry' | 'correction';
  title: string;
  description: string;
  category?: string;
  location?: {
    address: string;
    coordinates?: [number, number];
  };
  contact?: {
    name: string;
    email: string;
    phone?: string;
  };
  attachments?: string[];
  status: 'pending' | 'approved' | 'rejected' | 'in-review';
  priority?: 'low' | 'medium' | 'high';
  adminNotes?: string;
  adminId?: ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// GET - Get all submissions (admin can see all, users see only their own)
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;
    const { status, type, sortBy = 'createdAt', limit = 20, skip = 0 } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const filter: any = {};

    // Regular users can only see their own submissions
    if (userRole !== 'admin') {
      filter.userId = new ObjectId(userId);
    }

    if (status) {
      filter.status = status;
    }

    if (type) {
      filter.type = type;
    }

    const sortOptions: any = {};
    switch (sortBy) {
      case 'oldest':
        sortOptions.createdAt = 1;
        break;
      case 'status':
        sortOptions.status = 1;
        break;
      default:
        sortOptions.createdAt = -1;
    }

    const submissions = await db
      .collection('submissions')
      .find(filter)
      .sort(sortOptions)
      .limit(Number(limit))
      .skip(Number(skip))
      .toArray();

    const totalCount = await db
      .collection('submissions')
      .countDocuments(filter);

    res.status(200).json({
      success: true,
      data: submissions,
      pagination: {
        total: totalCount,
        limit: Number(limit),
        skip: Number(skip)
      }
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions'
    });
  }
});

// GET - Get single submission
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;
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

    // Check permissions
    if (userRole !== 'admin' && submission.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this submission'
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

// POST - Create new submission
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const userId = (req as any).user?.userId;
    const { type, title, description, category, location, contact, attachments } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Validation
    if (!type || !title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: type, title, description'
      });
    }

    const validTypes = ['place', 'event', 'business', 'general-inquiry', 'correction'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid submission type'
      });
    }

    const newSubmission: Submission = {
      userId: new ObjectId(userId),
      type,
      title: title.trim(),
      description: description.trim(),
      category: category?.trim(),
      location,
      contact,
      attachments: attachments || [],
      status: 'pending',
      priority: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db
      .collection('submissions')
      .insertOne(newSubmission);

    res.status(201).json({
      success: true,
      data: {
        _id: result.insertedId,
        ...newSubmission
      },
      message: 'Submission created successfully'
    });
  } catch (error) {
    console.error('Create submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create submission'
    });
  }
});

// PUT - Update submission (user can only update if pending, admin can always update)
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;
    const { id } = req.params;
    const updates = req.body;

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

    // Permission check
    if (userRole !== 'admin') {
      if (submission.userId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to update this submission'
        });
      }

      if (submission.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Can only update pending submissions'
        });
      }

      // Users can only update certain fields
      delete updates.status;
      delete updates.adminNotes;
      delete updates.adminId;
      delete updates.priority;
    }

    // Don't allow updating createdAt
    delete updates.createdAt;

    const result = await db
      .collection('submissions')
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...updates,
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      );

    if (!result || !result.value) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.value,
      message: 'Submission updated successfully'
    });
  } catch (error) {
    console.error('Update submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update submission'
    });
  }
});

// PUT - Review submission (admin only)
router.put('/:id/review', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const userRole = (req as any).user?.role;
    const adminId = (req as any).user?.userId;
    const { id } = req.params;
    const { status, adminNotes, priority } = req.body;

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid submission ID'
      });
    }

    const validStatuses = ['approved', 'rejected', 'in-review'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const result = await db
      .collection('submissions')
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            status,
            adminNotes: adminNotes || '',
            priority: priority || 'medium',
            adminId: new ObjectId(adminId),
            reviewedAt: new Date(),
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      );

    if (!result || !result.value) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.value,
      message: 'Submission reviewed successfully'
    });
  } catch (error) {
    console.error('Review submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to review submission'
    });
  }
});

// DELETE - Delete submission (user can delete pending, admin can delete any)
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;
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

    // Permission check
    if (userRole !== 'admin') {
      if (submission.userId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to delete this submission'
        });
      }

      if (submission.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Can only delete pending submissions'
        });
      }
    }

    const result = await db
      .collection('submissions')
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete submission'
    });
  }
});

export default router;
