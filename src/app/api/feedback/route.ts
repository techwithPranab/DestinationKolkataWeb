import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Feedback } from '@/models'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const priority = searchParams.get('priority')

    // Build query
    const query: Record<string, unknown> = {}

    if (status) {
      query.status = status
    }

    if (type) {
      query.type = type
    }

    if (priority) {
      query.priority = priority
    }

    // Get total count
    const total = await Feedback.countDocuments(query)
    const totalPages = Math.ceil(total / limit)

    // Get feedback with pagination
    const feedback = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    return NextResponse.json({
      success: true,
      data: feedback,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()

    // Validate required fields
    const requiredFields = ['type', 'subject', 'message']
    const missingFields = requiredFields.filter(field => !body[field])

    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate feedback type
    const validTypes = ['general', 'bug', 'feature', 'content', 'design', 'other']
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid feedback type' },
        { status: 400 }
      )
    }

    // Validate email if provided
    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { success: false, error: 'Invalid email format' },
          { status: 400 }
        )
      }
    }

    // Validate rating if provided
    if (body.rating && (body.rating < 1 || body.rating > 5)) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Create new feedback
    const feedback = new Feedback({
      type: body.type,
      subject: body.subject.trim(),
      message: body.message.trim(),
      email: body.email ? body.email.toLowerCase().trim() : undefined,
      rating: body.rating,
      likes: body.likes || [],
      dislikes: body.dislikes || [],
      category: body.category || 'website',
      priority: body.priority || 'medium'
    })

    await feedback.save()

    return NextResponse.json({
      success: true,
      data: feedback,
      message: 'Thank you for your feedback! We appreciate your input.'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating feedback:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}
