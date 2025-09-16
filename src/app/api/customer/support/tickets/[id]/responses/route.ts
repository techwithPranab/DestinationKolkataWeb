import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { getAuthenticatedUser } from '@/lib/auth-helper'

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
    const ticketId = ObjectId.createFromHexString(resolvedParams.id)

    // Verify user owns the ticket
    const ticket = await db.collection('supportTickets').findOne({
      _id: ticketId,
      'customer.userId': userId
    })

    if (!ticket) {
      return NextResponse.json(
        { message: 'Ticket not found' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const { message } = body

    if (!message) {
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

    // Create response
    const response = {
      id: new ObjectId(),
      message: message,
      sender: userDoc.firstName ? `${userDoc.firstName} ${userDoc.lastName || ''}`.trim() : userDoc.name || 'Customer',
      timestamp: now,
      isStaff: false
    }

    // Add response to ticket and update status
    await db.collection('supportTickets').updateOne(
      { _id: ticketId },
      { 
        $push: { responses: response },
        $set: { 
          updatedAt: now,
          status: 'open' // Reopen ticket if it was closed
        }
      } as Partial<Document>
    )

    return NextResponse.json({
      success: true,
      message: 'Response added successfully'
    })

  } catch (error) {
    console.error('Add ticket response API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
