import { Router, Request, Response } from 'express';
import { connectToDatabase } from '../lib/mongodb';
import { ObjectId } from 'mongodb';
import { authenticateToken } from '../middleware/auth';

const router = Router();

interface Report {
  _id?: ObjectId;
  userId: ObjectId;
  itemId: ObjectId;
  itemType: 'review' | 'listing' | 'comment' | 'user' | 'content';
  reason: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  actionTaken?: string;
  resolvedAt?: Date;
  adminId?: ObjectId;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// GET - Get all reports (admin only)
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const userRole = (req as any).user?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { status, severity, itemType, sortBy = 'createdAt', limit = 20, skip = 0 } = req.query;

    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (severity) {
      filter.severity = severity;
    }

    if (itemType) {
      filter.itemType = itemType;
    }

    const sortOptions: any = {};
    switch (sortBy) {
      case 'oldest':
        sortOptions.createdAt = 1;
        break;
      case 'severity':
        sortOptions.severity = -1;
        sortOptions.createdAt = -1;
        break;
      default:
        sortOptions.createdAt = -1;
    }

    const reports = await db
      .collection('reports')
      .find(filter)
      .sort(sortOptions)
      .limit(Number(limit))
      .skip(Number(skip))
      .toArray();

    const totalCount = await db
      .collection('reports')
      .countDocuments(filter);

    // Get breakdown by status and severity
    const statusBreakdown = await db
      .collection('reports')
      .aggregate([
        { $match: filter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
      .toArray();

    const severityBreakdown = await db
      .collection('reports')
      .aggregate([
        { $match: filter },
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ])
      .toArray();

    res.status(200).json({
      success: true,
      data: reports,
      analytics: {
        statusBreakdown: Object.fromEntries(statusBreakdown.map(s => [s._id, s.count])),
        severityBreakdown: Object.fromEntries(severityBreakdown.map(s => [s._id, s.count]))
      },
      pagination: {
        total: totalCount,
        limit: Number(limit),
        skip: Number(skip)
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports'
    });
  }
});

// GET - Get user's own reports
router.get('/user/my-reports', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const userId = (req as any).user?.userId;
    const { status, limit = 20, skip = 0 } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const filter: any = { userId: new ObjectId(userId) };

    if (status) {
      filter.status = status;
    }

    const reports = await db
      .collection('reports')
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .toArray();

    const totalCount = await db
      .collection('reports')
      .countDocuments(filter);

    res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        total: totalCount,
        limit: Number(limit),
        skip: Number(skip)
      }
    });
  } catch (error) {
    console.error('Get user reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user reports'
    });
  }
});

// GET - Get single report
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID'
      });
    }

    const report = await db
      .collection('reports')
      .findOne({ _id: new ObjectId(id) });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check permissions
    if (userRole !== 'admin' && report.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this report'
      });
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report'
    });
  }
});

// POST - Create new report
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const userId = (req as any).user?.userId;
    const { itemId, itemType, reason, description, severity, attachments } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Validation
    if (!itemId || !itemType || !reason || !description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: itemId, itemType, reason, description'
      });
    }

    const validItemTypes = ['review', 'listing', 'comment', 'user', 'content'];
    if (!validItemTypes.includes(itemType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item type'
      });
    }

    const validSeverities = ['low', 'medium', 'high', 'critical'];
    const reportSeverity = validSeverities.includes(severity) ? severity : 'medium';

    // Check for duplicate reports from same user
    const existingReport = await db
      .collection('reports')
      .findOne({
        userId: new ObjectId(userId),
        itemId: new ObjectId(itemId),
        status: { $in: ['open', 'investigating'] }
      });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'You already have an open report for this item'
      });
    }

    const newReport: Report = {
      userId: new ObjectId(userId),
      itemId: new ObjectId(itemId),
      itemType,
      reason,
      description: description.trim(),
      severity: reportSeverity,
      status: 'open',
      attachments: attachments || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db
      .collection('reports')
      .insertOne(newReport);

    res.status(201).json({
      success: true,
      data: {
        _id: result.insertedId,
        ...newReport
      },
      message: 'Report submitted successfully'
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create report'
    });
  }
});

// PUT - Update report status (admin only)
router.put('/:id/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const userRole = (req as any).user?.role;
    const adminId = (req as any).user?.userId;
    const { id } = req.params;
    const { status, actionTaken } = req.body;

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID'
      });
    }

    const validStatuses = ['open', 'investigating', 'resolved', 'dismissed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const updateData: any = {
      status,
      adminId: new ObjectId(adminId),
      updatedAt: new Date()
    };

    if (actionTaken) {
      updateData.actionTaken = actionTaken;
    }

    if (status === 'resolved' || status === 'dismissed') {
      updateData.resolvedAt = new Date();
    }

    const result = await db
      .collection('reports')
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );

    if (!result || !result.value) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.value,
      message: 'Report status updated successfully'
    });
  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update report status'
    });
  }
});

// GET - Get report statistics (admin only)
router.get('/stats/overview', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const userRole = (req as any).user?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const [totalReports, openReports, investigatingReports, resolvedReports] = await Promise.all([
      db.collection('reports').countDocuments({}),
      db.collection('reports').countDocuments({ status: 'open' }),
      db.collection('reports').countDocuments({ status: 'investigating' }),
      db.collection('reports').countDocuments({ status: 'resolved' })
    ]);

    const itemTypeBreakdown = await db
      .collection('reports')
      .aggregate([
        { $group: { _id: '$itemType', count: { $sum: 1 } } }
      ])
      .toArray();

    const severityBreakdown = await db
      .collection('reports')
      .aggregate([
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ])
      .toArray();

    res.status(200).json({
      success: true,
      data: {
        totalReports,
        openReports,
        investigatingReports,
        resolvedReports,
        itemTypeBreakdown: Object.fromEntries(itemTypeBreakdown.map(i => [i._id, i.count])),
        severityBreakdown: Object.fromEntries(severityBreakdown.map(s => [s._id, s.count]))
      }
    });
  } catch (error) {
    console.error('Get report statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report statistics'
    });
  }
});

export default router;
