import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectToDatabase } from '@/lib/mongodb'

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

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)
    
    if (user.role !== 'admin' && user.role !== 'moderator') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'pending'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const { db } = await connectToDatabase()

    // Build query
    const query: Record<string, unknown> = {}
    if (status !== 'all') {
      query.status = status
    }

    // Get submissions with user details
    const submissions = await db.collection('submissions')
      .aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            _id: 1,
            type: 1,
            title: 1,
            description: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
            adminNotes: 1,
            submissionData: 1,
            'submittedBy.name': { $concat: ['$user.firstName', ' ', '$user.lastName'] },
            'submittedBy.email': '$user.email',
            'submittedBy.phone': '$user.phone'
          }
        },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit }
      ])
      .toArray()

    // Get total count
    const totalCount = await db.collection('submissions').countDocuments(query)

    // Transform submissions for response
    const transformedSubmissions = submissions.map((submission) => ({
      id: submission._id.toString(),
      type: submission.type,
      title: submission.title,
      description: submission.description,
      status: submission.status,
      createdAt: submission.createdAt,
      submittedBy: submission.submittedBy,
      submissionData: submission.submissionData,
      adminNotes: submission.adminNotes
    }))

    return NextResponse.json({
      submissions: transformedSubmissions,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    })

  } catch (error) {
    console.error('Admin submissions API error:', error)
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    )
  }
}
