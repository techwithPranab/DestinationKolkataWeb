import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Promotion } from '@/models'

// GET /api/admin/promotions - Get all promotions
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const active = searchParams.get('active')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build query
    const query: Record<string, unknown> = {}

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ]
    }

    if (type) {
      query.type = type
    }

    if (status) {
      query.status = status
    }

    if (active === 'true') {
      const now = new Date()
      query.isActive = true
      query.validFrom = { $lte: now }
      query.validUntil = { $gte: now }
    }

    // Get total count for pagination
    const total = await Promotion.countDocuments(query)

    // Get promotions with pagination
    const promotions = await Promotion.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    return NextResponse.json({
      success: true,
      promotions,
      total,
      page,
      pages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching promotions:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch promotions' },
      { status: 500 }
    )
  }
}

// POST /api/admin/promotions - Create new promotion
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()

    const newPromotion = new Promotion({
      ...body,
      usedCount: 0,
      status: body.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const savedPromotion = await newPromotion.save()

    return NextResponse.json({
      success: true,
      message: 'Promotion created successfully',
      promotion: savedPromotion
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating promotion:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create promotion' },
      { status: 500 }
    )
  }
}
