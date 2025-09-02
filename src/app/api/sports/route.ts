import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { Sports } from '@/models'

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
    const sport = searchParams.get('sport')
    const priceRange = searchParams.get('priceRange')
    const rating = searchParams.get('rating')
    const location = searchParams.get('location')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')

    // Build query
    const query: Record<string, unknown> = { status: 'active' }

    if (category) {
      query.category = { $in: category.split(',') }
    }

    if (sport) {
      query.sport = { $regex: sport, $options: 'i' }
    }

    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number)
      query['entryFee.adult'] = { $gte: min, $lte: max }
    }

    if (rating) {
      query['rating.average'] = { $gte: parseFloat(rating) }
    }

    if (location) {
      query.$or = [
        { 'address.area': { $regex: location, $options: 'i' } },
        { 'address.city': { $regex: location, $options: 'i' } },
        { 'address.landmark': { $regex: location, $options: 'i' } }
      ]
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sport: { $regex: search, $options: 'i' } },
        { facilities: { $in: [new RegExp(search, 'i')] } },
        { amenities: { $in: [new RegExp(search, 'i')] } }
      ]
    }

    if (featured === 'true') {
      query.featured = true
    }

    // Sort options
    const sortBy = searchParams.get('sortBy') || 'rating.average'
    const sortOrder = searchParams.get('sortOrder') === 'desc' ? -1 : 1
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder }

    // Execute query
    const sports = await Sports.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Sports.countDocuments(query)
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      facilities: sports,
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
    console.error('Error fetching sports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sports facilities' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()

    // Validate required fields
    const requiredFields = ['name', 'description', 'category', 'sport']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Create new sports facility
    const sportsFacility = new Sports(body)
    await sportsFacility.save()

    return NextResponse.json(sportsFacility, { status: 201 })

  } catch (error) {
    console.error('Error creating sports facility:', error)
    return NextResponse.json(
      { error: 'Failed to create sports facility' },
      { status: 500 }
    )
  }
}
