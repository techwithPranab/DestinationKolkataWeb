import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import dbConnect from '../lib/db';
import { Attraction } from '../models';
import { optionalAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// GET /api/attractions - Get all attractions with filters
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    await dbConnect();
    
    // Pagination
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '12');
    const skip = (page - 1) * limit;
    
    // Filters
    const category = req.query.category as string;
    const priceRange = req.query.priceRange as string;
    const rating = req.query.rating as string;
    const location = req.query.location as string;
    const search = req.query.search as string;
    const entryFeeType = req.query.entryFeeType as string;
    const hasGuidedTour = req.query.hasGuidedTour as string;
    const hasAudioGuide = req.query.hasAudioGuide as string;
    const isWheelchairAccessible = req.query.isWheelchairAccessible as string;
    const hasParking = req.query.hasParking as string;
    
    // Build query
    const query: Record<string, any> = {};
    
    if (category) {
      query.category = { $in: category.split(',') };
    }
    
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      query.entryFee = { $gte: min, $lte: max };
    }
    
    if (rating) {
      query.averageRating = { $gte: parseFloat(rating) };
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (entryFeeType) {
      query.entryFeeType = entryFeeType;
    }
    
    if (hasGuidedTour === 'true') {
      query.hasGuidedTour = true;
    }
    
    if (hasAudioGuide === 'true') {
      query.hasAudioGuide = true;
    }
    
    if (isWheelchairAccessible === 'true') {
      query.isWheelchairAccessible = true;
    }
    
    if (hasParking === 'true') {
      query.hasParking = true;
    }
    
    // Execute query
    const attractions = await Attraction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const total = await Attraction.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: attractions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching attractions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attractions',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// POST /api/attractions - Create new attraction
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    await dbConnect();
    
    const attractionData = req.body;
    
    // Create new attraction
    const attraction = new Attraction(attractionData);
    const savedAttraction = await attraction.save();
    
    res.status(201).json({
      success: true,
      data: savedAttraction,
      message: 'Attraction created successfully'
    });
  } catch (error) {
    console.error('Error creating attraction:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create attraction',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// GET /api/attractions/:id - Get single attraction
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    await dbConnect();
    
    const { id } = req.params;
    let attraction;
    
    // Try to find by ObjectId first
    if (mongoose.Types.ObjectId.isValid(id)) {
      attraction = await Attraction.findById(id).lean();
    }
    
    // If not found by ObjectId, try to find by slug
    if (!attraction) {
      attraction = await Attraction.findOne({ slug: id }).lean();
    }
    
    if (!attraction) {
      return res.status(404).json({
        success: false,
        message: 'Attraction not found'
      });
    }
    
    // Increment view count (optional - only if not admin)
    if (!req.user || req.user.role !== 'admin') {
      await Attraction.findByIdAndUpdate((attraction as any)._id, { $inc: { views: 1 } });
    }
    
    // Ensure images field exists and is an array
    const attractionData = {
      ...attraction,
      images: (attraction as any).images || []
    };
    
    res.status(200).json({
      success: true,
      data: attractionData
    });
  } catch (error) {
    console.error('Error fetching attraction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attraction',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

export default router;
