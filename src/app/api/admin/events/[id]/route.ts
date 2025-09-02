import { NextRequest, NextResponse } from 'next/server'

// Mock data for events - replace with actual database
const events = [
  {
    _id: '1',
    title: 'Durga Puja Festival',
    description: 'The biggest festival in Kolkata celebrating Goddess Durga',
    category: 'Festival',
    startDate: '2024-10-01',
    endDate: '2024-10-05',
    venue: 'Various locations across Kolkata',
    organizer: 'Kolkata Municipal Corporation',
    contactInfo: {
      phone: '+91-33-2210-0000',
      email: 'info@durga-puja-kolkata.com',
      website: 'https://durga-puja-kolkata.com'
    },
    ticketInfo: {
      price: { general: 0, vip: 500 },
      availability: 'Free entry for most pandals',
      bookingRequired: false
    },
    schedule: [
      { day: 'Day 1', activities: ['Pandal hopping', 'Cultural programs'] },
      { day: 'Day 2', activities: ['Art exhibitions', 'Food stalls'] }
    ],
    highlights: ['Traditional pandals', 'Cultural performances', 'Street food'],
    images: ['/images/events/durga-puja.jpg'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// GET /api/admin/events/[id] - Get specific event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const event = events.find(e => e._id === id)

    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      event
    })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/events/[id] - Update event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params
    const eventIndex = events.findIndex(e => e._id === id)

    if (eventIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      )
    }

    const updatedEvent = {
      ...events[eventIndex],
      ...body,
      updatedAt: new Date().toISOString()
    }

    events[eventIndex] = updatedEvent

    return NextResponse.json({
      success: true,
      message: 'Event updated successfully',
      event: updatedEvent
    })
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update event' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/events/[id] - Delete event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const eventIndex = events.findIndex(e => e._id === id)

    if (eventIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      )
    }

    const deletedEvent = events.splice(eventIndex, 1)[0]

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
      event: deletedEvent
    })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete event' },
      { status: 500 }
    )
  }
}
