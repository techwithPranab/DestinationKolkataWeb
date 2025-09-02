import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Promotion } from '@/models'

// GET /api/promotions - Get active promotions for public view
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    // Build query for active promotions only
    const query: Record<string, unknown> = {
      //status: 'approved',
      isActive: true
    }

    // Add date filter for valid promotions
    // const now = new Date()
    // query.validFrom = { $lte: now }
    // query.validUntil = { $gte: now }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { businessName: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ]
    }

    if (type) {
      query.businessType = type
    }
    console.log('Promotion query:', query);
    // Get total count for pagination
    const total = await Promotion.countDocuments(query)

    // Get promotions with pagination
    const promotions = await Promotion.find(query)
      .sort({ isFeatured: -1, createdAt: -1 }) // Featured first, then by creation date
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
