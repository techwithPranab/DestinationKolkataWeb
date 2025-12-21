import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import dbConnect from '../lib/db';
import { Restaurant } from '../models';
import { authenticateToken, optionalAuth, requireAdmin, requireCustomerOrAdmin, requireOwnership } from '../middleware/auth';
import { PipelineStage } from 'mongoose';

const router = Router();

// Sample restaurant data
const sampleRestaurants = [
  {
    name: '6 Ballygunge Place',
    description: 'Authentic Bengali cuisine in a heritage setting. Experience traditional flavors with modern presentation.',
    shortDescription: 'Authentic Bengali cuisine in heritage setting',
    images: [
      {
        url: '/images/6-ballygunge-place.jpg',
        alt: '6 Ballygunge Place interior',
        isPrimary: true
      }
    ],
    location: {
      type: 'Point',
      coordinates: [88.3654, 22.5275]
    },
    address: {
      street: '6 Ballygunge Place',
      area: 'Ballygunge',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700019'
    },
    contact: {
      phone: ['+91-33-2287-0000'],
      email: 'info@6ballygungeplace.com',
      website: 'https://www.6ballygungeplace.com'
    },
    rating: {
      average: 4.6,
      count: 1245
    },
    amenities: ['AC', 'Parking', 'WiFi', 'Outdoor Seating'],
    tags: ['bengali', 'heritage', 'fine-dining'],
    status: 'active',
    featured: true,
    promoted: true,
    cuisine: ['Bengali', 'Indian'],
    priceRange: 'Fine Dining',
    openingHours: {
      monday: { open: '12:00', close: '23:00', closed: false },
      tuesday: { open: '12:00', close: '23:00', closed: false },
      wednesday: { open: '12:00', close: '23:00', closed: false },
      thursday: { open: '12:00', close: '23:00', closed: false },
      friday: { open: '12:00', close: '23:00', closed: false },
      saturday: { open: '12:00', close: '23:00', closed: false },
      sunday: { open: '12:00', close: '23:00', closed: false }
    },
    views: 3200
  },
  {
    name: 'Kewpies Kitchen',
    description: 'Home-style Bengali cooking in a cozy, family-like atmosphere. Known for authentic fish curry and traditional sweets.',
    shortDescription: 'Home-style Bengali cooking',
    images: [
      {
        url: '/images/kewpies-kitchen.jpg',
        alt: 'Kewpies Kitchen dining area',
        isPrimary: true
      }
    ],
    location: {
      type: 'Point',
      coordinates: [88.3476, 22.5488]
    },
    address: {
      street: '2 Elgin Lane',
      area: 'Elgin Road',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700020'
    },
    contact: {
      phone: ['+91-33-2223-1600'],
      email: 'kewpieskitchen@gmail.com'
    },
    rating: {
      average: 4.4,
      count: 890
    },
    amenities: ['AC', 'WiFi'],
    tags: ['bengali', 'home-style', 'authentic'],
    status: 'active',
    featured: true,
    promoted: false,
    cuisine: ['Bengali'],
    priceRange: 'Casual Dining',
    openingHours: {
      monday: { open: '12:00', close: '22:00', closed: false },
      tuesday: { open: '12:00', close: '22:00', closed: false },
      wednesday: { open: '12:00', close: '22:00', closed: false },
      thursday: { open: '12:00', close: '22:00', closed: false },
      friday: { open: '12:00', close: '22:00', closed: false },
      saturday: { open: '12:00', close: '22:00', closed: false },
      sunday: { open: '12:00', close: '22:00', closed: false }
    },
    views: 2100
  }
];

// Function to create sample restaurants if none exist
async function createSampleRestaurantsIfNeeded() {
  const restaurantCount = await Restaurant.countDocuments();
  if (restaurantCount === 0) {
    try {
      await Restaurant.insertMany(sampleRestaurants);
      console.log('Sample restaurants created successfully');
    } catch (error) {
      console.error('Error creating sample restaurants:', error);
    }
  }
}

// Function to build query from request parameters
function buildRestaurantQuery(query: any) {
  const mongoQuery: Record<string, any> = {};
  
  // Handle status filtering
  if (query.status && query.status !== 'all') {
    mongoQuery.status = query.status;
  } else if (!query.status) {
    mongoQuery.status = 'active';
  }

  // Cuisine filter
  if (query.cuisine) {
    mongoQuery.cuisine = { $in: query.cuisine.split(',') };
  }

  // Price range filter
  if (query.priceRange) {
    mongoQuery.priceRange = query.priceRange;
  }

  // Rating filter
  if (query.rating) {
    mongoQuery['rating.average'] = { $gte: parseFloat(query.rating) };
  }

  // Amenities filter
  if (query.amenities) {
    mongoQuery.amenities = { $in: query.amenities.split(',') };
  }

  // Search filter
  if (query.search) {
    mongoQuery.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } },
      { 'address.area': { $regex: query.search, $options: 'i' } },
      { cuisine: { $in: [new RegExp(query.search, 'i')] } },
      { tags: { $in: [new RegExp(query.search, 'i')] } }
    ];
  }

  return mongoQuery;
}

// GET /api/restaurants - Get all restaurants with filters
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    await dbConnect();
    
    // Create sample restaurants if needed
    await createSampleRestaurantsIfNeeded();

    // Pagination
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '12');
    const skip = (page - 1) * limit;

    // Location-based search
    const lat = parseFloat(req.query.lat as string || '0');
    const lng = parseFloat(req.query.lng as string || '0');
    const distance = parseInt(req.query.distance as string || '50');

    // Build query
    const query = buildRestaurantQuery(req.query);
    
    let restaurants;
    let total;

    // Geographic search if coordinates provided
    if (lat && lng) {
      const pipeline: PipelineStage[] = [
        {
          $geoNear: {
            near: {
              type: 'Point' as const,
              coordinates: [lng, lat] as [number, number]
            },
            distanceField: 'distance',
            maxDistance: distance * 1000,
            spherical: true,
            query: query
          }
        },
        { $skip: skip },
        { $limit: limit }
      ];

      restaurants = await Restaurant.aggregate(pipeline);
      
      const totalPipeline: PipelineStage[] = [
        {
          $geoNear: {
            near: { type: 'Point' as const, coordinates: [lng, lat] as [number, number] },
            distanceField: 'distance',
            maxDistance: distance * 1000,
            spherical: true,
            query: query
          }
        },
        { $count: 'total' }
      ];
      const totalResults = await Restaurant.aggregate(totalPipeline);
      total = totalResults[0]?.total || 0;
    } else {
      // Regular search without geography
      restaurants = await Restaurant.find(query)
        .sort({ featured: -1, promoted: -1, 'rating.average': -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      total = await Restaurant.countDocuments(query);
    }

    // Get overall stats
    const overallTotal = await Restaurant.countDocuments();
    const activeCount = await Restaurant.countDocuments({ status: 'active' });

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      restaurants,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        activeCount,
        overallTotal
      },
      filters: {
        cuisine: req.query.cuisine ? (req.query.cuisine as string).split(',') : [],
        priceRange: req.query.priceRange,
        rating: req.query.rating,
        amenities: req.query.amenities ? (req.query.amenities as string).split(',') : [],
        search: req.query.search,
        location: lat && lng ? { lat, lng, distance } : null
      }
    });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch restaurants',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// POST /api/restaurants - Create new restaurant
// POST /api/restaurants - Create new restaurant
router.post('/', authenticateToken, requireCustomerOrAdmin, async (req: Request, res: Response) => {
  try {
    await dbConnect();
    
    const body = req.body;
    const user = (req as any).user;
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'location', 'cuisine'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Create new restaurant with createdBy field
    const restaurant = new Restaurant({
      ...body,
      createdBy: user?.userId, // Track who created this listing
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await restaurant.save();

    res.status(201).json({
      success: true,
      data: restaurant,
      message: 'Restaurant submitted successfully. It will be reviewed before being published.'
    });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create restaurant',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// PUT /api/restaurants/:id - Update restaurant
router.put('/:id', authenticateToken, requireCustomerOrAdmin, requireOwnership(Restaurant, 'id'), async (req: Request, res: Response) => {
  try {
    await dbConnect();

    const { id } = req.params;
    const body = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid restaurant ID'
      });
    }

    // Handle images field - convert string URL to proper image object format if needed
    let updateData = { ...body, updatedAt: new Date() };
    
    // Debug logging
    console.log('Update request body.images type:', typeof body.images);
    console.log('Update request body.images value:', JSON.stringify(body.images));
    
    if (body.images) {
      if (typeof body.images === 'string') {
        // If images is a string URL, convert to array format
        updateData.images = [{ url: body.images, alt: body.name || 'Restaurant image', isPrimary: true }];
      } else if (Array.isArray(body.images)) {
        // Check if it's an array of strings or objects
        if (body.images.length > 0 && typeof body.images[0] === 'string') {
          // Array of string URLs - convert each to object
          updateData.images = body.images.map((url: string, index: number) => ({
            url,
            alt: body.name || 'Restaurant image',
            isPrimary: index === 0
          }));
        }
        // If already array of objects, it will be used as-is
      }
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.status(200).json({
      success: true,
      data: restaurant,
      message: 'Restaurant updated successfully'
    });
  } catch (error) {
    console.error('Error updating restaurant:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update restaurant',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// DELETE /api/restaurants/:id - Delete restaurant
router.delete('/:id', authenticateToken, requireCustomerOrAdmin, requireOwnership(Restaurant, 'id'), async (req: Request, res: Response) => {
  try {
    await dbConnect();
    
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid restaurant ID'
      });
    }

    const restaurant = await Restaurant.findByIdAndDelete(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Restaurant deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete restaurant',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// GET /api/restaurants/:id - Get single restaurant
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    await dbConnect();
    
    const { id } = req.params;
    let restaurant;
    
    // Try to find by ObjectId first
    if (mongoose.Types.ObjectId.isValid(id)) {
      restaurant = await Restaurant.findById(id).lean();
    }
    
    // If not found by ObjectId, try to find by slug
    if (!restaurant) {
      restaurant = await Restaurant.findOne({ slug: id }).lean();
    }
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
    // Increment view count (optional - only if not admin)
    if (!req.user || req.user.role !== 'admin') {
      await Restaurant.findByIdAndUpdate((restaurant as any)._id, { $inc: { views: 1 } });
    }
    
    // Ensure images field exists and is an array
    const restaurantData = {
      ...restaurant,
      images: (restaurant as any).images || []
    };
    
    res.status(200).json({
      success: true,
      data: restaurantData
    });
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch restaurant'
    });
  }
});

export default router;
