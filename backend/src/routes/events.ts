import { Router, Request, Response } from 'express';
import dbConnect from '../lib/db';
import { Event } from '../models';
import { authenticateToken, requireAdmin, requireCustomerOrAdmin, requireOwnership } from '../middleware/auth';

const router = Router();

// GET /api/events - Get all events
router.get('/', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '12');
    const skip = (page - 1) * limit;
    
    const query: Record<string, any> = {};
    
    // Add filters as needed
    if (req.query.category) {
      query.category = { $in: (req.query.category as string).split(',') };
    }
    
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    const events = await Event.find(query)
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await Event.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: events,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// POST /api/events - Create new event
router.post('/', authenticateToken, requireCustomerOrAdmin, async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const user = (req as any).user;
    
    const event = new Event({
      ...req.body,
      createdBy: user?.userId // Track who created this listing
    });
    const savedEvent = await event.save();
    
    res.status(201).json({
      success: true,
      data: savedEvent,
      message: 'Event created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create event',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// GET /api/events/:id - Get single event
router.get('/:id', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const event = await Event.findById(req.params.id).lean();
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event'
    });
  }
});

// PUT /api/events/:id - Update an event
router.put('/:id', authenticateToken, requireCustomerOrAdmin, requireOwnership(Event, 'id'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }

    await dbConnect();

    // Handle images field - convert string URL to proper image object format if needed
    let updateData = { ...body, updatedAt: new Date() };
    if (body.images && typeof body.images === 'string') {
      // If images is a string URL, convert to array format
      updateData.images = [{ url: body.images, alt: body.name || 'Event image', isPrimary: true }];
    }

    // Update the event
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// DELETE /api/events/:id - Delete an event
router.delete('/:id', authenticateToken, requireCustomerOrAdmin, requireOwnership(Event, 'id'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }

    await dbConnect();

    // Delete the event
    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
      data: deletedEvent
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

export default router;
