import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Review } from '@/models/Review'
import { getAuthenticatedUser } from '@/lib/auth-helper'
import mongoose from 'mongoose'

// POST /api/reviews/[id]/report - Report a review for inappropriate content
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const user = await getAuthenticatedUser(request)
    const { reason } = await request.json()

    const review = await Review.findById(id)
    if (!review) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      )
    }

    // Check if user is trying to report their own review
    if (review.user?.toString() === user.userId) {
      return NextResponse.json(
        { success: false, message: 'Cannot report your own review' },
        { status: 400 }
      )
    }

    // Check if user has already reported this review
    const hasReported = review.reportedBy?.some(reportedUserId => 
      reportedUserId.toString() === user.userId
    )

    if (hasReported) {
      return NextResponse.json(
        { success: false, message: 'You have already reported this review' },
        { status: 400 }
      )
    }

    // Add user to reportedBy array
    if (!review.reportedBy) {
      review.reportedBy = []
    }
    review.reportedBy.push(new mongoose.Types.ObjectId(user.userId))

    // If review gets multiple reports, mark for moderation
    if (review.reportedBy.length >= 3 && review.status === 'approved') {
      review.status = 'pending'
    }

    await review.save()

    return NextResponse.json({
      success: true,
      message: 'Review reported successfully. Our team will review it shortly.',
      reportCount: review.reportedBy.length
    })
  } catch (error) {
    console.error('Error reporting review:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to report review' },
      { status: 500 }
    )
  }
}
