import express, { Request, Response } from 'express';
import DataIngestionHistory from '../models/DataIngestionHistory';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import dbConnect from '../lib/db';

const router = express.Router();

// GET /api/data-ingestion-history - Get all ingestion history with filters and pagination
router.get('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    await dbConnect();

    const { 
      page = 1, 
      limit = 20, 
      dataType, 
      operation, 
      status,
      startDate,
      endDate
    } = req.query;

    // Build filter query
    const filter: any = {};
    if (dataType) filter.dataType = dataType;
    if (operation) filter.operation = operation;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.startTime = {};
      if (startDate) filter.startTime.$gte = new Date(startDate as string);
      if (endDate) filter.startTime.$lte = new Date(endDate as string);
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [history, total] = await Promise.all([
      DataIngestionHistory.find(filter)
        .sort({ startTime: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      DataIngestionHistory.countDocuments(filter)
    ]);

    // Get summary statistics
    const stats = await DataIngestionHistory.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalProcessed: { $sum: '$recordsProcessed' },
          totalSuccessful: { $sum: '$recordsSuccessful' },
          totalFailed: { $sum: '$recordsFailed' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: history,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      },
      stats
    });
  } catch (error) {
    console.error('Error fetching ingestion history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ingestion history',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// GET /api/data-ingestion-history/:id - Get single ingestion history by ID
router.get('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    await dbConnect();

    const { id } = req.params;

    const history = await DataIngestionHistory.findById(id);

    if (!history) {
      return res.status(404).json({
        success: false,
        message: 'Ingestion history not found'
      });
    }

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error fetching ingestion history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ingestion history',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// POST /api/data-ingestion-history - Create new ingestion history record
router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    await dbConnect();

    const historyData = req.body;

    // Calculate duration if endTime is provided
    if (historyData.endTime && historyData.startTime) {
      historyData.duration = new Date(historyData.endTime).getTime() - new Date(historyData.startTime).getTime();
    }

    const history = new DataIngestionHistory(historyData);
    await history.save();

    res.status(201).json({
      success: true,
      data: history,
      message: 'Ingestion history created successfully'
    });
  } catch (error) {
    console.error('Error creating ingestion history:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create ingestion history',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// PUT /api/data-ingestion-history/:id - Update ingestion history (for completing ongoing operations)
router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    await dbConnect();

    const { id } = req.params;
    const updateData = req.body;

    // Calculate duration if endTime is provided
    if (updateData.endTime && !updateData.duration) {
      const history = await DataIngestionHistory.findById(id);
      if (history) {
        updateData.duration = new Date(updateData.endTime).getTime() - history.startTime.getTime();
      }
    }

    const history = await DataIngestionHistory.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!history) {
      return res.status(404).json({
        success: false,
        message: 'Ingestion history not found'
      });
    }

    res.status(200).json({
      success: true,
      data: history,
      message: 'Ingestion history updated successfully'
    });
  } catch (error) {
    console.error('Error updating ingestion history:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update ingestion history',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// DELETE /api/data-ingestion-history/:id - Delete ingestion history
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    await dbConnect();

    const { id } = req.params;

    const history = await DataIngestionHistory.findByIdAndDelete(id);

    if (!history) {
      return res.status(404).json({
        success: false,
        message: 'Ingestion history not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Ingestion history deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting ingestion history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete ingestion history',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// GET /api/data-ingestion-history/stats/summary - Get summary statistics
router.get('/stats/summary', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    await dbConnect();

    const { startDate, endDate } = req.query;

    const filter: any = {};
    if (startDate || endDate) {
      filter.startTime = {};
      if (startDate) filter.startTime.$gte = new Date(startDate as string);
      if (endDate) filter.startTime.$lte = new Date(endDate as string);
    }

    const summary = await DataIngestionHistory.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalOperations: { $sum: 1 },
          totalProcessed: { $sum: '$recordsProcessed' },
          totalSuccessful: { $sum: '$recordsSuccessful' },
          totalFailed: { $sum: '$recordsFailed' },
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);

    const byDataType = await DataIngestionHistory.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$dataType',
          count: { $sum: 1 },
          totalProcessed: { $sum: '$recordsProcessed' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const byStatus = await DataIngestionHistory.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overall: summary[0] || {
          totalOperations: 0,
          totalProcessed: 0,
          totalSuccessful: 0,
          totalFailed: 0,
          avgDuration: 0
        },
        byDataType,
        byStatus
      }
    });
  } catch (error) {
    console.error('Error fetching summary stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch summary statistics',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

export default router;
