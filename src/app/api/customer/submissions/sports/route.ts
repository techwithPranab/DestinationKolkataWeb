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
    const sportsData = {
      userId: ObjectId.createFromHexString(user.userId),
      type: 'sports',
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      sportType: formData.get('sportType') as string,
      venue: formData.get('venue') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      startDate: formData.get('startDate') as string,
      startTime: formData.get('startTime') as string,
      endDate: formData.get('endDate') as string,
      endTime: formData.get('endTime') as string,
      capacity: formData.get('capacity') ? parseInt(formData.get('capacity') as string) : null,
      price: formData.get('price') ? parseFloat(formData.get('price') as string) : 0,
      organizer: formData.get('organizer') as string,
      contactEmail: formData.get('contactEmail') as string,
      contactPhone: formData.get('contactPhone') as string,
      skillLevel: formData.get('skillLevel') as string,
      equipment: formData.get('equipment') as string,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0
    }

    // Handle images from ImageUpload component (already uploaded to Cloudinary)
    let imageData: Record<string, unknown>[] = []
    try {
      const imagesJson = formData.get('images') as string
      if (imagesJson) {
        imageData = JSON.parse(imagesJson)
      }
    } catch (error) {
      console.error('Error parsing images:', error)
      imageData = []
    }

    const { db } = await connectToDatabase()

    // Create submission
    const submission = {
      ...sportsData,
      title: sportsData.title,
      images: imageData,
      submissionData: sportsData
    }

    const result = await db.collection('submissions').insertOne(submission)

    return NextResponse.json({
      message: 'Sports submission created successfully',
      submissionId: result.insertedId
    }, { status: 201 })

  } catch (error) {
    console.error('Sports submission error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
