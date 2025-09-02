import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      businessName,
      businessType,
      city,
      termsAccepted
    } = body

    // Validation
    if (!firstName || !lastName || !email || !phone || !password || !city) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!termsAccepted) {
      return NextResponse.json(
        { message: 'Please accept the terms and conditions' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists with this email' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = {
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      businessName: businessName || null,
      businessType: businessType || null,
      city,
      role: 'customer',
      membershipType: 'free',
      status: 'active',
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('users').insertOne(user)

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: result.insertedId,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: result.insertedId,
        ...userWithoutPassword
      },
      token
    }, { status: 201 })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
