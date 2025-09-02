import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

async function getUserFromToken(req: NextRequest): Promise<{ userId: string; role: string; email: string }> {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    throw new Error('No token provided')
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string; role: string; email: string }
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    throw new Error('Invalid token')
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)
    
    if (user.role !== 'customer') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      )
    }

    const formData = await req.formData()
    
    // Extract form fields
    const restaurantData = {
      userId: ObjectId.createFromHexString(user.userId),
      type: 'restaurant',
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      pincode: formData.get('pincode') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      website: formData.get('website') as string,
      priceRange: formData.get('priceRange') as string,
      cuisineTypes: JSON.parse(formData.get('cuisineTypes') as string),
      amenities: JSON.parse(formData.get('amenities') as string),
      openingHours: JSON.parse(formData.get('openingHours') as string),
      specialFeatures: formData.get('specialFeatures') as string,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0
    }

    // Handle image files
    const images = formData.getAll('images') as File[]
    const imageData = images.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type
    }))

    const { db } = await connectToDatabase()

    // Create submission
    const submission = {
      ...restaurantData,
      title: restaurantData.name,
      images: imageData,
      submissionData: restaurantData
    }

    const result = await db.collection('submissions').insertOne(submission)

    return NextResponse.json({
      message: 'Restaurant submission created successfully',
      submissionId: result.insertedId
    }, { status: 201 })

  } catch (error) {
    console.error('Restaurant submission error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
