import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import dbConnect from '../lib/db';
import { Hotel } from '../models';
import { optionalAuth, requireAdmin } from '../middleware/auth';
import { PipelineStage } from 'mongoose';

const router = Router();

// Sample hotel data for initialization
const sampleHotels = [
  {
    name: 'The Astor Kolkata',
    description: 'A luxury heritage hotel in the heart of Kolkata, offering world-class amenities and impeccable service.',
    shortDescription: 'Luxury heritage hotel with modern amenities',
    category: 'Luxury',
    location: {
      type: 'Point',
      coordinates: [88.3639, 22.5726]
    },
    address: {
      street: '15 Jawaharlal Nehru Road',
      area: 'Park Street',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700013',
      landmark: 'Near Park Street'
    },
    contact: {
      phone: ['+91-33-2229-0101'],
      email: 'reservations@theastorkolkata.com',
      website: 'https://www.theastorkolkata.com',
      socialMedia: {
        facebook: 'https://facebook.com/theastorkolkata',
        instagram: 'https://instagram.com/theastorkolkata'
      }
    },
    priceRange: {
      min: 8000,
      max: 25000,
      currency: 'INR'
    },
    checkInTime: '14:00',
    checkOutTime: '12:00',
    amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Bar', 'Spa', 'Room Service', 'Concierge'],
    roomTypes: ['Deluxe Room', 'Executive Suite', 'Presidential Suite'],
    images: [{
      url: '/images/astor-kolkata.jpg',
      alt: 'The Astor Kolkata exterior',
      isPrimary: true
    }],
    tags: ['Luxury', 'Heritage', 'Business', 'Central Location'],
    status: 'active',
    featured: true,
    promoted: true,
    rating: {
      average: 4.5,
      count: 1250
    },
    views: 5600
  },
  {
    name: 'Budget Inn Kolkata',
    description: 'Affordable and comfortable accommodation for budget-conscious travelers visiting Kolkata.',
    shortDescription: 'Budget-friendly accommodation in Kolkata',
    category: 'Budget',
    location: {
      type: 'Point',
      coordinates: [88.3639, 22.5726]
    },
    address: {
      street: '123 MG Road',
      area: 'Ballygunge',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700019',
      landmark: 'Near Ballygunge Station'
    },
    contact: {
      phone: ['+91-33-2465-1234'],
      email: 'info@budgetinnkolkata.com',
      website: 'https://www.budgetinnkolkata.com'
    },
    priceRange: {
      min: 1500,
      max: 3500,
      currency: 'INR'
    },
    checkInTime: '12:00',
    checkOutTime: '11:00',
    amenities: ['WiFi', 'Restaurant', 'Room Service', 'Parking'],
    roomTypes: ['Standard Room', 'Deluxe Room'],
    images: [{
      url: '/images/budget-inn-kolkata.jpg',
      alt: 'Budget Inn Kolkata',
      isPrimary: true
    }],
    tags: ['Budget', 'Affordable', 'Central Location'],
    status: 'active',
    featured: false,
    promoted: false,
    rating: {
      average: 3.8,
      count: 320
    },
    views: 1200
  }
];

// Function to create sample hotels if none exist
async function createSampleHotelsIfNeeded() {
  const hotelCount = await Hotel.countDocuments();
  if (hotelCount === 0) {
    try {
      await Hotel.insertMany(sampleHotels);
      console.log('Sample hotels created successfully');
    } catch (error) {
      console.error('Error creating sample hotels:', error);
    }
  }
}

// Function to build query from request parameters
function buildHotelQuery(query: any) {
  const mongoQuery: Record<string, any> = {};
  
  // Handle status filtering
  if (query.status && query.status !== 'all') {
    mongoQuery.status = query.status;
  } else if (!query.status) {
    mongoQuery.status = 'active'; // Default to active for public API
  }

  // Category filter
  if (query.category) {
    mongoQuery.category = query.category;
  }

  // Price filter
  if (query.minPrice || query.maxPrice) {
    if (query.minPrice) mongoQuery['priceRange.min'] = { $gte: parseInt(query.minPrice) };
    if (query.maxPrice) mongoQuery['priceRange.max'] = { $lte: parseInt(query.maxPrice) };
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
      { tags: { $in: [new RegExp(query.search, 'i')] } }
    ];
  }

  return mongoQuery;
}

// GET /api/hotels - Get all hotels with filters
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    await dbConnect();
    
    // Create sample hotels if needed
    await createSampleHotelsIfNeeded();

    // Pagination
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '12');
    const skip = (page - 1) * limit;

    // Location-based search
    const lat = parseFloat(req.query.lat as string || '0');
    const lng = parseFloat(req.query.lng as string || '0');
    const distance = parseInt(req.query.distance as string || '50');

    // Build query
    const query = buildHotelQuery(req.query);
    
    let hotels;
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
            maxDistance: distance * 1000, // Convert km to meters
            spherical: true,
            query: query
          }
        },
        {
          $addFields: {
            reviewCount: '$rating.count',
            averagePrice: { $avg: ['$priceRange.min', '$priceRange.max'] }
          }
        },
        { $skip: skip },
        { $limit: limit }
      ];

      hotels = await Hotel.aggregate(pipeline);
      
      // Get total count for geo query
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
      const totalResults = await Hotel.aggregate(totalPipeline);
      total = totalResults[0]?.total || 0;
    } else {
      // Regular search without geography
      hotels = await Hotel.find(query)
        .sort({ featured: -1, promoted: -1, 'rating.average': -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      total = await Hotel.countDocuments(query);
    }

    // Get overall stats
    const overallTotal = await Hotel.countDocuments();
    const activeCount = await Hotel.countDocuments({ status: 'active' });

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      hotels,
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
        category: req.query.category,
        priceRange: { 
          min: req.query.minPrice, 
          max: req.query.maxPrice 
        },
        rating: req.query.rating,
        amenities: req.query.amenities ? (req.query.amenities as string).split(',') : [],
        search: req.query.search,
        location: lat && lng ? { lat, lng, distance } : null
      }
    });
  } catch (error) {
    console.error('Error fetching hotels:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hotels',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// POST /api/hotels - Create new hotel
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    await dbConnect();
    
    const body = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'location', 'priceRange', 'category'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Create new hotel
    const hotel = new Hotel({
      ...body,
      status: 'pending', // Requires approval
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await hotel.save();

    res.status(201).json({
      success: true,
      data: hotel,
      message: 'Hotel submitted successfully. It will be reviewed before being published.'
    });
  } catch (error) {
    console.error('Error creating hotel:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create hotel',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// GET /api/hotels/:id - Get single hotel
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    await dbConnect();
    
    const { id } = req.params;
    let hotel;
    
    // Try to find by ObjectId first
    if (mongoose.Types.ObjectId.isValid(id)) {
      hotel = await Hotel.findById(id).lean();
    }
    
    // If not found by ObjectId, try to find by slug
    if (!hotel) {
      hotel = await Hotel.findOne({ slug: id }).lean();
    }
    
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }
    
    // Increment view count (optional - only if not admin)
    if (!req.user || req.user.role !== 'admin') {
      await Hotel.findByIdAndUpdate((hotel as any)._id, { $inc: { views: 1 } });
    }
    
    // Ensure images field exists
    (hotel as any).images = (hotel as any).images || [];
    
    res.status(200).json({
      success: true,
      data: hotel
    });
  } catch (error) {
    console.error('Error fetching hotel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hotel'
    });
  }
});

export default router;
