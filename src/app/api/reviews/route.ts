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

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string; email: string; role: string }

    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

// GET /api/reviews?entityId=...&entityType=...&page=...&limit=...
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const entityId = searchParams.get('entityId')
    const entityType = searchParams.get('entityType')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    if (!entityId || !entityType) {
      return NextResponse.json(
        { success: false, error: 'entityId and entityType are required' },
        { status: 400 }
      )
    }

    // Validate entityType
    const validEntityTypes = ['hotel', 'restaurant', 'attraction', 'event', 'sports']
    if (!validEntityTypes.includes(entityType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid entityType' },
        { status: 400 }
      )
    }

    const result = await Review.getEntityReviews(entityId, entityType, page, limit, sortBy, sortOrder)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// POST /api/reviews
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { entityId, entityType, rating, title, comment, authorName, authorEmail, images, verified } = body

    // Validate required fields
    if (!entityId || !entityType || !rating || !comment) {
      return NextResponse.json(
        { success: false, error: 'entityId, entityType, rating, and comment are required' },
        { status: 400 }
      )
    }

    // Validate entityType
    const validEntityTypes = ['hotel', 'restaurant', 'attraction', 'event', 'sports']
    if (!validEntityTypes.includes(entityType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid entityType' },
        { status: 400 }
      )
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Get user from token if available
    const userToken = await getUserFromToken(request)

    // Create review data
    const reviewData: {
      entityId: string
      entityType: string
      rating: number
      title?: string
      comment: string
      images: string[]
      verified: boolean
      user?: string
      authorName?: string
      authorEmail?: string
    } = {
      entityId,
      entityType,
      rating,
      title,
      comment,
      images: images || [],
      verified: verified || false
    }

    if (userToken?.userId) {
      // Registered user
      reviewData.user = userToken.userId
    } else {
      // Anonymous user - require name and email
      if (!authorName || !authorEmail) {
        return NextResponse.json(
          { success: false, error: 'Name and email are required for anonymous reviews' },
          { status: 400 }
        )
      }
      reviewData.authorName = authorName
      reviewData.authorEmail = authorEmail
    }

    // Create the review
    const review = new Review(reviewData)
    await review.save()

    // Populate user data if it's a registered user
    if (review.user) {
      await review.populate('user', 'firstName lastName name email profile.avatar')
    }

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Review submitted successfully. It will be published after moderation.'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating review:', error)

    // Handle duplicate review error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    if (errorMessage.includes('already reviewed') || errorMessage.includes('already exists')) {
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
