import { Router, Request, Response } from 'express';
import dbConnect from '../lib/db';
import { Event } from '../models';

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
router.post('/', async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const event = new Event(req.body);
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

export default router;
