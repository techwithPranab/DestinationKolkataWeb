import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Hotel } from '@/models'
import { PipelineStage } from 'mongoose'

// Sample hotel data
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
    promoted: false,
    rating: {
      average: 4.5,
      count: 1250
    },
    views: 5000
  },
  {
    name: 'ITC Royal Bengal',
    description: 'An iconic luxury hotel known for its colonial architecture and exceptional hospitality services.',
    shortDescription: 'Iconic luxury hotel with colonial charm',
    category: 'Luxury',
    location: {
      type: 'Point',
      coordinates: [88.3639, 22.5726]
    },
    address: {
      street: 'Jawaharlal Nehru Road',
      area: 'Jawaharlal Nehru Road',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700013',
      landmark: 'Near Victoria Memorial'
    },
    contact: {
      phone: ['+91-33-2499-2323'],
      email: 'reservations@itchotels.in',
      website: 'https://www.itchotels.in',
      socialMedia: {
        facebook: 'https://facebook.com/itcroyal',
        instagram: 'https://instagram.com/itcroyal'
      }
    },
    priceRange: {
      min: 12000,
      max: 35000,
      currency: 'INR'
    },
    checkInTime: '14:00',
    checkOutTime: '12:00',
    amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Bar', 'Spa', 'Room Service', 'Concierge', 'Business Center'],
    roomTypes: ['Superior Room', 'Deluxe Room', 'Executive Suite', 'Royal Suite'],
    images: [{
      url: '/images/itc-royal-bengal.jpg',
      alt: 'ITC Royal Bengal entrance',
      isPrimary: true
    }],
    tags: ['Luxury', 'Business', 'Colonial', 'Heritage'],
    status: 'active',
    featured: true,
    promoted: true,
    rating: {
      average: 4.7,
      count: 2100
    },
    views: 8000
  },
  {
    name: 'Hyatt Regency Kolkata',
    description: 'Modern luxury hotel with stunning city views, contemporary design, and premium amenities.',
    shortDescription: 'Modern luxury with panoramic city views',
    category: 'Luxury',
    location: {
      type: 'Point',
      coordinates: [88.3639, 22.5726]
    },
    address: {
      street: 'JA-1 Sector III',
      area: 'Salt Lake City',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700098',
      landmark: 'Near Salt Lake Stadium'
    },
    contact: {
      phone: ['+91-33-2335-1234'],
      email: 'kolkata.regency@hyatt.com',
      website: 'https://www.hyatt.com',
      socialMedia: {
        facebook: 'https://facebook.com/hyattkolkata',
        instagram: 'https://instagram.com/hyattkolkata'
      }
    },
    priceRange: {
      min: 9000,
      max: 22000,
      currency: 'INR'
    },
    checkInTime: '15:00',
    checkOutTime: '12:00',
    amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Bar', 'Spa', 'Room Service', 'Concierge', 'Business Center'],
    roomTypes: ['Standard Room', 'Club Room', 'Executive Suite', 'Presidential Suite'],
    images: [{
      url: '/images/hyatt-regency-kolkata.jpg',
      alt: 'Hyatt Regency Kolkata',
      isPrimary: true
    }],
    tags: ['Luxury', 'Modern', 'Business', 'City View'],
    status: 'active',
    featured: false,
    promoted: true,
    rating: {
      average: 4.3,
      count: 950
    },
    views: 3200
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
  },
  {
    name: 'City Center Hotel',
    description: 'Mid-range hotel offering comfortable stay with essential amenities in the heart of the city.',
    shortDescription: 'Comfortable mid-range hotel in city center',
    category: 'Mid-range',
    location: {
      type: 'Point',
      coordinates: [88.3639, 22.5726]
    },
    address: {
      street: '45 Park Street',
      area: 'Park Street',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700016',
      landmark: 'Near Park Street Metro'
    },
    contact: {
      phone: ['+91-33-2229-5678'],
      email: 'reservations@citycenterkolkata.com',
      website: 'https://www.citycenterkolkata.com'
    },
    priceRange: {
      min: 3000,
      max: 7000,
      currency: 'INR'
    },
    checkInTime: '13:00',
    checkOutTime: '12:00',
    amenities: ['WiFi', 'Restaurant', 'Bar', 'Room Service', 'Concierge'],
    roomTypes: ['Standard Room', 'Deluxe Room', 'Suite'],
    images: [{
      url: '/images/city-center-hotel.jpg',
      alt: 'City Center Hotel Kolkata',
      isPrimary: true
    }],
    tags: ['Mid-range', 'Central Location', 'Business'],
    status: 'pending',
    featured: false,
    promoted: false,
    rating: {
      average: 4.0,
      count: 180
    },
    views: 800
  }
]

// Function to create sample hotels if none exist
async function createSampleHotelsIfNeeded() {
  const hotelCount = await Hotel.countDocuments()
  if (hotelCount === 0) {
    try {
      await Hotel.insertMany(sampleHotels)
      console.log('Sample hotels created successfully')
    } catch (error) {
      console.error('Error creating sample hotels:', error)
    }
  }
}

// Function to build query from request parameters
function buildHotelQuery(searchParams: URLSearchParams) {
  const query: Record<string, unknown> = {}
  const status = searchParams.get('status')

  // Handle status filtering
  if (status && status !== 'all') {
    query.status = status
  } else if (!status) {
    query.status = 'active' // Default to active for public API
  }

  // Add other filters
  addCategoryFilter(query, searchParams.get('category'))
  addPriceFilter(query, searchParams.get('minPrice'), searchParams.get('maxPrice'))
  addRatingFilter(query, searchParams.get('rating'))
  addAmenitiesFilter(query, searchParams.get('amenities'))
  addSearchFilter(query, searchParams.get('search'))

  return query
}

function addCategoryFilter(query: Record<string, unknown>, category: string | null) {
  if (category) {
    query.category = category
  }
}

function addPriceFilter(query: Record<string, unknown>, minPrice: string | null, maxPrice: string | null) {
  if (minPrice || maxPrice) {
    if (minPrice) query['priceRange.min'] = { $gte: parseInt(minPrice) }
    if (maxPrice) query['priceRange.max'] = { $lte: parseInt(maxPrice) }
  }
}

function addRatingFilter(query: Record<string, unknown>, rating: string | null) {
  if (rating) {
    query['rating.average'] = { $gte: parseFloat(rating) }
  }
}

function addAmenitiesFilter(query: Record<string, unknown>, amenities: string | null) {
  if (amenities) {
    query.amenities = { $in: amenities.split(',') }
  }
}

function addSearchFilter(query: Record<string, unknown>, search: string | null) {
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'address.area': { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ]
  }
}

// Function to build aggregation pipeline
function buildHotelPipeline(query: Record<string, unknown>, searchParams: URLSearchParams) {
  const pipeline: PipelineStage[] = []
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const lat = parseFloat(searchParams.get('lat') || '0')
  const lng = parseFloat(searchParams.get('lng') || '0')
  const distance = parseInt(searchParams.get('distance') || '50')

  // Geographic search if coordinates provided
  if (lat && lng) {
    pipeline.push({
      $geoNear: {
        near: {
          type: 'Point' as const,
          coordinates: [lng, lat]
        },
        distanceField: 'distance',
        maxDistance: distance * 1000, // Convert km to meters
        spherical: true,
        query: query
      }
    })
  } else {
    pipeline.push({ $match: query })
  }

  // Add sorting
  if (!lat || !lng) {
    pipeline.push({
      $sort: {
        featured: -1,
        promoted: -1,
        'rating.average': -1,
        createdAt: -1
      }
    })
  }

  // Add pagination
  pipeline.push(
    { $skip: (page - 1) * limit },
    { $limit: limit }
  )

  // Add calculated fields
  pipeline.push({
    $addFields: {
      reviewCount: '$rating.count',
      averagePrice: { $avg: ['$priceRange.min', '$priceRange.max'] }
    }
  })

  // Project only required fields
  pipeline.push({
    $project: {
      name: 1,
      description: 1,
      shortDescription: 1,
      images: 1,
      location: 1,
      address: 1,
      contact: 1,
      rating: 1,
      reviewCount: 1,
      priceRange: 1,
      averagePrice: 1,
      amenities: 1,
      category: 1,
      status: 1,
      featured: 1,
      promoted: 1,
      distance: 1,
      tags: 1,
      createdAt: 1
    }
  })

  return pipeline
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Create sample hotels if needed
    await createSampleHotelsIfNeeded()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const lat = parseFloat(searchParams.get('lat') || '0')
    const lng = parseFloat(searchParams.get('lng') || '0')
    const distance = parseInt(searchParams.get('distance') || '50')
    const category = searchParams.get('category')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const rating = searchParams.get('rating')
    const amenities = searchParams.get('amenities')
    const search = searchParams.get('search')

    // Build query and pipeline
    const query = buildHotelQuery(searchParams)
    const pipeline = buildHotelPipeline(query, searchParams)

    const hotels = await Hotel.aggregate(pipeline)
    
    // Get total count for pagination
    const totalQuery: PipelineStage[] = lat && lng
      ? [{
          $geoNear: {
            near: { type: 'Point' as const, coordinates: [lng, lat] },
            distanceField: 'distance',
            maxDistance: distance * 1000,
            spherical: true,
            query: query
          }
        }]
      : [{ $match: query }]

    const totalResults = await Hotel.aggregate([
      ...totalQuery,
      { $count: 'total' }
    ])
    
    const total = totalResults[0]?.total || 0
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      hotels,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        category,
        priceRange: { min: minPrice, max: maxPrice },
        rating,
        amenities: amenities?.split(',') || [],
        search,
        location: lat && lng ? { lat, lng, distance } : null
      }
    })

  } catch (error) {
    console.error('Error fetching hotels:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hotels' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'location', 'priceRange', 'category']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Create new hotel
    const hotel = new Hotel({
      ...body,
      status: 'pending', // Requires approval
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await hotel.save()

    return NextResponse.json({
      success: true,
      data: hotel,
      message: 'Hotel submitted successfully. It will be reviewed before being published.'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating hotel:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create hotel' },
      { status: 500 }
    )
  }
}
