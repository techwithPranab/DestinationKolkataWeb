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

    // Get submission counts by status
    const submissionStats = await db.collection('submissions').aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray()

    // Get total views
    const viewsResult = await db.collection('submissions').aggregate([
      { $match: { userId: userId, status: 'approved' } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' }
        }
      }
    ]).toArray()

    // Get user membership info
    const userInfo = await db.collection('users').findOne(
      { _id: userId },
      { projection: { membershipType: 1, membershipExpiry: 1 } }
    )

    const stats = {
      totalSubmissions: 0,
      approvedSubmissions: 0,
      pendingSubmissions: 0,
      rejectedSubmissions: 0,
      totalViews: viewsResult[0]?.totalViews || 0,
      membershipType: userInfo?.membershipType || 'free',
      membershipExpiry: userInfo?.membershipExpiry
    }

    // Process submission stats
    submissionStats.forEach((stat) => {
      stats.totalSubmissions += stat.count
      switch (stat._id) {
        case 'approved':
          stats.approvedSubmissions = stat.count
          break
        case 'pending':
          stats.pendingSubmissions = stat.count
          break
        case 'rejected':
          stats.rejectedSubmissions = stat.count
          break
      }
    })

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    )
  }
}
