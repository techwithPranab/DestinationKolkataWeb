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

    // Get user's conversations with aggregation to include unread count and last message
    const conversations = await db.collection('conversations')
      .aggregate([
        {
          $match: {
            'participants.userId': userId
          }
        },
        {
          $lookup: {
            from: 'messages',
            localField: '_id',
            foreignField: 'conversationId',
            as: 'messages'
          }
        },
        {
          $addFields: {
            lastMessage: {
              $last: '$messages.content'
            },
            unreadCount: {
              $size: {
                $filter: {
                  input: '$messages',
                  as: 'msg',
                  cond: {
                    $and: [
                      { $ne: ['$$msg.sender.userId', userId] },
                      { $eq: ['$$msg.isRead', false] }
                    ]
                  }
                }
              }
            }
          }
        },
        {
          $sort: { updatedAt: -1 }
        }
      ])
      .toArray()

    return NextResponse.json({
      conversations: conversations
    })

  } catch (error) {
    console.error('Get conversations API error:', error)
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
    const { title, subject, category, priority, initialMessage } = body

    if (!title || !subject || !initialMessage) {
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
    
    // Create conversation
    const conversation = {
      title,
      subject,
      status: 'open' as const,
      priority: priority || 'medium',
      category: category || 'general',
      participants: [
        {
          userId: userId,
          name: userDoc.firstName ? `${userDoc.firstName} ${userDoc.lastName || ''}`.trim() : userDoc.name || 'Customer',
          role: 'customer'
        }
      ],
      createdAt: now,
      updatedAt: now
    }

    const conversationResult = await db.collection('conversations').insertOne(conversation)
    const conversationId = conversationResult.insertedId

    // Create initial message
    const initialMsg = {
      conversationId: conversationId,
      content: initialMessage,
      timestamp: now,
      sender: {
        userId: userId,
        name: conversation.participants[0].name,
        role: 'customer'
      },
      isRead: true // Customer's own message is considered read
    }

    await db.collection('messages').insertOne(initialMsg)

    return NextResponse.json({
      success: true,
      conversationId: conversationId,
      message: 'Conversation created successfully'
    })

  } catch (error) {
    console.error('Create conversation API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
