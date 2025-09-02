import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Restaurant } from '@/models'

// GET /api/admin/restaurants - Get all restaurants
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const cuisine = searchParams.get('cuisine')
    const priceRange = searchParams.get('priceRange')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build query
    const query: Record<string, unknown> = {}

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { cuisine: { $in: [new RegExp(search, 'i')] } }
      ]
    }

    if (cuisine) {
      query.cuisine = { $in: [cuisine] }
    }

    if (priceRange) {
      query.priceRange = priceRange
    }

    if (status) {
      query.status = status
    }

    // Get total count for pagination
    const total = await Restaurant.countDocuments(query)

    // Get restaurants with pagination
    const restaurants = await Restaurant.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    return NextResponse.json({
      success: true,
      restaurants,
      total,
      page,
      pages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch restaurants' },
      { status: 500 }
    )
  }
}

// POST /api/admin/restaurants - Create new restaurant
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()

    const newRestaurant = new Restaurant({
      ...body,
      status: body.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const savedRestaurant = await newRestaurant.save()

    return NextResponse.json({
      success: true,
      message: 'Restaurant created successfully',
      restaurant: savedRestaurant
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating restaurant:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create restaurant' },
      { status: 500 }
    )
  }
}
