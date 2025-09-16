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

    const { db } = await connectToDatabase()
    const userId = ObjectId.createFromHexString(user.userId)
    const resolvedParams = await params
    const conversationId = ObjectId.createFromHexString(resolvedParams.id)

    // Verify user is participant in conversation
    const conversation = await db.collection('conversations').findOne({
      _id: conversationId,
      'participants.userId': userId
    })

    if (!conversation) {
      return NextResponse.json(
        { message: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Get messages for this conversation
    const messages = await db.collection('messages')
      .find({ conversationId: conversationId })
      .sort({ timestamp: 1 })
      .toArray()

    // Mark messages as read for current user
    await db.collection('messages').updateMany(
      {
        conversationId: conversationId,
        'sender.userId': { $ne: userId },
        isRead: false
      },
      {
        $set: { isRead: true }
      }
    )

    return NextResponse.json({
      conversation: conversation,
      messages: messages
    })

  } catch (error) {
    console.error('Get conversation messages API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
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

    const { db } = await connectToDatabase()
    const userId = ObjectId.createFromHexString(user.userId)
    const resolvedParams = await params
    const conversationId = ObjectId.createFromHexString(resolvedParams.id)

    // Verify user is participant in conversation
    const conversation = await db.collection('conversations').findOne({
      _id: conversationId,
      'participants.userId': userId
    })

    if (!conversation) {
      return NextResponse.json(
        { message: 'Conversation not found' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const { content } = body

    if (!content) {
      return NextResponse.json(
        { message: 'Message content is required' },
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

    // Create new message
    const newMessage = {
      conversationId: conversationId,
      content: content,
      timestamp: now,
      sender: {
        userId: userId,
        name: userDoc.firstName ? `${userDoc.firstName} ${userDoc.lastName || ''}`.trim() : userDoc.name || 'Customer',
        role: 'customer'
      },
      isRead: true // Customer's own message is considered read
    }

    await db.collection('messages').insertOne(newMessage)

    // Update conversation updatedAt
    await db.collection('conversations').updateOne(
      { _id: conversationId },
      { 
        $set: { 
          updatedAt: now,
          status: 'open' // Reopen if closed
        }
      }
    )

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully'
    })

  } catch (error) {
    console.error('Send message API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    const { db } = await connectToDatabase()
    const userId = ObjectId.createFromHexString(user.userId)
    const resolvedParams = await params
    const conversationId = ObjectId.createFromHexString(resolvedParams.id)

    // Verify user is participant in conversation
    const conversation = await db.collection('conversations').findOne({
      _id: conversationId,
      'participants.userId': userId
    })

    if (!conversation) {
      return NextResponse.json(
        { message: 'Conversation not found' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const { status } = body

    if (!['open', 'closed'].includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status' },
        { status: 400 }
      )
    }

    // Update conversation status
    await db.collection('conversations').updateOne(
      { _id: conversationId },
      { 
        $set: { 
          status: status,
          updatedAt: new Date()
        }
      }
    )

    return NextResponse.json({
      success: true,
      message: 'Conversation status updated successfully'
    })

  } catch (error) {
    console.error('Update conversation status API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
