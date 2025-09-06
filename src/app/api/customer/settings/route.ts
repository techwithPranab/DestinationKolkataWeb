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

    const userDoc = await db.collection('users').findOne(
      { _id: new ObjectId(user.userId) },
      {
        projection: {
          preferences: 1,
          verification: 1
        }
      }
    )

    if (!userDoc) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Return settings with defaults if not set
    const settings = {
      preferences: {
        emailNotifications: userDoc.preferences?.emailNotifications ?? true,
        smsNotifications: userDoc.preferences?.smsNotifications ?? false,
        pushNotifications: userDoc.preferences?.pushNotifications ?? false,
        marketingEmails: userDoc.preferences?.marketingEmails ?? false,
        language: userDoc.preferences?.language ?? 'en',
        currency: userDoc.preferences?.currency ?? 'INR',
        timezone: userDoc.preferences?.timezone ?? 'Asia/Kolkata',
        theme: userDoc.preferences?.theme ?? 'light'
      },
      privacy: {
        profileVisibility: userDoc.preferences?.profileVisibility ?? 'public',
        showEmail: userDoc.preferences?.showEmail ?? false,
        showPhone: userDoc.preferences?.showPhone ?? false
      },
      verification: userDoc.verification || {
        email: false,
        phone: false,
        business: false
      }
    }

    return NextResponse.json({
      message: 'Settings retrieved successfully',
      settings
    }, { status: 200 })

  } catch (error) {
    console.error('Settings retrieval error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)

    if (user.role !== 'customer') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { preferences, privacy } = body

    const { db } = await connectToDatabase()

    // Prepare update object
    const updateData: Record<string, unknown> = {
      updatedAt: new Date()
    }

    // Update preferences
    if (preferences) {
      updateData.preferences = {
        ...preferences,
        updatedAt: new Date()
      }

      // Handle privacy settings within preferences
      if (privacy) {
        updateData.preferences = {
          ...(updateData.preferences as Record<string, unknown>),
          ...privacy
        }
      }
    }

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(user.userId) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Fetch updated settings
    const updatedUser = await db.collection('users').findOne(
      { _id: new ObjectId(user.userId) },
      {
        projection: {
          preferences: 1,
          verification: 1
        }
      }
    )

    const updatedSettings = {
      preferences: {
        emailNotifications: updatedUser?.preferences?.emailNotifications ?? true,
        smsNotifications: updatedUser?.preferences?.smsNotifications ?? false,
        pushNotifications: updatedUser?.preferences?.pushNotifications ?? false,
        marketingEmails: updatedUser?.preferences?.marketingEmails ?? false,
        language: updatedUser?.preferences?.language ?? 'en',
        currency: updatedUser?.preferences?.currency ?? 'INR',
        timezone: updatedUser?.preferences?.timezone ?? 'Asia/Kolkata',
        theme: updatedUser?.preferences?.theme ?? 'light'
      },
      privacy: {
        profileVisibility: updatedUser?.preferences?.profileVisibility ?? 'public',
        showEmail: updatedUser?.preferences?.showEmail ?? false,
        showPhone: updatedUser?.preferences?.showPhone ?? false
      },
      verification: updatedUser?.verification || {
        email: false,
        phone: false,
        business: false
      }
    }

    return NextResponse.json({
      message: 'Settings updated successfully',
      settings: updatedSettings
    }, { status: 200 })

  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
