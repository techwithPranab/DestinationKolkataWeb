import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Event } from '@/models'

// GET /api/admin/events/[id] - Get specific event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params

    const event = await Event.findById(id).lean()

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
    await connectDB()
    const { id } = await params
    const body = await request.json()

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        ...body,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).lean()

    if (!updatedEvent) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      )
    }

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
    await connectDB()
    const { id } = await params

    const deletedEvent = await Event.findByIdAndDelete(id).lean()

    if (!deletedEvent) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      )
    }

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
