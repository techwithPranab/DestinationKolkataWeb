import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Event } from '@/models'

// GET /api/admin/events - Get all events
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const upcoming = searchParams.get('upcoming')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build query
    const query: Record<string, unknown> = {}

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { eventType: { $regex: search, $options: 'i' } }
      ]
    }

    if (category && category !== 'all') {
      query.category = category
    }

    if (status && status !== 'all') {
      query.status = status
    }

    if (upcoming === 'true') {
      query['dateTime.startDate'] = { $gte: new Date() }
    }

    // Get total count for pagination
    const total = await Event.countDocuments(query)

    // Get events with pagination
    const events = await Event.find(query)
      .sort({ 'dateTime.startDate': 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    return NextResponse.json({
      success: true,
      events,
      total,
      page,
      pages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

// POST /api/admin/events - Create new event
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()

    const newEvent = new Event({
      ...body,
      status: body.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const savedEvent = await newEvent.save()

    return NextResponse.json({
      success: true,
      message: 'Event created successfully',
      event: savedEvent
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create event' },
      { status: 500 }
    )
  }
}
