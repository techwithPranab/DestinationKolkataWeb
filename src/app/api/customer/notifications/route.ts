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

    // For now, return mock notifications
    // In a real implementation, you'd fetch from a notifications collection
    const mockNotifications = [
      {
        id: '1',
        type: 'submission_status' as const,
        title: 'Submission Approved',
        message: 'Your hotel "Grand Plaza" has been approved and is now live.',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        actionUrl: '/customer/listings'
      },
      {
        id: '2',
        type: 'system' as const,
        title: 'Welcome to Destination Kolkata',
        message: 'Thank you for joining our platform. Start by creating your first listing!',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      },
      {
        id: '3',
        type: 'message' as const,
        title: 'New Message from Admin',
        message: 'We noticed some issues with your restaurant listing. Please review and update.',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        actionUrl: '/customer/listings'
      }
    ]

    return NextResponse.json({
      notifications: mockNotifications
    })

  } catch (error) {
    console.error('Notifications API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req)

    if (user.role !== 'customer') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Mark all notifications as read
    // In a real implementation, you'd update the database
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Mark all notifications API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
