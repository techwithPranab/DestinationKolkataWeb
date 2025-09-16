import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Review } from '@/models'

// GET /api/reviews/admin - Get all reviews for admin management
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') // pending, approved, rejected
    const entityType = searchParams.get('entityType')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build query
    const query: Record<string, unknown> = {}

    if (status && status !== 'all') {
      query.status = status
    }

    if (entityType && entityType !== 'all') {
      query.entityType = entityType
    }

    // Get reviews with pagination
    const skip = (page - 1) * limit

    const reviews = await Review.find(query)
      .populate('user', 'firstName lastName name email profile.avatar')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Review.countDocuments(query)
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        status,
        entityType
      }
    })

  } catch (error) {
    console.error('Error fetching reviews for admin:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// PATCH /api/reviews/admin - Update review status (approve/reject)
export async function PATCH(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { reviewId, action, reason } = body

    if (!reviewId || !action) {
      return NextResponse.json(
        { success: false, error: 'reviewId and action are required' },
        { status: 400 }
      )
    }

    // Validate action
    const validActions = ['approve', 'reject', 'delete']
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be approve, reject, or delete' },
        { status: 400 }
      )
    }

    const review = await Review.findById(reviewId)

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      )
    }

    if (action === 'delete') {
      await Review.findByIdAndDelete(reviewId)
      return NextResponse.json({
        success: true,
        message: 'Review deleted successfully'
      })
    }

    // Update review status
    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    review.status = newStatus

    if (action === 'reject' && reason) {
      review.moderationNotes = reason
    }

    review.moderatedAt = new Date()
    await review.save()

    return NextResponse.json({
      success: true,
      message: `Review ${action}d successfully`,
      review
    })

  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update review' },
      { status: 500 }
    )
  }
}

// DELETE /api/reviews/admin - Bulk delete reviews
export async function DELETE(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { reviewIds } = body

    if (!reviewIds || !Array.isArray(reviewIds) || reviewIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'reviewIds array is required' },
        { status: 400 }
      )
    }

    const result = await Review.deleteMany({ _id: { $in: reviewIds } })

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.deletedCount} reviews successfully`,
      deletedCount: result.deletedCount
    })

  } catch (error) {
    console.error('Error deleting reviews:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete reviews' },
      { status: 500 }
    )
  }
}
