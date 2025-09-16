import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Partnership } from '@/models/Partnership'
import { getAuthenticatedUser } from '@/lib/auth-helper'
import mongoose from 'mongoose'

// GET /api/admin/partnerships/[id] - Get specific partnership
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const user = await getAuthenticatedUser(request)
    
    // Check admin permissions
    if (!['admin', 'moderator'].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access' },
        { status: 403 }
      )
    }

    const partnership = await Partnership.findById(id)
      .populate('assignedTo', 'firstName lastName name email')
      .populate('approvedBy', 'firstName lastName name')
      .populate('communicationLog.createdBy', 'firstName lastName name')

    if (!partnership) {
      return NextResponse.json(
        { success: false, message: 'Partnership not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      partnership
    })
  } catch (error) {
    console.error('Error fetching partnership:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch partnership' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/partnerships/[id] - Update specific partnership
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const user = await getAuthenticatedUser(request)
    
    // Check admin permissions
    if (!['admin', 'moderator'].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access' },
        { status: 403 }
      )
    }

    const updates = await request.json()

    const partnership = await Partnership.findById(id)
    if (!partnership) {
      return NextResponse.json(
        { success: false, message: 'Partnership not found' },
        { status: 404 }
      )
    }

    // Apply updates
    Object.assign(partnership, updates)

    // Handle status changes
    if (updates.status === 'approved' && partnership.status !== 'approved') {
      partnership.approvedBy = new mongoose.Types.ObjectId(user.userId)
      partnership.approvedAt = new Date()
    }

    await partnership.save()

    return NextResponse.json({
      success: true,
      message: 'Partnership updated successfully',
      partnership
    })
  } catch (error) {
    console.error('Error updating partnership:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update partnership' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/partnerships/[id] - Delete specific partnership
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const user = await getAuthenticatedUser(request)
    
    // Check admin permissions (only admins can delete)
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access. Admin role required.' },
        { status: 403 }
      )
    }

    const partnership = await Partnership.findById(id)
    if (!partnership) {
      return NextResponse.json(
        { success: false, message: 'Partnership not found' },
        { status: 404 }
      )
    }

    // Don't delete active partnerships
    if (partnership.status === 'active') {
      return NextResponse.json(
        { success: false, message: 'Cannot delete active partnerships. Please pause or terminate first.' },
        { status: 400 }
      )
    }

    await Partnership.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: 'Partnership deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting partnership:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete partnership' },
      { status: 500 }
    )
  }
}
