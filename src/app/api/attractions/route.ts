import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { Attraction } from '@/models'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit
    
    // Filters
    const category = searchParams.get('category')
    const priceRange = searchParams.get('priceRange')
    const rating = searchParams.get('rating')
    const location = searchParams.get('location')
    const search = searchParams.get('search')
    const entryFeeType = searchParams.get('entryFeeType')
    const hasGuidedTour = searchParams.get('hasGuidedTour')
    const hasAudioGuide = searchParams.get('hasAudioGuide')
    const isWheelchairAccessible = searchParams.get('isWheelchairAccessible')
    const hasParking = searchParams.get('hasParking')
    
    // Build query
    const query: Record<string, unknown> = {}
    
    if (category) {
      query.category = { $in: category.split(',') }
    }
    
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number)
      query.entryFee = { $gte: min, $lte: max }
    }
    
    if (rating) {
      query.averageRating = { $gte: parseFloat(rating) }
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' }
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } }
      ]
    }
    
    if (entryFeeType) {
      if (entryFeeType === 'free') {
        query.entryFee = 0
      } else if (entryFeeType === 'paid') {
        query.entryFee = { $gt: 0 }
      }
    }
    
    // Boolean filters
    if (hasGuidedTour === 'true') query.hasGuidedTour = true
    if (hasAudioGuide === 'true') query.hasAudioGuide = true
    if (isWheelchairAccessible === 'true') query.isWheelchairAccessible = true
    if (hasParking === 'true') query.hasParking = true
    
    // Sort options
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder }
    
    // Execute query
    const attractions = await Attraction.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
    
    const total = await Attraction.countDocuments(query)
    const totalPages = Math.ceil(total / limit)
    
    return NextResponse.json({
      places: attractions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
    
  } catch (error) {
    console.error('Error fetching attractions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attractions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'category', 'location', 'openingHours']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }
    
    // Create new attraction
    const attraction = new Attraction(body)
    await attraction.save()
    
    return NextResponse.json(attraction, { status: 201 })
    
  } catch (error) {
    console.error('Error creating attraction:', error)
    return NextResponse.json(
      { error: 'Failed to create attraction' },
      { status: 500 }
    )
  }
}
