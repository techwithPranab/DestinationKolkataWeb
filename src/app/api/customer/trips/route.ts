import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Trip } from '@/models'
import { getAuthenticatedUser } from '@/lib/auth-helper'

// GET /api/customer/trips - Get user's trips
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const user = await getAuthenticatedUser(request)
    if (user.role !== 'customer') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      )
    }

    const trips = await Trip.find({ userId: user.userId }).sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      trips
    })
  } catch (error) {
    console.error('Error fetching trips:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch trips' },
      { status: 500 }
    )
  }
}

// POST /api/customer/trips - Create new trip
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const user = await getAuthenticatedUser(request)
    if (user.role !== 'customer') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { title, description, startDate, endDate, destinations, totalBudget, currency, tags } = await request.json()

    if (!title || !startDate || !endDate || !destinations || destinations.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Title, dates, and destinations are required' },
        { status: 400 }
      )
    }

    const newTrip = new Trip({
      userId: user.userId,
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      destinations,
      totalBudget,
      currency: currency || 'INR',
      tags: tags || []
    })

    const savedTrip = await newTrip.save()

    return NextResponse.json({
      success: true,
      message: 'Trip created successfully',
      trip: savedTrip
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating trip:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create trip' },
      { status: 500 }
    )
  }
}
