import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Restaurant } from '@/models'
import { ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id } = await params

    let restaurant;

    // Try to find by ObjectId first
    if (ObjectId.isValid(id)) {
      restaurant = await Restaurant.findById(id)
    }

    // If not found by ObjectId, try to find by slug (name converted to slug)
    if (!restaurant) {
      let slug = id.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      slug = slug.replace(/^-+/g, '').replace(/-+$/g, '')
      const searchPattern = slug.replace(/-/g, '.*')
      console.log('Searching restaurant with pattern:', searchPattern);
      // Search by name regex pattern
      restaurant = await Restaurant.findOne({
        name: { $regex: new RegExp(searchPattern, 'i') }
      })
    }

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    // Only return active restaurants for public API
    if (restaurant.status !== 'active') {
      return NextResponse.json(
        { error: 'Restaurant not available' },
        { status: 404 }
      )
    }

    return NextResponse.json(restaurant)

  } catch (error) {
    console.error('Error fetching restaurant:', error)
    return NextResponse.json(
      { error: 'Failed to fetch restaurant' },
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

    // Find restaurant by ObjectId or slug
    let restaurant;
    if (ObjectId.isValid(id)) {
      restaurant = await Restaurant.findById(id)
    } else {
      let slug = id.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      slug = slug.replace(/^-+/g, '').replace(/-+$/g, '')
      const searchPattern = slug.replace(/-/g, '.*')
      restaurant = await Restaurant.findOne({
        name: { $regex: new RegExp(searchPattern, 'i') }
      })
    }

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      restaurant._id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    )

    if (!updatedRestaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedRestaurant)

  } catch (error) {
    console.error('Error updating restaurant:', error)
    return NextResponse.json(
      { error: 'Failed to update restaurant' },
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

    // Find restaurant by ObjectId or slug
    let restaurant;
    if (ObjectId.isValid(id)) {
      restaurant = await Restaurant.findById(id)
    } else {
      let slug = id.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      slug = slug.replace(/^-+/g, '').replace(/-+$/g, '')
      const searchPattern = slug.replace(/-/g, '.*')
      restaurant = await Restaurant.findOne({
        name: { $regex: new RegExp(searchPattern, 'i') }
      })
    }

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    const deletedRestaurant = await Restaurant.findByIdAndDelete(restaurant._id)

    if (!deletedRestaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Restaurant deleted successfully' })

  } catch (error) {
    console.error('Error deleting restaurant:', error)
    return NextResponse.json(
      { error: 'Failed to delete restaurant' },
      { status: 500 }
    )
  }
}
