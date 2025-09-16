import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Advertising } from '@/models/Advertising'
import { getAuthenticatedUser } from '@/lib/auth-helper'
import mongoose from 'mongoose'

// GET /api/admin/advertising - Get all advertising campaigns
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const user = await getAuthenticatedUser(request)
    
    // Check admin permissions
    if (!['admin', 'moderator'].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Build query
    const query: {
      status?: string
      category?: string
    } = {}
    if (status && ['pending', 'approved', 'active', 'paused', 'completed', 'rejected'].includes(status)) {
      query.status = status
    }
    if (category && ['banner', 'sponsored-content', 'directory-listing', 'event-promotion', 'featured-placement'].includes(category)) {
      query.category = category
    }

    // Build sort
    const sort: Record<string, 1 | -1> = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    // Get campaigns
    const campaigns = await Advertising.find(query)
      .populate('approvedBy', 'firstName lastName name email')
      .sort(sort)
      .skip(skip)
      .limit(limit)

    const total = await Advertising.countDocuments(query)

    // Get stats
    const stats = await Advertising.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    const statusCounts = {
      pending: 0,
      approved: 0,
      active: 0,
      paused: 0,
      completed: 0,
      rejected: 0
    }

    stats.forEach(stat => {
      if (statusCounts.hasOwnProperty(stat._id)) {
        statusCounts[stat._id as keyof typeof statusCounts] = stat.count
      }
    })

    return NextResponse.json({
      success: true,
      campaigns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      stats: statusCounts
    })
  } catch (error) {
    console.error('Error fetching advertising campaigns:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

// POST /api/admin/advertising - Create new advertising campaign
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const user = await getAuthenticatedUser(request)
    
    // Check admin permissions
    if (!['admin', 'moderator'].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access' },
        { status: 403 }
      )
    }

    const campaignData = await request.json()
    
    // Create new campaign
    const campaign = new Advertising({
      ...campaignData,
      status: 'pending'
    })

    await campaign.save()

    return NextResponse.json({
      success: true,
      message: 'Advertising campaign created successfully',
      campaign
    })
  } catch (error) {
    console.error('Error creating advertising campaign:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/advertising - Update campaign status
export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    const user = await getAuthenticatedUser(request)
    
    // Check admin permissions
    if (!['admin', 'moderator'].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access' },
        { status: 403 }
      )
    }

    const { campaignId, status, rejectionReason } = await request.json()

    if (!campaignId || !status) {
      return NextResponse.json(
        { success: false, message: 'Campaign ID and status are required' },
        { status: 400 }
      )
    }

    const campaign = await Advertising.findById(campaignId)
    if (!campaign) {
      return NextResponse.json(
        { success: false, message: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Update campaign
    campaign.status = status
    if (status === 'approved') {
      campaign.approvedBy = new mongoose.Types.ObjectId(user.userId)
      campaign.approvedAt = new Date()
    }
    if (status === 'rejected' && rejectionReason) {
      campaign.rejectionReason = rejectionReason
    }

    await campaign.save()

    return NextResponse.json({
      success: true,
      message: `Campaign ${status} successfully`,
      campaign
    })
  } catch (error) {
    console.error('Error updating campaign status:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update campaign' },
      { status: 500 }
    )
  }
}
