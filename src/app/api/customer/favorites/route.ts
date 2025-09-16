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

    // Get user's favorites
    const favorites = await db.collection('users')
      .findOne({ _id: userId }, { projection: { wishlist: 1 } })

    return NextResponse.json({
      favorites: favorites?.wishlist || []
    })

  } catch (error) {
    console.error('Get favorites API error:', error)
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
    const { type, itemId, itemName, notes } = body

    if (!type || !itemId || !itemName) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if already favorited
    const existingFavorite = await db.collection('users').findOne({
      _id: userId,
      'wishlist.type': type,
      'wishlist.itemId': ObjectId.createFromHexString(itemId)
    })

    if (existingFavorite) {
      return NextResponse.json(
        { message: 'Already in favorites' },
        { status: 400 }
      )
    }

    // Add to favorites
    const favoriteItem = {
      type,
      itemId: ObjectId.createFromHexString(itemId),
      itemName,
      addedDate: new Date(),
      notes: notes || ''
    }

    await db.collection('users').updateOne(
      { _id: userId },
      { $push: { wishlist: favoriteItem } } as Partial<Document>
    )

    return NextResponse.json({
      success: true,
      message: 'Added to favorites'
    })

  } catch (error) {
    console.error('Add favorite API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
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

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const itemId = searchParams.get('itemId')

    if (!type || !itemId) {
      return NextResponse.json(
        { message: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Remove from favorites
    await db.collection('users').updateOne(
      { _id: userId },
      {
        $pull: {
          wishlist: {
            type,
            itemId: ObjectId.createFromHexString(itemId)
          }
        }
      } as Partial<Document>
    )

    return NextResponse.json({
      success: true,
      message: 'Removed from favorites'
    })

  } catch (error) {
    console.error('Remove favorite API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
