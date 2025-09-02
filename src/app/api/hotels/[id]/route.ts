import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Hotel } from '@/models'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id } = await params

    let hotel;

    // Try to find by ObjectId first
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      hotel = await Hotel.findById(id)
    }

    // If not found by ObjectId, try to find by slug (name converted to slug)
    if (!hotel) {
      const slug = id.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      const searchPattern = slug.replace(/-/g, '.*')
      console.log('Searching hotel with pattern:', searchPattern);
      // Search by name regex pattern
      hotel = await Hotel.findOne({
        name: { $regex: new RegExp(searchPattern, 'i') }
      })
    }

    if (!hotel) {
      return NextResponse.json(
        { success: false, error: 'Hotel not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: hotel
    })

  } catch (error) {
    console.error('Error fetching hotel:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hotel' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id } = await params
    const body = await request.json()

    // Find hotel by ObjectId or slug
    let hotel;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      hotel = await Hotel.findById(id)
    } else {
      const slug = id.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      const searchPattern = slug.replace(/-/g, '.*')
      hotel = await Hotel.findOne({
        name: { $regex: new RegExp(searchPattern, 'i') }
      })
    }

    if (!hotel) {
      return NextResponse.json(
        { success: false, error: 'Hotel not found' },
        { status: 404 }
      )
    }

    // Validate required fields if provided
    const allowedFields = [
      'name', 'description', 'shortDescription', 'category', 'location',
      'address', 'contact', 'priceRange', 'checkInTime', 'checkOutTime',
      'amenities', 'roomTypes', 'images', 'tags', 'status', 'featured',
      'promoted', 'cancellationPolicy', 'policies', 'views'
    ]

    const updateData: Record<string, unknown> = {}

    // Only include allowed fields
    Object.keys(body).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = body[key]
      }
    })

    // Add updatedAt timestamp
    updateData.updatedAt = new Date()

    const updatedHotel = await Hotel.findByIdAndUpdate(
      hotel._id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!updatedHotel) {
      return NextResponse.json(
        { success: false, error: 'Hotel not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedHotel,
      message: 'Hotel updated successfully'
    })

  } catch (error) {
    console.error('Error updating hotel:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update hotel' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id } = await params

    // Find hotel by ObjectId or slug
    let hotel;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      hotel = await Hotel.findById(id)
    } else {
      const slug = id.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      const searchPattern = slug.replace(/-/g, '.*')
      hotel = await Hotel.findOne({
        name: { $regex: new RegExp(searchPattern, 'i') }
      })
    }

    if (!hotel) {
      return NextResponse.json(
        { success: false, error: 'Hotel not found' },
        { status: 404 }
      )
    }

    const deletedHotel = await Hotel.findByIdAndDelete(hotel._id)

    if (!deletedHotel) {
      return NextResponse.json(
        { success: false, error: 'Hotel not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Hotel deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting hotel:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete hotel' },
      { status: 500 }
    )
  }
}
