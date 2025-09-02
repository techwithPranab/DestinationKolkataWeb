import { NextRequest, NextResponse } from 'next/server'
import { adminUserSeeds, AdminUser } from '@/lib/seeds/admin-users'

// Mock user database - replace with actual database
const users: AdminUser[] = [...adminUserSeeds]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Find user by email
    const user = users.find(u => u.email === email && u.isActive)

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 401 }
      )
    }

    // Check password (in production, use proper password hashing)
    if (user.password !== password) {
      return NextResponse.json(
        { success: false, message: 'Invalid password' },
        { status: 401 }
      )
    }

    // Update last login
    const userIndex = users.findIndex(u => u.id === user.id)
    const updatedUser = {
      ...user,
      lastLogin: new Date().toISOString()
    }
    users[userIndex] = updatedUser

    // Create response user object (exclude password)
    const responseUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      lastLogin: user.lastLogin
    }

    // Generate token (in production, use proper JWT)
    const token = `admin-token-${user.id}-${Date.now()}`

    return NextResponse.json({
      success: true,
      token,
      user: responseUser,
      message: 'Login successful'
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve all users (for admin management)
export async function GET(request: NextRequest) {
  try {
    // In production, add authentication check here
    const userList = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }))

    return NextResponse.json({
      success: true,
      users: userList,
      total: userList.length
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
