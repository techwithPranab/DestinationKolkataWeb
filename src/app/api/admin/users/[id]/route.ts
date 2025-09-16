import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User } from '@/models'

// Define proper types for user data
interface UserProfile {
  avatar?: string
  phone?: string
  dateOfBirth?: Date
  gender?: string
  location?: {
    city?: string
    state?: string
    country?: string
  }
  interests?: string[]
  bio?: string
}

interface UserData {
  _id: string
  firstName?: string
  lastName?: string
  name?: string
  email: string
  phone?: string
  role: string
  status?: string
  profile?: UserProfile
  lastLogin?: Date
  createdAt?: Date
  updatedAt?: Date
  bookingHistory?: Array<{
    type: string
    itemId: string
    itemName: string
    bookingDate: Date
    visitDate?: Date
    status: string
    amount?: number
    currency?: string
    notes?: string
  }>
}

// GET /api/admin/users/[id] - Get specific user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params

    const user = await User.findById(id).lean() as UserData | null

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Transform user data to match frontend interface
    const transformedUser = {
      _id: user._id,
      name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unnamed User',
      email: user.email,
      phone: user.phone || '',
      role: user.role || 'customer',
      status: user.status || 'active',
      profile: {
        avatar: user.profile?.avatar || '/images/users/default.jpg',
        bio: user.profile?.bio || '',
        preferences: user.profile?.interests || []
      },
      bookingHistory: user.bookingHistory || [],
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }

    return NextResponse.json({
      success: true,
      user: transformedUser
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const body = await request.json()
    const { id } = await params

    // Transform frontend data to database format
    const roleValue = body.role?.toLowerCase()
    let dbRole: string
    switch (roleValue) {
      case 'admin':
        dbRole = 'admin'
        break
      case 'moderator':
        dbRole = 'moderator'
        break
      default:
        dbRole = 'customer'
    }

    const updateData = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      role: dbRole,
      status: body.status?.toLowerCase() || 'active',
      firstName: body.name?.split(' ')[0] || '',
      lastName: body.name?.split(' ').slice(1).join(' ') || '',
      profile: {
        avatar: body.profile?.avatar || '/images/users/default.jpg',
        bio: body.profile?.bio || '',
        interests: body.profile?.preferences || []
      },
      updatedAt: new Date()
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).lean() as UserData | null

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Transform response to match frontend format
    const transformedUser = {
      _id: updatedUser._id,
      name: updatedUser.name || `${updatedUser.firstName || ''} ${updatedUser.lastName || ''}`.trim() || 'Unnamed User',
      email: updatedUser.email,
      phone: updatedUser.phone || '',
      role: updatedUser.role || 'customer',
      status: updatedUser.status || 'active',
      profile: {
        avatar: updatedUser.profile?.avatar || '/images/users/default.jpg',
        bio: updatedUser.profile?.bio || '',
        preferences: updatedUser.profile?.interests || []
      },
      bookingHistory: updatedUser.bookingHistory || [],
      lastLogin: updatedUser.lastLogin,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: transformedUser
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params

    const deletedUser = await User.findByIdAndDelete(id).lean() as UserData | null

    if (!deletedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
