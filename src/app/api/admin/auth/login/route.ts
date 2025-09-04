import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User } from '@/models'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Connect to database
    await connectDB()

    // Find user by email and role
    const user = await User.findOne({
      email: email.toLowerCase(),
      role: { $in: ['admin', 'moderator'] },
      status: 'active'
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials or insufficient permissions' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    // Create response user object (exclude password)
    const responseUser = {
      id: user._id.toString(),
      email: user.email,
      name: user.name || `${user.firstName} ${user.lastName}`.trim(),
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone,
      businessName: user.businessName,
      businessType: user.businessType,
      city: user.city,
      membershipType: user.membershipType,
      membershipExpiry: user.membershipExpiry
    }

    return NextResponse.json({
      success: true,
      token,
      user: responseUser,
      message: 'Login successful'
    })
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
