import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { getAuthenticatedUser } from '@/lib/auth-helper'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req)
    
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
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Build query
    const query: Record<string, unknown> = { userId: userId }
    if (status) query.status = status
    if (type) query.type = type
    if (dateFrom || dateTo) {
      const dateQuery: Record<string, Date> = {}
      if (dateFrom) dateQuery.$gte = new Date(dateFrom)
      if (dateTo) dateQuery.$lte = new Date(dateTo)
      query.createdAt = dateQuery
    }

    // Get submissions with pagination
    const sortOptions: Record<string, 1 | -1> = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    const submissions = await db.collection('submissions')
      .find(query)
      .sort(sortOptions)
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
