import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Partnership } from '@/models/Partnership'
import { getAuthenticatedUser } from '@/lib/auth-helper'

// GET /api/admin/partnerships - Get all partnerships
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
    const partnerType = searchParams.get('partnerType')
    const partnershipType = searchParams.get('partnershipType')
    const priority = searchParams.get('priority')
    const assignedTo = searchParams.get('assignedTo')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Build query
    const query: {
      status?: string
      partnerType?: string
      partnershipType?: string
      priority?: string
      assignedTo?: string
    } = {}
    if (status) {
      query.status = status
    }
    if (partnerType) {
      query.partnerType = partnerType
    }
    if (partnershipType) {
      query.partnershipType = partnershipType
    }
    if (priority) {
      query.priority = priority
    }
    if (assignedTo) {
      query.assignedTo = assignedTo
    }

    // Build sort
    const sort: Record<string, 1 | -1> = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    // Get partnerships
    const partnerships = await Partnership.find(query)
      .populate('assignedTo', 'firstName lastName name email')
      .populate('approvedBy', 'firstName lastName name')
      .populate('communicationLog.createdBy', 'firstName lastName name')
      .sort(sort)
      .skip(skip)
      .limit(limit)

    const total = await Partnership.countDocuments(query)

    // Get stats
    const stats = await Partnership.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    const statusCounts: Record<string, number> = {
      inquiry: 0,
      'under-review': 0,
      negotiation: 0,
      approved: 0,
      active: 0,
      paused: 0,
      terminated: 0,
      rejected: 0
    }

    stats.forEach(stat => {
      if (statusCounts.hasOwnProperty(stat._id)) {
        statusCounts[stat._id] = stat.count
      }
    })

    return NextResponse.json({
      success: true,
      partnerships,
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
    console.error('Error fetching partnerships:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch partnerships' },
      { status: 500 }
    )
  }
}

// POST /api/admin/partnerships - Create new partnership
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

    const partnershipData = await request.json()
    
    // Create new partnership
    const partnership = new Partnership({
      ...partnershipData,
      assignedTo: user.userId
    })

    await partnership.save()

    return NextResponse.json({
      success: true,
      message: 'Partnership created successfully',
      partnership
    })
  } catch (error) {
    console.error('Error creating partnership:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create partnership' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/partnerships - Update partnership status
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

    const { partnershipId, status, rejectionReason, assignedTo } = await request.json()

    if (!partnershipId) {
      return NextResponse.json(
        { success: false, message: 'Partnership ID is required' },
        { status: 400 }
      )
    }

    const partnership = await Partnership.findById(partnershipId)
    if (!partnership) {
      return NextResponse.json(
        { success: false, message: 'Partnership not found' },
        { status: 404 }
      )
    }

    // Update partnership
    if (status) {
      partnership.status = status
      if (status === 'approved') {
        partnership.approvedBy = user.userId
        partnership.approvedAt = new Date()
      }
      if (status === 'rejected' && rejectionReason) {
        partnership.rejectionReason = rejectionReason
      }
    }

    if (assignedTo) {
      partnership.assignedTo = assignedTo
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
