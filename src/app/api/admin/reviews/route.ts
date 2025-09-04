import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Review } from '@/models'
import jwt from 'jsonwebtoken'

// Helper function to get user from token
async function getUserFromToken(request: NextRequest): Promise<{ userId: string; email: string; role: string } | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return null
    }
    console.log('User token:', authHeader);
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string; email: string; role: string }

    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

// GET /api/admin/reviews - Get all reviews for admin management
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    console.log('Database connected');
    // Check if user is admin
    const userToken = await getUserFromToken(request)
    console.log('User token:', userToken);
    if (!userToken || userToken.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || 'all'
    const entityType = searchParams.get('entityType') || 'all'

    const skip = (page - 1) * limit

    // Build query
    const query: Record<string, unknown> = {}
    if (status !== 'all') {
      query.status = status
    }
    if (entityType !== 'all') {
      query.entityType = entityType
    }

    const reviews = await Review.find(query)
      .populate('user', 'firstName lastName name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v')

    const total = await Review.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
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

// PATCH /api/admin/reviews - Update review status (approve/reject)
export async function PATCH(request: NextRequest) {
  try {
    await connectDB()

    // Check if user is admin
    const userToken = await getUserFromToken(request)
    if (!userToken || userToken.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { reviewId, status } = body

    if (!reviewId || !status) {
      return NextResponse.json(
        { success: false, error: 'reviewId and status are required' },
        { status: 400 }
      )
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be approved or rejected' },
        { status: 400 }
      )
    }

    const review = await Review.findByIdAndUpdate(
      reviewId,
      {
        status,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('user', 'firstName lastName name email')

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      )
    }

    // If approving the review, update the entity's rating
    if (status === 'approved') {
      // This would require updating the parent entity's rating
      // We'll implement this when we create the rating update logic
    }

    return NextResponse.json({
      success: true,
      data: review,
      message: `Review ${status} successfully`
    })

  } catch (error) {
    console.error('Error updating review status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update review status' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/reviews - Delete a review
export async function DELETE(request: NextRequest) {
  try {
    await connectDB()

    // Check if user is admin
    const userToken = await getUserFromToken(request)
    if (!userToken || userToken.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const reviewId = searchParams.get('reviewId')

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: 'reviewId is required' },
        { status: 400 }
      )
    }

    const review = await Review.findByIdAndDelete(reviewId)

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete review' },
      { status: 500 }
    )
  }
}
