import { Router, Request, Response } from 'express';
import { authenticateToken as auth } from '../middleware/auth';
import { Travel, TravelTip } from '../models';
import mongoose from 'mongoose';

const router = Router();





// GET /api/travel - Get all travel information with filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      transportType,
      from,
      to,
      search,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build filter object
    const filter: any = { isActive: true };
    
    if (category) {
      filter.category = category;
    }
    
    if (transportType) {
      filter.transportType = transportType;
    }
    
    if (from) {
      filter.from = new RegExp(from as string, 'i');
    }
    
    if (to) {
      filter.to = new RegExp(to as string, 'i');
    }
    
    if (search) {
      filter.$or = [
        { name: new RegExp(search as string, 'i') },
        { description: new RegExp(search as string, 'i') },
        { from: new RegExp(search as string, 'i') },
        { to: new RegExp(search as string, 'i') }
      ];
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const travelInfo = await Travel.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const total = await Travel.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: travelInfo,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      },
      filters: {
        category,
        transportType,
        from,
        to,
        search
      }
    });

  } catch (error) {
    console.error('Error fetching travel information:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching travel information',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// GET /api/travel/types - Get unique transport types and categories
router.get('/types', async (req: Request, res: Response) => {
  try {
    const categories = await Travel.distinct('category', { isActive: true });
    const transportTypes = await Travel.distinct('transportType', { isActive: true });
    const fromLocations = await Travel.distinct('from', { isActive: true });
    const toLocations = await Travel.distinct('to', { isActive: true });

    res.json({
      success: true,
      data: {
        categories: categories.sort(),
        transportTypes: transportTypes.sort(),
        fromLocations: fromLocations.sort(),
        toLocations: toLocations.sort()
      }
    });

  } catch (error) {
    console.error('Error fetching travel types:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching travel types',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// GET /api/travel/tips - Get travel tips with filtering
router.get('/tips', async (req: Request, res: Response) => {
  try {
    const {
      category,
      priority,
      limit = 20,
      sortBy = 'priority',
      sortOrder = 'asc'
    } = req.query;

    // Build filter object
    const filter: any = { isActive: true };
    
    if (category) {
      filter.category = category;
    }
    
    if (priority) {
      filter.priority = parseInt(priority as string);
    }

    // Sorting
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const tips = await TravelTip.find(filter)
      .sort(sortOptions)
      .limit(parseInt(limit as string));

    const categories = await TravelTip.distinct('category', { isActive: true });

    res.json({
      success: true,
      data: tips,
      categories: categories.sort(),
      count: tips.length
    });

  } catch (error) {
    console.error('Error fetching travel tips:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching travel tips',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// GET /api/travel/:id - Get specific travel information
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid travel information ID'
      });
    }

    const travelInfo = await Travel.findById(id);

    if (!travelInfo) {
      return res.status(404).json({
        success: false,
        message: 'Travel information not found'
      });
    }

    res.json({
      success: true,
      data: travelInfo
    });

  } catch (error) {
    console.error('Error fetching travel information:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching travel information',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// POST /api/travel - Create new travel information (admin only)
router.post('/', auth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const travelInfo = new Travel(req.body);
    await travelInfo.save();

    res.status(201).json({
      success: true,
      message: 'Travel information created successfully',
      data: travelInfo
    });

  } catch (error) {
    console.error('Error creating travel information:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating travel information',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// POST /api/travel/tips - Create new travel tip (admin only)
router.post('/tips', auth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const tip = new TravelTip(req.body);
    await tip.save();

    res.status(201).json({
      success: true,
      message: 'Travel tip created successfully',
      data: tip
    });

  } catch (error) {
    console.error('Error creating travel tip:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating travel tip',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// PUT /api/travel/:id - Update travel information (admin only)
router.put('/:id', auth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid travel information ID'
      });
    }

    const travelInfo = await Travel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!travelInfo) {
      return res.status(404).json({
        success: false,
        message: 'Travel information not found'
      });
    }

    res.json({
      success: true,
      message: 'Travel information updated successfully',
      data: travelInfo
    });

  } catch (error) {
    console.error('Error updating travel information:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating travel information',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// DELETE /api/travel/:id - Delete travel information (admin only)
router.delete('/:id', auth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid travel information ID'
      });
    }

    const travelInfo = await Travel.findByIdAndDelete(id);

    if (!travelInfo) {
      return res.status(404).json({
        success: false,
        message: 'Travel information not found'
      });
    }

    res.json({
      success: true,
      message: 'Travel information deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting travel information:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting travel information',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

export default router;
