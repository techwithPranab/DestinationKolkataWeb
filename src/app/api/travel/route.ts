import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { Travel } from '@/models'

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const transportType = searchParams.get('transportType')
    const category = searchParams.get('category')

    const query: { isActive: boolean; transportType?: string; category?: string } = { isActive: true }

    if (transportType) {
      query.transportType = transportType
    }

    if (category) {
      query.category = category
    }

    const travelOptions = await Travel.find(query)
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      services: travelOptions,
      pagination: {
        page: 1,
        limit: travelOptions.length,
        total: travelOptions.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      }
    })

  } catch (error) {
    console.error('Error fetching travel options:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch travel options'
      },
      { status: 500 }
    )
  }
}
