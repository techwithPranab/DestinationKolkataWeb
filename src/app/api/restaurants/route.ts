import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Restaurant } from '@/models'
import { PipelineStage } from 'mongoose'

// Sample restaurant data
const sampleRestaurants = [
  {
    name: '6 Ballygunge Place',
    description: 'Authentic Bengali cuisine in a heritage setting. Experience traditional flavors with modern presentation.',
    shortDescription: 'Authentic Bengali cuisine in heritage setting',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
        alt: '6 Ballygunge Place interior',
        isPrimary: true
      }
    ],
    location: {
      type: 'Point',
      coordinates: [88.3654, 22.5275] // Ballygunge coordinates
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
    avgMealCost: 800,
    reservationRequired: true
  },
  {
    name: 'Flurys Tea Room & Cafe',
    description: 'Historic tea room serving continental breakfast and pastries since 1927. A Kolkata institution.',
    shortDescription: 'Historic tea room since 1927',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2347&q=80',
        alt: 'Flurys Tea Room interior',
        isPrimary: true
      }
    ],
    location: {
      type: 'Point',
      coordinates: [88.3517, 22.5550] // Park Street coordinates
    },
    address: {
      street: '18 Park Street',
      area: 'Park Street',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700016'
    },
    contact: {
      phone: ['+91-33-2229-6517'],
      website: 'https://www.flurysindia.com'
    },
    rating: {
      average: 4.4,
      count: 892
    },
    amenities: ['AC', 'WiFi', 'Takeaway'],
    tags: ['continental', 'bakery', 'historic'],
    status: 'active',
    featured: false,
    promoted: false,
    cuisine: ['Continental', 'Bakery'],
    priceRange: 'Mid-range',
    openingHours: {
      monday: { open: '07:00', close: '21:00', closed: false },
      tuesday: { open: '07:00', close: '21:00', closed: false },
      wednesday: { open: '07:00', close: '21:00', closed: false },
      thursday: { open: '07:00', close: '21:00', closed: false },
      friday: { open: '07:00', close: '21:00', closed: false },
      saturday: { open: '07:00', close: '21:00', closed: false },
      sunday: { open: '07:00', close: '21:00', closed: false }
    },
    avgMealCost: 400,
    reservationRequired: false
  },
  {
    name: 'Kewpie\'s Kitchen',
    description: 'Home-style Bengali cooking in a cozy family atmosphere. Known for authentic fish curry and traditional sweets.',
    shortDescription: 'Home-style Bengali cooking',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
        alt: 'Kewpie\'s Kitchen interior',
        isPrimary: true
      }
    ],
    location: {
      type: 'Point',
      coordinates: [88.3639, 22.5411] // Elgin Road coordinates
    },
    address: {
      street: '12 Elgin Road',
      area: 'Elgin Road',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700020'
    },
    contact: {
      phone: ['+91-33-2282-0000']
    },
    rating: {
      average: 4.3,
      count: 567
    },
    amenities: ['AC', 'Home Delivery'],
    tags: ['bengali', 'home-style', 'traditional'],
    status: 'active',
    featured: false,
    promoted: false,
    cuisine: ['Bengali'],
    priceRange: 'Mid-range',
    openingHours: {
      monday: { open: '12:00', close: '15:30', closed: false },
      tuesday: { open: '12:00', close: '15:30', closed: false },
      wednesday: { open: '12:00', close: '15:30', closed: false },
      thursday: { open: '12:00', close: '15:30', closed: false },
      friday: { open: '12:00', close: '15:30', closed: false },
      saturday: { open: '12:00', close: '15:30', closed: false },
      sunday: { open: '19:00', close: '22:30', closed: false }
    },
    avgMealCost: 300,
    reservationRequired: false
  },
  {
    name: 'Peter Cat',
    description: 'Iconic restaurant famous for Chelo Kebab and continental cuisine. A must-visit Park Street landmark.',
    shortDescription: 'Iconic restaurant with Chelo Kebab',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
        alt: 'Peter Cat interior',
        isPrimary: true
      }
    ],
    location: {
      type: 'Point',
      coordinates: [88.3517, 22.5550] // Park Street coordinates
    },
    address: {
      street: '18 Park Street',
      area: 'Park Street',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700016'
    },
    contact: {
      phone: ['+91-33-2229-6000'],
      website: 'https://www.petercat.in'
    },
    rating: {
      average: 4.2,
      count: 1324
    },
    amenities: ['AC', 'Bar', 'Parking'],
    tags: ['continental', 'indian', 'landmark'],
    status: 'active',
    featured: false,
    promoted: false,
    cuisine: ['Continental', 'Indian'],
    priceRange: 'Mid-range',
    openingHours: {
      monday: { open: '12:00', close: '24:00', closed: false },
      tuesday: { open: '12:00', close: '24:00', closed: false },
      wednesday: { open: '12:00', close: '24:00', closed: false },
      thursday: { open: '12:00', close: '24:00', closed: false },
      friday: { open: '12:00', close: '24:00', closed: false },
      saturday: { open: '12:00', close: '24:00', closed: false },
      sunday: { open: '12:00', close: '24:00', closed: false }
    },
    avgMealCost: 600,
    reservationRequired: false
  },
  {
    name: 'Arsalan',
    description: 'Legendary biryani house serving the best Kolkata biryani with tender meat and aromatic rice.',
    shortDescription: 'Legendary biryani house',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
        alt: 'Arsalan biryani',
        isPrimary: true
      }
    ],
    location: {
      type: 'Point',
      coordinates: [88.3639, 22.5411] // Park Circus coordinates
    },
    address: {
      street: '120 Park Circus',
      area: 'Park Circus',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700017'
    },
    contact: {
      phone: ['+91-33-2282-5000']
    },
    rating: {
      average: 4.5,
      count: 2156
    },
    amenities: ['Takeaway', 'Home Delivery', 'AC'],
    tags: ['biryani', 'mughlai', 'legendary'],
    status: 'active',
    featured: true,
    promoted: true,
    cuisine: ['Mughlai', 'Biryani'],
    priceRange: 'Budget',
    openingHours: {
      monday: { open: '11:00', close: '23:00', closed: false },
      tuesday: { open: '11:00', close: '23:00', closed: false },
      wednesday: { open: '11:00', close: '23:00', closed: false },
      thursday: { open: '11:00', close: '23:00', closed: false },
      friday: { open: '11:00', close: '23:00', closed: false },
      saturday: { open: '11:00', close: '23:00', closed: false },
      sunday: { open: '11:00', close: '23:00', closed: false }
    },
    avgMealCost: 250,
    reservationRequired: false
  },
  {
    name: 'Mocambo',
    description: 'Retro-style restaurant serving continental dishes and cocktails in a vintage ambiance.',
    shortDescription: 'Retro-style restaurant with cocktails',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
        alt: 'Mocambo interior',
        isPrimary: true
      }
    ],
    location: {
      type: 'Point',
      coordinates: [88.3517, 22.5550] // Park Street coordinates
    },
    address: {
      street: '25B Park Street',
      area: 'Park Street',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700016'
    },
    contact: {
      phone: ['+91-33-2229-5000'],
      website: 'https://www.mocambo.in'
    },
    rating: {
      average: 4.1,
      count: 743
    },
    amenities: ['AC', 'Bar', 'Live Music'],
    tags: ['continental', 'chinese', 'retro'],
    status: 'active',
    featured: false,
    promoted: false,
    cuisine: ['Continental', 'Chinese'],
    priceRange: 'Mid-range',
    openingHours: {
      monday: { open: '12:00', close: '24:00', closed: false },
      tuesday: { open: '12:00', close: '24:00', closed: false },
      wednesday: { open: '12:00', close: '24:00', closed: false },
      thursday: { open: '12:00', close: '24:00', closed: false },
      friday: { open: '12:00', close: '24:00', closed: false },
      saturday: { open: '12:00', close: '24:00', closed: false },
      sunday: { open: '12:00', close: '24:00', closed: false }
    },
    avgMealCost: 700,
    reservationRequired: false
  }
]

// Function to create sample restaurants if none exist
async function createSampleRestaurantsIfNeeded() {
  const restaurantCount = await Restaurant.countDocuments()
  if (restaurantCount === 0) {
    try {
      await Restaurant.insertMany(sampleRestaurants)
      console.log('Sample restaurants created successfully')
    } catch (error) {
      console.error('Error creating sample restaurants:', error)
    }
  }
}

// Function to build query from request parameters
function buildRestaurantQuery(searchParams: URLSearchParams) {
  const query: Record<string, unknown> = {}
  const status = searchParams.get('status')

  // Handle status filtering
  if (status && status !== 'all') {
    query.status = status
  } else if (!status) {
    query.status = 'active' // Default to active for public API
  }

  // Add other filters
  addCuisineFilter(query, searchParams.get('cuisine'))
  addPriceFilter(query, searchParams.get('minPrice'), searchParams.get('maxPrice'))
  addRatingFilter(query, searchParams.get('rating'))
  addSearchFilter(query, searchParams.get('search'))

  return query
}

function addCuisineFilter(query: Record<string, unknown>, cuisine: string | null) {
  if (cuisine) {
    query.cuisine = { $in: cuisine.split(',') }
  }
}

function addPriceFilter(query: Record<string, unknown>, minPrice: string | null, maxPrice: string | null) {
  if (minPrice || maxPrice) {
    const priceFilter: Record<string, number> = {}
    if (minPrice) priceFilter.$gte = parseInt(minPrice)
    if (maxPrice) priceFilter.$lte = parseInt(maxPrice)
    if (Object.keys(priceFilter).length > 0) {
      query.avgMealCost = priceFilter
    }
  }
}

function addRatingFilter(query: Record<string, unknown>, rating: string | null) {
  if (rating) {
    query['rating.average'] = { $gte: parseFloat(rating) }
  }
}

function addSearchFilter(query: Record<string, unknown>, search: string | null) {
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'address.area': { $regex: search, $options: 'i' } },
      { cuisine: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ]
  }
}

// Function to build aggregation pipeline
function buildRestaurantPipeline(query: Record<string, unknown>, searchParams: URLSearchParams) {
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
      reviewCount: '$rating.count'
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
      amenities: 1,
      cuisine: 1,
      priceRange: 1,
      avgMealCost: 1,
      openingHours: 1,
      reservationRequired: 1,
      status: 1,
      featured: 1,
      promoted: 1,
      tags: 1,
      distance: 1,
      createdAt: 1
    }
  })

  return pipeline
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Create sample restaurants if needed
    await createSampleRestaurantsIfNeeded()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const lat = parseFloat(searchParams.get('lat') || '0')
    const lng = parseFloat(searchParams.get('lng') || '0')
    const distance = parseInt(searchParams.get('distance') || '50')

    // Build query and pipeline
    const query = buildRestaurantQuery(searchParams)
    const pipeline = buildRestaurantPipeline(query, searchParams)

    const restaurants = await Restaurant.aggregate(pipeline)

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

    const totalResults = await Restaurant.aggregate([
      ...totalQuery,
      { $count: 'total' }
    ])

    const total = totalResults[0]?.total || 0
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      restaurants,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        cuisine: searchParams.get('cuisine')?.split(',') || [],
        priceRange: { min: searchParams.get('minPrice'), max: searchParams.get('maxPrice') },
        rating: searchParams.get('rating'),
        search: searchParams.get('search'),
        location: lat && lng ? { lat, lng, distance } : null
      }
    })

  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch restaurants' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'cuisine', 'location', 'contact']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }
    
    // Create new restaurant
    const restaurant = new Restaurant(body)
    await restaurant.save()
    
    return NextResponse.json(restaurant, { status: 201 })
    
  } catch (error) {
    console.error('Error creating restaurant:', error)
    return NextResponse.json(
      { error: 'Failed to create restaurant' },
      { status: 500 }
    )
  }
}
