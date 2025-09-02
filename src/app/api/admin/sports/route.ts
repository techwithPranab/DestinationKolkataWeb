import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Sports } from '@/models'

// GET /api/admin/sports - Get all sports facilities
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const activity = searchParams.get('activity')
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

    if (activity) {
      query.activities = { $in: [activity] }
    }

    if (status) {
      query.status = status
    }

    // Get total count for pagination
    const total = await Sports.countDocuments(query)

    // Get sports facilities with pagination
    const sports = await Sports.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    return NextResponse.json({
      success: true,
      sports,
      total,
      page,
      pages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching sports facilities:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch sports facilities' },
      { status: 500 }
    )
  }
}

// POST /api/admin/sports - Create new sports facility
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()

    const newSports = new Sports({
      ...body,
      status: body.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const savedSports = await newSports.save()

    return NextResponse.json({
      success: true,
      message: 'Sports facility created successfully',
      sport: savedSports
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating sports facility:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create sports facility' },
      { status: 500 }
    )
  }
}
