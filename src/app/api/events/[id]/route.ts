import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { Event } from '@/models'
import { ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()

    const { id } = await params

    let event;

    // Try to find by ObjectId first
    if (ObjectId.isValid(id)) {
      event = await Event.findById(id)
    }

    // If not found by ObjectId, try to find by slug (name converted to slug)
    if (!event) {
      let slug = id.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      slug = slug.replace(/^-+/g, '').replace(/-+$/g, '')
      const searchPattern = slug.replace(/-/g, '.*')
      console.log('Searching event with pattern:', searchPattern);
      // Search by name regex pattern
      event = await Event.findOne({
        name: { $regex: new RegExp(searchPattern, 'i') }
      })
    }

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Only return active events for public API
    if (event.status !== 'active') {
      return NextResponse.json(
        { error: 'Event not available' },
        { status: 404 }
      )
    }

    return NextResponse.json(event)

  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()

    const { id } = await params
    const body = await request.json()

    // Transform images field to handle both legacy string arrays and new object arrays
    if (body.images) {
      if (Array.isArray(body.images)) {
        body.images = body.images.map((img: string | { url: string; alt?: string; isPrimary?: boolean }) => {
          if (typeof img === 'string') {
            // Convert legacy string format to object format
            return { url: img, alt: '', isPrimary: false }
          }
          return img // Already in correct object format
        })
      } else if (typeof body.images === 'string') {
        // Handle single string case
        body.images = [{ url: body.images, alt: '', isPrimary: false }]
      }
    }

    // Find event by ObjectId or slug
    let event;
    if (ObjectId.isValid(id)) {
      event = await Event.findById(id)
    } else {
      let slug = id.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      slug = slug.replace(/^-+/g, '').replace(/-+$/g, '')
      const searchPattern = slug.replace(/-/g, '.*')
      event = await Event.findOne({
        name: { $regex: new RegExp(searchPattern, 'i') }
      })
    }

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      event._id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    )

    if (!updatedEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedEvent)

  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()

    const { id } = await params

    // Find event by ObjectId or slug
    let event;
    if (ObjectId.isValid(id)) {
      event = await Event.findById(id)
    } else {
      let slug = id.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      slug = slug.replace(/^-+/g, '').replace(/-+$/g, '')
      const searchPattern = slug.replace(/-/g, '.*')
      event = await Event.findOne({
        name: { $regex: new RegExp(searchPattern, 'i') }
      })
    }

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    const deletedEvent = await Event.findByIdAndDelete(event._id)

    if (!deletedEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Event deleted successfully' })

  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}
