import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { BusinessResource } from '@/models/BusinessResource'
import { getAuthenticatedUser } from '@/lib/auth-helper'

// GET /api/admin/business-resources - Get all business resources
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
    const targetAudience = searchParams.get('targetAudience')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Build query
    const query: {
      status?: string
      category?: string
      targetAudience?: string
    } = {}
    if (status && ['draft', 'published', 'archived'].includes(status)) {
      query.status = status
    }
    if (category) {
      query.category = category
    }
    if (targetAudience) {
      query.targetAudience = targetAudience
    }

    // Build sort
    const sort: Record<string, 1 | -1> = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    // Get resources
    const resources = await BusinessResource.find(query)
      .populate('author', 'firstName lastName name email')
      .populate('lastUpdatedBy', 'firstName lastName name')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-content -comments') // Exclude large fields for list view

    const total = await BusinessResource.countDocuments(query)

    // Get stats
    const stats = await BusinessResource.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    const statusCounts = {
      draft: 0,
      published: 0,
      archived: 0
    }

    stats.forEach(stat => {
      if (statusCounts.hasOwnProperty(stat._id)) {
        statusCounts[stat._id as keyof typeof statusCounts] = stat.count
      }
    })

    return NextResponse.json({
      success: true,
      resources,
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
    console.error('Error fetching business resources:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch resources' },
      { status: 500 }
    )
  }
}

// POST /api/admin/business-resources - Create new business resource
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

    const resourceData = await request.json()
    
    // Create new resource
    const resource = new BusinessResource({
      ...resourceData,
      author: user.userId,
      lastUpdatedBy: user.userId
    })

    await resource.save()

    return NextResponse.json({
      success: true,
      message: 'Business resource created successfully',
      resource
    })
  } catch (error) {
    console.error('Error creating business resource:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create resource' },
      { status: 500 }
    )
  }
}
