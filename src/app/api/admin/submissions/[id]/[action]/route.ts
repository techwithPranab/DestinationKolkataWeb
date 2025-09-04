import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

async function getUserFromToken(req: NextRequest): Promise<{ userId: string; role: string; email: string }> {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    throw new Error('No token provided')
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string; role: string; email: string }
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    throw new Error('Invalid token')
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  let action = ''
  
  try {
    const user = await getUserFromToken(req)
    
    if (user.role !== 'admin' && user.role !== 'moderator') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      )
    }

    const resolvedParams = await params
    const { id } = resolvedParams
    action = resolvedParams.action
    const body = await req.json()
    const { adminNotes } = body

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { message: 'Invalid action' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const submissionId = new ObjectId(id)

    // Get the submission
    const submission = await db.collection('submissions').findOne({ _id: submissionId })
    
    if (!submission) {
      return NextResponse.json(
        { message: 'Submission not found' },
        { status: 404 }
      )
    }

    if (submission.status !== 'pending') {
      return NextResponse.json(
        { message: 'Submission has already been processed' },
        { status: 400 }
      )
    }

    // Update submission status
    const updateData: Record<string, unknown> = {
      status: action === 'approve' ? 'approved' : 'rejected',
      adminId: new ObjectId(user.userId),
      processedAt: new Date(),
      updatedAt: new Date()
    }

    if (adminNotes) {
      updateData.adminNotes = adminNotes
    }

    await db.collection('submissions').updateOne(
      { _id: submissionId },
      { $set: updateData }
    )

    // If approved, copy to the appropriate collection
    if (action === 'approve') {
      let targetCollection = ''
      const documentData = { ...submission.submissionData }

      switch (submission.type) {
        case 'hotel':
          targetCollection = 'hotels'
          break
        case 'restaurant':
          targetCollection = 'restaurants'
          break
        case 'event':
          targetCollection = 'events'
          break
        case 'promotion':
          targetCollection = 'promotions'
          break
        case 'sports':
          targetCollection = 'sports'
          break
        default:
          throw new Error('Unknown submission type')
      }

      // Add metadata
      documentData.submissionId = submissionId
      documentData.approvedAt = new Date()
      documentData.approvedBy = new ObjectId(user.userId)
      documentData.status = 'active'
      documentData.featured = false
      documentData.views = 0
      documentData.likes = 0

      // Insert into target collection
      await db.collection(targetCollection).insertOne(documentData)
    }

    // Send notification to user (you can implement email/SMS notification here)
    // await sendNotificationToUser(submission.userId, action, adminNotes)

    return NextResponse.json({
      message: `Submission ${action}d successfully`,
      submission: {
        id: submission._id.toString(),
        status: updateData.status,
        processedAt: updateData.processedAt
      }
    })

  } catch (error) {
    console.error(`Submission ${action} error:`, error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
