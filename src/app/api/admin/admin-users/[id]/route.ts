import { NextRequest, NextResponse } from 'next/server'
import { adminUserSeeds, AdminUser } from '@/lib/seeds/admin-users'

// Mock admin user database - replace with actual database
const adminUsers: AdminUser[] = [...adminUserSeeds]

// GET /api/admin/admin-users/[id] - Get specific admin user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = adminUsers.find(u => u.id === id)

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Admin user not found' },
        { status: 404 }
      )
    }

    // Return user without password
    const { password, ...safeUser } = user

    return NextResponse.json({
      success: true,
      user: safeUser
    })
  } catch (error) {
    console.error('Error fetching admin user:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch admin user' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/admin-users/[id] - Update admin user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const userIndex = adminUsers.findIndex(u => u.id === id)

    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Admin user not found' },
        { status: 404 }
      )
    }

    const updatedUser = {
      ...adminUsers[userIndex],
      ...body,
      updatedAt: new Date().toISOString()
    }

    adminUsers[userIndex] = updatedUser

    // Return user without password
    const { password, ...safeUser } = updatedUser

    return NextResponse.json({
      success: true,
      message: 'Admin user updated successfully',
      user: safeUser
    })
  } catch (error) {
    console.error('Error updating admin user:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update admin user' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/admin-users/[id] - Delete admin user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userIndex = adminUsers.findIndex(u => u.id === id)

    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Admin user not found' },
        { status: 404 }
      )
    }

    const deletedUser = adminUsers.splice(userIndex, 1)[0]

    // Return user without password
    const { password, ...safeUser } = deletedUser

    return NextResponse.json({
      success: true,
      message: 'Admin user deleted successfully',
      user: safeUser
    })
  } catch (error) {
    console.error('Error deleting admin user:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete admin user' },
      { status: 500 }
    )
  }
}
