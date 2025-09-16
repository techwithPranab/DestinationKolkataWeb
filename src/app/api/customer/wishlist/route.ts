import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User } from '@/models'
import { getAuthenticatedUser } from '@/lib/auth-helper'
import mongoose from 'mongoose'

// GET /api/customer/wishlist - Get user's wishlist
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

    const userDoc = await User.findById(user.userId)
    if (!userDoc) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      wishlist: userDoc.wishlist || []
    })
  } catch (error) {
    console.error('Error fetching wishlist:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch wishlist' },
      { status: 500 }
    )
  }
}

// POST /api/customer/wishlist - Add item to wishlist
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

    const { type, itemId, itemName, notes } = await request.json()

    if (!type || !itemId || !itemName) {
      return NextResponse.json(
        { success: false, message: 'Type, itemId, and itemName are required' },
        { status: 400 }
      )
    }

    const userDoc = await User.findById(user.userId)
    if (!userDoc) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Check if item already exists in wishlist
    const existingItem = userDoc.wishlist?.find(
      (item: { type: string; itemId: mongoose.Types.ObjectId }) => 
        item.itemId.toString() === itemId && item.type === type
    )

    if (existingItem) {
      return NextResponse.json(
        { success: false, message: 'Item already in wishlist' },
        { status: 400 }
      )
    }

    // Add to wishlist
    const wishlistItem = {
      type,
      itemId,
      itemName,
      addedDate: new Date(),
      notes: notes || ''
    }

    if (!userDoc.wishlist) {
      userDoc.wishlist = []
    }
    userDoc.wishlist.push(wishlistItem)
    await userDoc.save()

    return NextResponse.json({
      success: true,
      message: 'Item added to wishlist',
      wishlist: userDoc.wishlist
    })
  } catch (error) {
    console.error('Error adding to wishlist:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to add item to wishlist' },
      { status: 500 }
    )
  }
}

// DELETE /api/customer/wishlist - Remove item from wishlist
export async function DELETE(request: NextRequest) {
  try {
    await connectDB()

    const user = await getAuthenticatedUser(request)
    if (user.role !== 'customer') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const itemId = searchParams.get('itemId')

    if (!type || !itemId) {
      return NextResponse.json(
        { success: false, message: 'Type and itemId are required' },
        { status: 400 }
      )
    }

    const userDoc = await User.findById(user.userId)
    if (!userDoc) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Remove from wishlist
    userDoc.wishlist = userDoc.wishlist?.filter(
      (item: { type: string; itemId: mongoose.Types.ObjectId }) => 
        !(item.itemId.toString() === itemId && item.type === type)
    ) || []

    await userDoc.save()

    return NextResponse.json({
      success: true,
      message: 'Item removed from wishlist',
      wishlist: userDoc.wishlist
    })
  } catch (error) {
    console.error('Error removing from wishlist:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to remove item from wishlist' },
      { status: 500 }
    )
  }
}
