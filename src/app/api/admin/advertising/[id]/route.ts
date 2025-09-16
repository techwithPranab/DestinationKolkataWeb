import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Advertising } from '@/models/Advertising'
import { getAuthenticatedUser } from '@/lib/auth-helper'
import mongoose from 'mongoose'

// GET /api/admin/advertising/[id] - Get specific campaign
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

    const campaign = await Advertising.findById(id)
      .populate('approvedBy', 'firstName lastName name email')

    if (!campaign) {
      return NextResponse.json(
        { success: false, message: 'Campaign not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      campaign
    })
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch campaign' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/advertising/[id] - Update specific campaign
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

    const campaign = await Advertising.findById(id)
    if (!campaign) {
      return NextResponse.json(
        { success: false, message: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Apply updates
    Object.assign(campaign, updates)

    // Handle status changes
    if (updates.status === 'approved' && campaign.status !== 'approved') {
      campaign.approvedBy = new mongoose.Types.ObjectId(user.userId)
      campaign.approvedAt = new Date()
    }

    await campaign.save()

    return NextResponse.json({
      success: true,
      message: 'Campaign updated successfully',
      campaign
    })
  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update campaign' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/advertising/[id] - Delete specific campaign
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

    const campaign = await Advertising.findById(id)
    if (!campaign) {
      return NextResponse.json(
        { success: false, message: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Don't delete active campaigns
    if (campaign.status === 'active') {
      return NextResponse.json(
        { success: false, message: 'Cannot delete active campaigns. Please pause first.' },
        { status: 400 }
      )
    }

    await Advertising.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete campaign' },
      { status: 500 }
    )
  }
}
