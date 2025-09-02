import { NextRequest, NextResponse } from 'next/server'

// Mock data for users - replace with actual database
const users = [
  {
    _id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91-98765-43210',
    role: 'User',
    status: 'Active',
    profile: {
      avatar: '/images/users/john-doe.jpg',
      bio: 'Travel enthusiast exploring Kolkata',
      preferences: ['Heritage', 'Food', 'Culture']
    },
    bookingHistory: [
      { id: 'B001', type: 'Hotel', date: '2024-01-15', amount: 2500 },
      { id: 'B002', type: 'Restaurant', date: '2024-01-20', amount: 800 }
    ],
    lastLogin: '2024-01-20T10:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString()
  }
]

// GET /api/admin/users/[id] - Get specific user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = users.find(u => u._id === id)

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user
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
    const body = await request.json()
    const { id } = await params
    const userIndex = users.findIndex(u => u._id === id)

    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    const updatedUser = {
      ...users[userIndex],
      ...body,
      updatedAt: new Date().toISOString()
    }

    users[userIndex] = updatedUser

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
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
    const { id } = await params
    const userIndex = users.findIndex(u => u._id === id)

    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    const deletedUser = users.splice(userIndex, 1)[0]

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
      user: deletedUser
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
