import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { Event } from '@/models'

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
    const priceRange = searchParams.get('priceRange')
    const rating = searchParams.get('rating')
    const location = searchParams.get('location')
    const search = searchParams.get('search')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const isRecurring = searchParams.get('isRecurring')
    const requiresBooking = searchParams.get('requiresBooking')
    const hasTicketsAvailable = searchParams.get('hasTicketsAvailable')
    
    // Build query
    const query: Record<string, unknown> = {}
    
    if (category) {
      query.category = { $in: category.split(',') }
    }
    
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number)
      query['ticketPrice.min'] = { $gte: min }
      query['ticketPrice.max'] = { $lte: max }
    }
    
    if (rating) {
      query['rating.average'] = { $gte: parseFloat(rating) }
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' }
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { 'organizer.name': { $regex: search, $options: 'i' } },
        { 'venue.name': { $regex: search, $options: 'i' } }
      ]
    }
    
    // Date filters
    if (startDate || endDate) {
      const startDateQuery: Record<string, Date> = {}
      if (startDate) {
        startDateQuery.$gte = new Date(startDate)
      }
      if (endDate) {
        startDateQuery.$lte = new Date(endDate)
      }
      query.startDate = startDateQuery
    }
    
    // Boolean filters
    if (isRecurring === 'true') query.isRecurring = true
    if (requiresBooking === 'true') query.requiresBooking = true
    if (hasTicketsAvailable === 'true') {
      query.$expr = { $gt: ['$ticketsAvailable', 0] }
    }
    
    // Sort options
    const sortBy = searchParams.get('sortBy') || 'startDate'
    const sortOrder = searchParams.get('sortOrder') === 'desc' ? -1 : 1
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder }
    
    // Execute query
    const events = await Event.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
    
    const total = await Event.countDocuments(query)
    const totalPages = Math.ceil(total / limit)
    
    return NextResponse.json({
      events,
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
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'category', 'startDate', 'venue', 'organizer']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }
    
    // Validate date
    if (new Date(body.startDate) < new Date()) {
      return NextResponse.json(
        { error: 'Start date cannot be in the past' },
        { status: 400 }
      )
    }
    
    if (body.endDate && new Date(body.endDate) < new Date(body.startDate)) {
      return NextResponse.json(
        { error: 'End date cannot be before start date' },
        { status: 400 }
      )
    }
    
    // Create new event
    const event = new Event(body)
    await event.save()
    
    return NextResponse.json(event, { status: 201 })
    
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}
