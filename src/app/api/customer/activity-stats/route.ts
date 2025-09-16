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

    // Get activity stats
    const [
      reviewsCount,
      favoritesCount,
      ticketsCount,
      conversationsCount
    ] = await Promise.all([
      db.collection('reviews').countDocuments({ 'customer.userId': userId }),
      db.collection('favorites').countDocuments({ userId: userId }),
      db.collection('supportTickets').countDocuments({ 'customer.userId': userId }),
      db.collection('conversations').countDocuments({ 'participants.userId': userId })
    ])

    const totalActivities = reviewsCount + favoritesCount + ticketsCount + conversationsCount

    const stats = {
      totalActivities,
      reviewsCount,
      favoritesCount,
      bookingsCount: 0, // Bookings feature to be implemented
      listingsCount: 0 // Listings feature to be implemented
    }

    return NextResponse.json({
      stats
    })

  } catch (error) {
    console.error('Get activity stats API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
