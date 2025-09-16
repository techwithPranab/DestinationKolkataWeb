import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Review } from '@/models/Review'
import { getAuthenticatedUser } from '@/lib/auth-helper'

// GET /api/reviews/[id] - Get specific review
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params

    const review = await Review.findById(id)
      .populate('user', 'firstName lastName name email profile.avatar')
      .populate('moderatedBy', 'firstName lastName name')

    if (!review) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      review
    })
  } catch (error) {
    console.error('Error fetching review:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch review' },
      { status: 500 }
    )
  }
}

// PUT /api/reviews/[id] - Update review (edit)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const user = await getAuthenticatedUser(request)
    
    const { rating, title, comment, images } = await request.json()

    const review = await Review.findById(id)
    if (!review) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      )
    }

    // Check if user owns the review
    if (review.user?.toString() !== user.userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized to edit this review' },
        { status: 403 }
      )
    }

    // Update review
    review.rating = rating || review.rating
    review.title = title !== undefined ? title : review.title
    review.comment = comment || review.comment
    review.images = images || review.images
    review.isEdited = true
    review.lastEditedAt = new Date()
    review.status = 'pending' // Reset status for re-moderation

    await review.save()

    return NextResponse.json({
      success: true,
      message: 'Review updated successfully. It will be re-reviewed for approval.',
      review
    })
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update review' },
      { status: 500 }
    )
  }
}

// DELETE /api/reviews/[id] - Delete review
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const user = await getAuthenticatedUser(request)

    const review = await Review.findById(id)
    if (!review) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      )
    }

    // Check if user owns the review or is admin
    if (review.user?.toString() !== user.userId && !['admin', 'moderator'].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized to delete this review' },
        { status: 403 }
      )
    }

    await Review.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete review' },
      { status: 500 }
    )
  }
}
