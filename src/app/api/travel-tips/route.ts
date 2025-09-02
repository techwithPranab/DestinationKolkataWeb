import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { TravelTip } from '@/models'

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const query: { isActive: boolean; category?: string } = { isActive: true }

    if (category) {
      query.category = category
    }

    const travelTips = await TravelTip.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      data: travelTips,
      count: travelTips.length
    })

  } catch (error) {
    console.error('Error fetching travel tips:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch travel tips'
      },
      { status: 500 }
    )
  }
}
