import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { Sports } from '@/models'
import { ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()

    const { id } = await params

    let facility;

    // Try to find by ObjectId first
    if (ObjectId.isValid(id)) {
      facility = await Sports.findById(id)
    }

    // If not found by ObjectId, try to find by slug (name converted to slug)
    if (!facility) {
      let slug = id.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      slug = slug.replace(/^-+/g, '').replace(/-+$/g, '')
      const searchPattern = slug.replace(/-/g, '.*')
      console.log('Searching sports facility with pattern:', searchPattern);
      // Search by name regex pattern
      facility = await Sports.findOne({
        name: { $regex: new RegExp(searchPattern, 'i') }
      })
    }

    if (!facility) {
      return NextResponse.json(
        { error: 'Sports facility not found' },
        { status: 404 }
      )
    }

    // Only return active facilities for public API
    if (facility.status !== 'active') {
      return NextResponse.json(
        { error: 'Sports facility not available' },
        { status: 404 }
      )
    }

    return NextResponse.json(facility)

  } catch (error) {
    console.error('Error fetching sports facility:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sports facility' },
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

    // Find facility by ObjectId or slug
    let facility;
    if (ObjectId.isValid(id)) {
      facility = await Sports.findById(id)
    } else {
      let slug = id.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      slug = slug.replace(/^-+/g, '').replace(/-+$/g, '')
      const searchPattern = slug.replace(/-/g, '.*')
      facility = await Sports.findOne({
        name: { $regex: new RegExp(searchPattern, 'i') }
      })
    }

    if (!facility) {
      return NextResponse.json(
        { error: 'Sports facility not found' },
        { status: 404 }
      )
    }

    const updatedFacility = await Sports.findByIdAndUpdate(
      facility._id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    )

    if (!updatedFacility) {
      return NextResponse.json(
        { error: 'Sports facility not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedFacility)

  } catch (error) {
    console.error('Error updating sports facility:', error)
    return NextResponse.json(
      { error: 'Failed to update sports facility' },
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

    // Find facility by ObjectId or slug
    let facility;
    if (ObjectId.isValid(id)) {
      facility = await Sports.findById(id)
    } else {
      let slug = id.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      slug = slug.replace(/^-+/g, '').replace(/-+$/g, '')
      const searchPattern = slug.replace(/-/g, '.*')
      facility = await Sports.findOne({
        name: { $regex: new RegExp(searchPattern, 'i') }
      })
    }

    if (!facility) {
      return NextResponse.json(
        { error: 'Sports facility not found' },
        { status: 404 }
      )
    }

    const deletedFacility = await Sports.findByIdAndDelete(facility._id)

    if (!deletedFacility) {
      return NextResponse.json(
        { error: 'Sports facility not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Sports facility deleted successfully' })

  } catch (error) {
    console.error('Error deleting sports facility:', error)
    return NextResponse.json(
      { error: 'Failed to delete sports facility' },
      { status: 500 }
    )
  }
}
