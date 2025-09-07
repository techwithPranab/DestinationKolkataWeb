import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User } from '@/models'

// GET /api/admin/users - Get all users
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build query
    const query: Record<string, unknown> = {}

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ]
    }

    if (role && role !== 'all') {
      // Map frontend role values to database values
      const roleMapping: Record<string, string> = {
        'Admin': 'admin',
        'Customer': 'customer',
        'Moderator': 'moderator'
      }
      query.role = roleMapping[role] || role.toLowerCase()
    }

    if (status && status !== 'all') {
      // Map frontend status values to database values
      const statusMapping: Record<string, string> = {
        'Active': 'active',
        'Inactive': 'inactive',
        'Suspended': 'suspended'
      }
      query.status = statusMapping[status] || status.toLowerCase()
    }

    // Get total count for pagination
    const total = await User.countDocuments(query)

    // Get users with pagination
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // Transform users to match frontend interface
    const transformedUsers = users.map(user => ({
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
      bookingHistory: [], // Not implemented yet
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }))

    return NextResponse.json({
      success: true,
      users: transformedUsers,
      total,
      page,
      pages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST /api/admin/users - Create new user
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()

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

    const userData = {
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
      preferences: {
        emailNotifications: true,
        smsNotifications: false,
        language: 'en',
        currency: 'INR'
      },
      bookingHistory: [],
      lastLogin: null
    }

    const newUser = new User(userData)
    const savedUser = await newUser.save()

    // Transform response to match frontend format
    const transformedUser = {
      _id: savedUser._id,
      name: savedUser.name || `${savedUser.firstName || ''} ${savedUser.lastName || ''}`.trim() || 'Unnamed User',
      email: savedUser.email,
      phone: savedUser.phone || '',
      role: savedUser.role || 'customer',
      status: savedUser.status || 'active',
      profile: {
        avatar: savedUser.profile?.avatar || '/images/users/default.jpg',
        bio: savedUser.profile?.bio || '',
        preferences: savedUser.profile?.interests || []
      },
      bookingHistory: [],
      lastLogin: savedUser.lastLogin,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt
    }

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: transformedUser
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create user' },
      { status: 500 }
    )
  }
}
