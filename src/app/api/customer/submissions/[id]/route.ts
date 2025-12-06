import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { getAuthenticatedUser } from '@/lib/auth-helper'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(req)

    if (user.role !== 'customer') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      )
    }

    const resolvedParams = await params
    const { id } = resolvedParams
    const { db } = await connectToDatabase()
    const submissionId = new ObjectId(id)

    // Get submission and ensure it belongs to the user
    const submission = await db.collection('submissions').findOne({
      _id: submissionId,
      userId: new ObjectId(user.userId)
    })

    if (!submission) {
      return NextResponse.json(
        { message: 'Submission not found' },
        { status: 404 }
      )
    }

    // Transform submission for response
    const transformedSubmission = {
      id: submission._id.toString(),
      type: submission.type,
      title: submission.title,
      status: submission.status,
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt,
      views: submission.views || 0,
      adminNotes: submission.adminNotes,
      // Include the original submission data for editing
      data: submission.submissionData || submission
    }

    return NextResponse.json({ submission: transformedSubmission })

  } catch (error) {
    console.error('Get submission error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(req)

    if (user.role !== 'customer') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      )
    }

    const resolvedParams = await params
    const { id } = resolvedParams
    const { db } = await connectToDatabase()
    const submissionId = new ObjectId(id)

    // Get current submission
    const currentSubmission = await db.collection('submissions').findOne({
      _id: submissionId,
      userId: new ObjectId(user.userId)
    })

    if (!currentSubmission) {
      return NextResponse.json(
        { message: 'Submission not found' },
        { status: 404 }
      )
    }

    // Allow editing pending and approved submissions
    // Rejected submissions cannot be edited (must be resubmitted as new)
    if (currentSubmission.status === 'rejected') {
      return NextResponse.json(
        { message: 'Rejected submissions cannot be edited. Please create a new submission.' },
        { status: 400 }
      )
    }

    // Handle both JSON and form-data requests
    let submissionData: Record<string, unknown> = { ...currentSubmission.submissionData }
    
    try {
      // Try to parse as FormData first
      const formData = await req.formData()
      const hasFormData = formData.has('name') || formData.has('description') || formData.has('address')
      
      if (hasFormData) {
        // Handle form-data (from create pages)
        for (const [key, value] of formData.entries()) {
          if (key === 'images') {
            // Handle images as JSON
            submissionData[key] = JSON.parse(value as string)
          } else if (['amenities', 'roomTypes', 'cuisineTypes'].includes(key)) {
            // Handle arrays
            submissionData[key] = JSON.parse(value as string)
          } else {
            submissionData[key] = value
          }
        }
      } else {
        // Fall back to JSON
        const jsonData = await req.json()
        submissionData = { ...submissionData, ...jsonData }
      }
    } catch (parseError) {
      console.error('Parse error:', parseError)
      return NextResponse.json(
        { message: 'Unable to parse request data. Use multipart/form-data or application/json' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
      submissionData,
      title: submissionData.name || submissionData.title || 'Untitled'
    }

    // If updating an approved submission, mark it as pending for re-review
    if (currentSubmission.status === 'approved') {
      updateData.status = 'pending'
      updateData.adminNotes = 'Updated by customer - pending re-review'
      updateData.previousStatus = 'approved'
      updateData.lastApprovedAt = currentSubmission.approvedAt
    }

    // Update the submission
    await db.collection('submissions').updateOne(
      { _id: submissionId },
      { $set: updateData }
    )

    return NextResponse.json({
      message: 'Submission updated successfully'
    })

  } catch (error) {
    console.error('Update submission error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(req)

    if (user.role !== 'customer') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      )
    }

    const resolvedParams = await params
    const { id } = resolvedParams
    const { db } = await connectToDatabase()
    const submissionId = new ObjectId(id)

    // Get submission and ensure it belongs to the user
    const submission = await db.collection('submissions').findOne({
      _id: submissionId,
      userId: new ObjectId(user.userId)
    })

    if (!submission) {
      return NextResponse.json(
        { message: 'Submission not found' },
        { status: 404 }
      )
    }

    // Only allow deleting pending or rejected submissions
    if (submission.status === 'approved') {
      return NextResponse.json(
        { message: 'Approved submissions cannot be deleted' },
        { status: 400 }
      )
    }

    // Delete the submission
    await db.collection('submissions').deleteOne({ _id: submissionId })

    return NextResponse.json({
      message: 'Submission deleted successfully'
    })

  } catch (error) {
    console.error('Delete submission error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
