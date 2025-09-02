import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Travel } from '@/models'

// GET /api/admin/travel - Get all travel packages
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const duration = searchParams.get('duration')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build query
    const query: Record<string, unknown> = {}

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ]
    }

    if (category) {
      query.category = category
    }

    if (duration) {
      query.duration = duration
    }

    if (status) {
      query.status = status
    }

    // Get total count for pagination
    const total = await Travel.countDocuments(query)

    // Get travel packages with pagination
    const packages = await Travel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    return NextResponse.json({
      success: true,
      packages,
      total,
      page,
      pages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching travel packages:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch travel packages' },
      { status: 500 }
    )
  }
}

// POST /api/admin/travel - Create new travel package
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()

    const newTravel = new Travel({
      ...body,
      status: body.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const savedTravel = await newTravel.save()

    return NextResponse.json({
      success: true,
      message: 'Travel package created successfully',
      package: savedTravel
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating travel package:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create travel package' },
      { status: 500 }
    )
  }
}
