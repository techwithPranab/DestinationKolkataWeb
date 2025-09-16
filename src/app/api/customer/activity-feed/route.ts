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

    // Get user's activity feed from multiple collections
    const activities: Array<{
      id: string
      type: string
      action: string
      title: string
      description: string
      timestamp: Date
      metadata?: Record<string, unknown>
    }> = []    // Get reviews
    const reviews = await db.collection('reviews')
      .find({ 'customer.userId': userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray()

    reviews.forEach(review => {
      activities.push({
        id: review._id.toString(),
        type: 'review',
        action: 'created',
        title: `Reviewed ${review.itemTitle}`,
        description: `You left a ${review.rating}-star review for ${review.itemTitle}`,
        timestamp: review.createdAt,
        metadata: {
          itemId: review.itemId,
          itemType: review.itemType,
          rating: review.rating,
          location: review.location,
          category: review.itemType
        }
      })
    })

    // Get favorites
    const favorites = await db.collection('favorites')
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray()

    favorites.forEach(favorite => {
      activities.push({
        id: favorite._id.toString(),
        type: 'favorite',
        action: 'added',
        title: 'Added to Favorites',
        description: `You added ${favorite.itemTitle} to your favorites`,
        timestamp: favorite.createdAt,
        metadata: {
          itemId: favorite.itemId,
          itemType: favorite.itemType,
          location: favorite.location,
          category: favorite.itemType
        }
      })
    })

    // Get support tickets
    const tickets = await db.collection('supportTickets')
      .find({ 'customer.userId': userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray()

    tickets.forEach(ticket => {
      activities.push({
        id: ticket._id.toString(),
        type: 'message',
        action: 'created',
        title: 'Support Ticket Created',
        description: `You created a support ticket: ${ticket.subject}`,
        timestamp: ticket.createdAt,
        metadata: {
          priority: ticket.priority,
          status: ticket.status,
          category: ticket.category
        }
      })
    })

    // Get conversations
    const conversations = await db.collection('conversations')
      .find({ 'participants.userId': userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray()

    conversations.forEach(conversation => {
      activities.push({
        id: conversation._id.toString(),
        type: 'message',
        action: 'created',
        title: 'Started Conversation',
        description: `You started a conversation: ${conversation.title}`,
        timestamp: conversation.createdAt,
        metadata: {
          priority: conversation.priority,
          status: conversation.status,
          category: conversation.category
        }
      })
    })

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({
      activities: activities.slice(0, 50) // Limit to 50 most recent activities
    })

  } catch (error) {
    console.error('Get activity feed API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
