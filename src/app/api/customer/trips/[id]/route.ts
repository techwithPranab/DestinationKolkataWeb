import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Trip } from '@/models'
import { getAuthenticatedUser } from '@/lib/auth-helper'

// GET /api/customer/trips/[id] - Get specific trip
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const user = await getAuthenticatedUser(request)
    if (user.role !== 'customer') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { id } = await params
    const trip = await Trip.findOne({ _id: id, userId: user.userId })

    if (!trip) {
      return NextResponse.json(
        { success: false, message: 'Trip not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      trip
    })
  } catch (error) {
    console.error('Error fetching trip:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch trip' },
      { status: 500 }
    )
  }
}

// PUT /api/customer/trips/[id] - Update trip
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const user = await getAuthenticatedUser(request)
    if (user.role !== 'customer') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { id } = await params
    const updateData = await request.json()

    const updatedTrip = await Trip.findOneAndUpdate(
      { _id: id, userId: user.userId },
      { ...updateData, updatedAt: new Date() },
      { new: true }
    )

    if (!updatedTrip) {
      return NextResponse.json(
        { success: false, message: 'Trip not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Trip updated successfully',
      trip: updatedTrip
    })
  } catch (error) {
    console.error('Error updating trip:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update trip' },
      { status: 500 }
    )
  }
}

// DELETE /api/customer/trips/[id] - Delete trip
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const user = await getAuthenticatedUser(request)
    if (user.role !== 'customer') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { id } = await params
    const deletedTrip = await Trip.findOneAndDelete({ _id: id, userId: user.userId })

    if (!deletedTrip) {
      return NextResponse.json(
        { success: false, message: 'Trip not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Trip deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting trip:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete trip' },
      { status: 500 }
    )
  }
}
