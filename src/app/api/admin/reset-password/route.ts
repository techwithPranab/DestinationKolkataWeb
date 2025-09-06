import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User } from '@/models/index'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { message: 'Token and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    await connectDB()

    // Find admin/moderator user by reset token
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }, // Token not expired
      role: { $in: ['admin', 'moderator'] },
      status: 'active'
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update user password and clear reset token
    user.password = hashedPassword
    user.resetToken = undefined
    user.resetTokenExpiry = undefined
    await user.save()

    return NextResponse.json(
      { message: 'Admin password reset successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Admin reset password error:', error)
    return NextResponse.json(
      { message: 'Failed to reset admin password' },
      { status: 500 }
    )
  }
}
