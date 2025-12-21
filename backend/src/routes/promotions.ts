import { Router, Request, Response } from 'express';
import { authenticateToken as auth, requireCustomerOrAdmin, requireOwnership } from '../middleware/auth';
import { Promotion } from '../models';
import mongoose from 'mongoose';

const router = Router();



// GET /api/promotions - Get all active promotions with filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      businessType,
      active,
      search,
      sortBy = 'validUntil',
      sortOrder = 'asc',
      includeExpired = false
    } = req.query;

    // Build filter object
    const filter: any = {};
    
    if (businessType) {
      filter.businessType = businessType;
    }
    
    if (active !== undefined) {
      filter.isActive = active === 'true';
    }
    
    if (!includeExpired || includeExpired === 'false') {
      filter.validUntil = { $gte: new Date() };
    }
    
    if (search) {
      filter.$or = [
        { title: new RegExp(search as string, 'i') },
        { description: new RegExp(search as string, 'i') },
        { code: new RegExp(search as string, 'i') }
      ];
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const promotions = await Promotion.find(filter)
      .populate('business', 'name')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const total = await Promotion.countDocuments(filter);
    console.log('Total promotions found:', total);
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: promotions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      },
      filters: {
        businessType,
        active,
        search,
        includeExpired
      }
    });

  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching promotions',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// GET /api/promotions/active - Get currently active promotions
router.get('/active', async (req: Request, res: Response) => {
  try {
    const { businessType, limit = 20 } = req.query;
    
    const filter: any = {
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    };
    
    if (businessType) {
      filter.businessType = businessType;
    }

    const promotions = await Promotion.find(filter)
      .populate('business', 'name location')
      .sort({ validUntil: 1 })
      .limit(parseInt(limit as string));

    res.json({
      success: true,
      data: promotions,
      count: promotions.length
    });

  } catch (error) {
    console.error('Error fetching active promotions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active promotions',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// GET /api/promotions/validate/:code - Validate a promotion code
router.get('/validate/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const { businessType, amount } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Promotion code is required'
      });
    }

    const filter: any = {
      code: code.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    };

    if (businessType) {
      filter.businessType = businessType;
    }

    const promotion = await Promotion.findOne(filter).populate('business', 'name');

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired promotion code'
      });
    }

    // Check usage limit
    if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'Promotion code usage limit exceeded'
      });
    }

    // Check minimum amount requirement
    if (amount && promotion.minAmount && parseFloat(amount as string) < promotion.minAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum amount of ₹${promotion.minAmount} required for this promotion`
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (promotion.discountPercent && amount) {
      discountAmount = (parseFloat(amount as string) * promotion.discountPercent) / 100;
      if (promotion.maxDiscount && discountAmount > promotion.maxDiscount) {
        discountAmount = promotion.maxDiscount;
      }
    } else if (promotion.discountAmount) {
      discountAmount = promotion.discountAmount;
    }

    res.json({
      success: true,
      data: {
        promotion,
        discountAmount,
        finalAmount: amount ? parseFloat(amount as string) - discountAmount : null
      },
      message: 'Promotion code is valid'
    });

  } catch (error) {
    console.error('Error validating promotion code:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating promotion code',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// GET /api/promotions/:id - Get specific promotion
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid promotion ID'
      });
    }

    const promotion = await Promotion.findById(id).populate('business', 'name location contact');

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    res.json({
      success: true,
      data: promotion
    });

  } catch (error) {
    console.error('Error fetching promotion:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching promotion',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// POST /api/promotions - Create new promotion (business/admin only)
// POST /api/promotions - Create new promotion
router.post('/', auth, requireCustomerOrAdmin, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    // Validate required fields
    const { title, description, business, businessType, validFrom, validUntil } = req.body;
    
    if (!title || !description || !business || !businessType || !validFrom || !validUntil) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Generate unique code if not provided
    if (!req.body.code) {
      req.body.code = `PROMO${Date.now().toString().slice(-6)}`;
    }

    const promotion = new Promotion({
      ...req.body,
      createdBy: user?.userId // Track who created this listing
    });
    await promotion.save();

    res.status(201).json({
      success: true,
      message: 'Promotion created successfully',
      data: promotion
    });

  } catch (error) {
    console.error('Error creating promotion:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating promotion',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// PUT /api/promotions/:id - Update promotion
router.put('/:id', auth, requireCustomerOrAdmin, requireOwnership(Promotion, 'id'), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const body = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid promotion ID'
      });
    }

    // Handle images field - convert string URL to proper image object format if needed
    let updateData = { ...body, updatedAt: new Date() };
    if (body.images && typeof body.images === 'string') {
      // If images is a string URL, convert to array format
      updateData.images = [{ url: body.images, alt: body.name || 'Promotion image', isPrimary: true }];
    }

    const promotion = await Promotion.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    res.json({
      success: true,
      message: 'Promotion updated successfully',
      data: promotion
    });

  } catch (error) {
    console.error('Error updating promotion:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating promotion',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// POST /api/promotions/:id/use - Mark promotion as used (increment usage count)
router.post('/:id/use', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid promotion ID'
      });
    }

    const promotion = await Promotion.findByIdAndUpdate(
      id,
      { $inc: { usedCount: 1 } },
      { new: true }
    );

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    res.json({
      success: true,
      message: 'Promotion usage recorded',
      data: { usedCount: promotion.usedCount }
    });

  } catch (error) {
    console.error('Error recording promotion usage:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording promotion usage',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// DELETE /api/promotions/:id - Delete promotion
router.delete('/:id', auth, requireCustomerOrAdmin, requireOwnership(Promotion, 'id'), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid promotion ID'
      });
    }

    const promotion = await Promotion.findByIdAndDelete(id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    res.json({
      success: true,
      message: 'Promotion deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting promotion:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting promotion',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

export default router;
