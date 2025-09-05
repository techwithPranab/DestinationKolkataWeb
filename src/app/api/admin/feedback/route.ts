import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Feedback } from '@/models'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')

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

    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    // Get total count
    const total = await Feedback.countDocuments(query)
    const totalPages = Math.ceil(total / limit)

    // Get feedback with pagination
    const feedback = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('reviewedBy', 'firstName lastName email')
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

export async function PATCH(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { id, status, priority, notes, reviewedBy } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Feedback ID is required' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}

    if (status) {
      updateData.status = status
      if (status !== 'new') {
        updateData.reviewedAt = new Date()
        updateData.reviewedBy = reviewedBy
      }
    }

    if (priority) {
      updateData.priority = priority
    }

    if (notes !== undefined) {
      updateData.notes = notes
    }

    updateData.updatedAt = new Date()

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('reviewedBy', 'firstName lastName email')

    if (!feedback) {
      return NextResponse.json(
        { success: false, error: 'Feedback not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: feedback,
      message: 'Feedback updated successfully'
    })

  } catch (error) {
    console.error('Error updating feedback:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update feedback' },
      { status: 500 }
    )
  }
}
