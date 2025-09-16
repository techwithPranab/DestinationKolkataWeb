import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Review } from '@/models/Review'
import { getAuthenticatedUser } from '@/lib/auth-helper'
import mongoose from 'mongoose'

// POST /api/admin/reviews/moderate - Moderate reviews (approve/reject)
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const user = await getAuthenticatedUser(request)
    
    // Check admin/moderator permissions
    if (!['admin', 'moderator'].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access' },
        { status: 403 }
      )
    }

    const { reviewId, action, notes } = await request.json()

    if (!reviewId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, message: 'Invalid review ID or action' },
        { status: 400 }
      )
    }

    const review = await Review.findById(reviewId)
    if (!review) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      )
    }

    // Update review status
    review.status = action === 'approve' ? 'approved' : 'rejected'
    review.moderatedBy = new mongoose.Types.ObjectId(user.userId)
    review.moderatedAt = new Date()
    if (notes) {
      review.moderationNotes = notes
    }

    await review.save()

    return NextResponse.json({
      success: true,
      message: `Review ${action}d successfully`,
      review: {
        id: review._id,
        status: review.status,
        moderatedAt: review.moderatedAt,
        moderatedBy: review.moderatedBy
      }
    })
  } catch (error) {
    console.error('Error moderating review:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to moderate review' },
      { status: 500 }
    )
  }
}

// GET /api/admin/reviews/moderate - Get reviews pending moderation
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const user = await getAuthenticatedUser(request)
    
    // Check admin/moderator permissions
    if (!['admin', 'moderator'].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || 'pending'
    const entityType = searchParams.get('entityType')

    const skip = (page - 1) * limit

    // Build query
    const query: {
      status: string
      entityType?: string
    } = { status }
    if (entityType && ['hotel', 'restaurant', 'attraction', 'event', 'sports'].includes(entityType)) {
      query.entityType = entityType
    }

    // Get reviews
    const reviews = await Review.find(query)
      .populate('user', 'firstName lastName name email profile.avatar')
      .populate('moderatedBy', 'firstName lastName name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Review.countDocuments(query)

    return NextResponse.json({
      success: true,
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      stats: {
        pending: await Review.countDocuments({ status: 'pending' }),
        approved: await Review.countDocuments({ status: 'approved' }),
        rejected: await Review.countDocuments({ status: 'rejected' })
      }
    })
  } catch (error) {
    console.error('Error fetching reviews for moderation:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}
