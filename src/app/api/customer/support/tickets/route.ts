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

    // Get user's support tickets
    const tickets = await db.collection('supportTickets')
      .find({ 'customer.userId': userId })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({
      tickets: tickets
    })

  } catch (error) {
    console.error('Get support tickets API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json()
    const { subject, description, category, priority } = body

    if (!subject || !description || !category) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user details
    const userDoc = await db.collection('users').findOne({ _id: userId })
    if (!userDoc) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    const now = new Date()
    
    // Create support ticket
    const ticket = {
      subject,
      description,
      category,
      priority: priority || 'medium',
      status: 'open',
      customer: {
        userId: userId,
        name: userDoc.firstName ? `${userDoc.firstName} ${userDoc.lastName || ''}`.trim() : userDoc.name || 'Customer',
        email: userDoc.email
      },
      responses: [],
      createdAt: now,
      updatedAt: now
    }

    const result = await db.collection('supportTickets').insertOne(ticket)

    return NextResponse.json({
      success: true,
      ticketId: result.insertedId,
      message: 'Support ticket created successfully'
    })

  } catch (error) {
    console.error('Create support ticket API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
