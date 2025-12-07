import { Router, Request, Response } from 'express';
import { authenticateToken as auth } from '../middleware/auth';
import { Sports } from '../models';
import mongoose from 'mongoose';

const router = Router();



// GET /api/sports - Get all sports facilities with filtering and pagination
router.get('/', async (req: Request, res: Response) => {
  console.log('GET /api/sports called with query:', req.query);
  
  try {
    // Check database connection
    const dbState = mongoose.connection.readyState;
    console.log('Database connection state:', dbState); // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    
    if (dbState !== 1) {
      return res.status(500).json({
        success: false,
        message: 'Database not connected'
      });
    }
    const {
      page = 1,
      limit = 10,
      category,
      sport,
      city,
      search,
      latitude,
      longitude,
      radius = 10,
      featured,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build filter object
    const filter: any = { status: 'active' };
    
    if (category) {
      filter.category = category;
    }
    
    if (sport) {
      filter.sport = new RegExp(sport as string, 'i');
    }
    
    if (city) {
      filter['address.city'] = new RegExp(city as string, 'i');
    }
    
    if (search) {
      filter.$or = [
        { name: new RegExp(search as string, 'i') },
        { description: new RegExp(search as string, 'i') },
        { sport: new RegExp(search as string, 'i') },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }
    
    if (featured !== undefined) {
      filter.featured = featured === 'true';
    }

    let query = Sports.find(filter);

    // Geographic search if coordinates provided
    if (latitude && longitude) {
      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);
      const radiusInMeters = parseFloat(radius as string) * 1000; // Convert km to meters
      
      query = Sports.aggregate([
        {
          $geoNear: {
            near: { type: "Point", coordinates: [lng, lat] },
            distanceField: "distance",
            maxDistance: radiusInMeters,
            query: filter,
            spherical: true
          }
        },
        {
          $addFields: {
            distanceKm: { $round: [{ $divide: ["$distance", 1000] }, 2] }
          }
        }
      ]) as any;
    } else {
      // Regular sorting for non-geographic queries
      const sortOptions: any = {};
      sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
      query = query.sort(sortOptions);
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    let sports, total;

    if (latitude && longitude) {
      // For aggregation pipeline
      const results = await (query as any).skip(skip).limit(limitNum);
      sports = results;
      total = await Sports.countDocuments(filter);
    } else {
      // For regular query
      sports = await (query as any).skip(skip).limit(limitNum);
      total = await Sports.countDocuments(filter);
    }

    console.log('Sports query results:', { total, sportsCount: sports.length });

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      facilities: sports,
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
        sport,
        city,
        search,
        featured
      }
    });

  } catch (error) {
    console.error('Error fetching sports facilities:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sports facilities',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// GET /api/sports/categories - Get all unique categories and sports
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await Sports.distinct('category', { status: 'active' });
    const sportsTypes = await Sports.distinct('sport', { status: 'active' });
    const cities = await Sports.distinct('address.city', { status: 'active' });

    res.json({
      success: true,
      data: {
        categories: categories.sort(),
        sports: sportsTypes.sort(),
        cities: cities.sort()
      }
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// GET /api/sports/:id - Get specific sports facility
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sports facility ID'
      });
    }

    const sportsFacility = await Sports.findById(id);

    if (!sportsFacility) {
      return res.status(404).json({
        success: false,
        message: 'Sports facility not found'
      });
    }

    res.json({
      success: true,
      data: sportsFacility
    });

  } catch (error) {
    console.error('Error fetching sports facility:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sports facility',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// POST /api/sports - Create new sports facility (admin only)
router.post('/', auth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const sportsFacility = new Sports(req.body);
    await sportsFacility.save();

    res.status(201).json({
      success: true,
      message: 'Sports facility created successfully',
      data: sportsFacility
    });

  } catch (error) {
    console.error('Error creating sports facility:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating sports facility',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// PUT /api/sports/:id - Update sports facility (admin only)
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
        message: 'Invalid sports facility ID'
      });
    }

    const sportsFacility = await Sports.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!sportsFacility) {
      return res.status(404).json({
        success: false,
        message: 'Sports facility not found'
      });
    }

    res.json({
      success: true,
      message: 'Sports facility updated successfully',
      data: sportsFacility
    });

  } catch (error) {
    console.error('Error updating sports facility:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating sports facility',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// DELETE /api/sports/:id - Delete sports facility (admin only)
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
        message: 'Invalid sports facility ID'
      });
    }

    const sportsFacility = await Sports.findByIdAndDelete(id);

    if (!sportsFacility) {
      return res.status(404).json({
        success: false,
        message: 'Sports facility not found'
      });
    }

    res.json({
      success: true,
      message: 'Sports facility deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting sports facility:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting sports facility',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

export default router;
