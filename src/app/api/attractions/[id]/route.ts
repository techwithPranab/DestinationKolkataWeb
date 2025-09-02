import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { Attraction } from '@/models'
import { ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()

    const { id } = await params

    let attraction;

    // Try to find by ObjectId first
    if (ObjectId.isValid(id)) {
      attraction = await Attraction.findById(id)
    }

    // If not found by ObjectId, try to find by slug (name converted to slug)
    if (!attraction) {
      let slug = id.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      slug = slug.replace(/^-+/g, '').replace(/-+$/g, '')
      const searchPattern = slug.replace(/-/g, '.*')
      console.log('Searching attraction with pattern:', searchPattern);
      // Search by name regex pattern
      attraction = await Attraction.findOne({
        name: { $regex: new RegExp(searchPattern, 'i') }
      })
    }

    if (!attraction) {
      return NextResponse.json(
        { error: 'Attraction not found' },
        { status: 404 }
      )
    }

    // Only return active attractions for public API
    if (attraction.status !== 'active') {
      return NextResponse.json(
        { error: 'Attraction not available' },
        { status: 404 }
      )
    }

    return NextResponse.json(attraction)

  } catch (error) {
    console.error('Error fetching attraction:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attraction' },
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

    // Find attraction by ObjectId or slug
    let attraction;
    if (ObjectId.isValid(id)) {
      attraction = await Attraction.findById(id)
    } else {
      let slug = id.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      slug = slug.replace(/^-+/g, '').replace(/-+$/g, '')
      const searchPattern = slug.replace(/-/g, '.*')
      attraction = await Attraction.findOne({
        name: { $regex: new RegExp(searchPattern, 'i') }
      })
    }

    if (!attraction) {
      return NextResponse.json(
        { error: 'Attraction not found' },
        { status: 404 }
      )
    }

    const updatedAttraction = await Attraction.findByIdAndUpdate(
      attraction._id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    )

    if (!updatedAttraction) {
      return NextResponse.json(
        { error: 'Attraction not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedAttraction)

  } catch (error) {
    console.error('Error updating attraction:', error)
    return NextResponse.json(
      { error: 'Failed to update attraction' },
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

    // Find attraction by ObjectId or slug
    let attraction;
    if (ObjectId.isValid(id)) {
      attraction = await Attraction.findById(id)
    } else {
      let slug = id.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      slug = slug.replace(/^-+/g, '').replace(/-+$/g, '')
      const searchPattern = slug.replace(/-/g, '.*')
      attraction = await Attraction.findOne({
        name: { $regex: new RegExp(searchPattern, 'i') }
      })
    }

    if (!attraction) {
      return NextResponse.json(
        { error: 'Attraction not found' },
        { status: 404 }
      )
    }

    const deletedAttraction = await Attraction.findByIdAndDelete(attraction._id)

    if (!deletedAttraction) {
      return NextResponse.json(
        { error: 'Attraction not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Attraction deleted successfully' })

  } catch (error) {
    console.error('Error deleting attraction:', error)
    return NextResponse.json(
      { error: 'Failed to delete attraction' },
      { status: 500 }
    )
  }
}
