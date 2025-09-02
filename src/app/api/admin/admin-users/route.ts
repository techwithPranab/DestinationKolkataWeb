import { NextRequest, NextResponse } from 'next/server'
import { adminUserSeeds, AdminUser } from '@/lib/seeds/admin-users'

// Mock admin user database - replace with actual database
const adminUsers: AdminUser[] = [...adminUserSeeds]

// GET /api/admin/admin-users - Get all admin users
export async function GET(request: NextRequest) {
  try {
    // In production, add authentication and authorization checks here
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const status = searchParams.get('status')

    let filteredUsers = [...adminUsers]

    // Apply filters
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role)
    }

    if (status) {
      const isActive = status === 'active'
      filteredUsers = filteredUsers.filter(user => user.isActive === isActive)
    }

    // Return users without passwords
    const safeUsers = filteredUsers.map(user => ({
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
      users: safeUsers,
      total: safeUsers.length
    })
  } catch (error) {
    console.error('Error fetching admin users:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch admin users' },
      { status: 500 }
    )
  }
}

// POST /api/admin/admin-users - Create new admin user
export async function POST(request: NextRequest) {
  try {
    // In production, add authentication and authorization checks here
    const body = await request.json()

    const newUser: AdminUser = {
      id: Date.now().toString(),
      email: body.email,
      password: body.password, // In production, hash this password
      name: body.name,
      role: body.role || 'viewer',
      permissions: body.permissions || ['read'],
      isActive: body.isActive ?? true,
      createdAt: new Date().toISOString(),
      lastLogin: null
    }

    // Check if email already exists
    const existingUser = adminUsers.find(user => user.email === newUser.email)
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Admin user with this email already exists' },
        { status: 400 }
      )
    }

    adminUsers.push(newUser)

    // Return user without password
    const { password, ...safeUser } = newUser

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user: safeUser
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating admin user:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create admin user' },
      { status: 500 }
    )
  }
}
