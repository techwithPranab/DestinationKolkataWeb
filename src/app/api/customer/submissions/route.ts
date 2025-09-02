import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

async function getUserFromToken(req: NextRequest): Promise<{ userId: string; role: string; email: string }> {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                req.cookies.get('authToken')?.value

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
    
    if (user.role !== 'customer') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { db } = await connectToDatabase()
    const userId = ObjectId.createFromHexString(user.userId)

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    // Build query
    const query: Record<string, unknown> = { userId: userId }
    if (status) query.status = status
    if (type) query.type = type

    // Get submissions with pagination
    const submissions = await db.collection('submissions')
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    // Get total count
    const totalCount = await db.collection('submissions').countDocuments(query)

    // Transform submissions for response
    const transformedSubmissions = submissions.map((submission) => ({
      id: submission._id.toString(),
      type: submission.type,
      title: submission.title,
      status: submission.status,
      createdAt: submission.createdAt,
      views: submission.views || 0,
      adminNotes: submission.adminNotes
    }))

    return NextResponse.json({
      submissions: transformedSubmissions,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    })

  } catch (error) {
    console.error('Submissions API error:', error)
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    )
  }
}
