import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Hotel } from '@/models'

// GET /api/admin/hotels - Get all hotels
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const starRating = searchParams.get('starRating')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build query
    const query: Record<string, unknown> = {}

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ]
    }

    if (category) {
      query.category = category
    }

    if (starRating) {
      query.starRating = parseInt(starRating)
    }

    if (status) {
      query.status = status
    }

    // Get total count for pagination
    const total = await Hotel.countDocuments(query)

    // Get hotels with pagination
    const hotels = await Hotel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    return NextResponse.json({
      success: true,
      hotels,
      total,
      page,
      pages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching hotels:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch hotels' },
      { status: 500 }
    )
  }
}

// POST /api/admin/hotels - Create new hotel
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()

    const newHotel = new Hotel({
      ...body,
      status: body.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const savedHotel = await newHotel.save()

    return NextResponse.json({
      success: true,
      message: 'Hotel created successfully',
      hotel: savedHotel
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating hotel:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create hotel' },
      { status: 500 }
    )
  }
}
