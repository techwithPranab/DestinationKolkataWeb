import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Submission } from '@/models'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, title, description, userId, submissionData } = body

    // Validate required fields
    if (!type || !title || !description || !submissionData) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate submission type
    const validTypes = ['hotel', 'restaurant', 'attraction', 'event', 'sports', 'travel']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid submission type' },
        { status: 400 }
      )
    }

    // Connect to database
    await connectDB()

    // Create submission
    const submission = new Submission({
      type,
      title,
      description,
      userId: userId || null, // Allow anonymous submissions for now
      submissionData,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await submission.save()

    return NextResponse.json({
      success: true,
      message: 'Submission created successfully',
      submission: {
        id: submission._id.toString(),
        type: submission.type,
        title: submission.title,
        status: submission.status,
        createdAt: submission.createdAt
      }
    })

  } catch (error) {
    console.error('Submission creation error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create submission' },
      { status: 500 }
    )
  }
}
