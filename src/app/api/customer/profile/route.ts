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
          firstName: 1,
          lastName: 1,
          name: 1,
          email: 1,
          phone: 1,
          businessName: 1,
          businessType: 1,
          city: 1,
          profile: 1,
          preferences: 1,
          membershipType: 1,
          status: 1,
          emailVerified: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    )

    if (!userDoc) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Profile retrieved successfully',
      profile: userDoc
    }, { status: 200 })

  } catch (error) {
    console.error('Profile retrieval error:', error)
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
    const {
      firstName,
      lastName,
      phone,
      businessName,
      businessType,
      city,
      profile
    } = body

    const { db } = await connectToDatabase()

    // Prepare update object
    const updateData: Record<string, unknown> = {
      updatedAt: new Date()
    }

    // Update basic fields
    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    if (phone !== undefined) updateData.phone = phone
    if (businessName !== undefined) updateData.businessName = businessName
    if (businessType !== undefined) updateData.businessType = businessType
    if (city !== undefined) updateData.city = city

    // Update profile object if provided
    if (profile) {
      updateData.profile = {
        ...profile,
        updatedAt: new Date()
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

    // Fetch updated profile
    const updatedUser = await db.collection('users').findOne(
      { _id: new ObjectId(user.userId) },
      {
        projection: {
          firstName: 1,
          lastName: 1,
          name: 1,
          email: 1,
          phone: 1,
          businessName: 1,
          businessType: 1,
          city: 1,
          profile: 1,
          preferences: 1,
          membershipType: 1,
          status: 1,
          emailVerified: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    )

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: updatedUser
    }, { status: 200 })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
