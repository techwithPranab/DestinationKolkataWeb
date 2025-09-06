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
    const promotionData = {
      userId: ObjectId.createFromHexString(user.userId),
      type: 'promotion',
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      discountType: formData.get('discountType') as string,
      discountValue: formData.get('discountValue') ? parseFloat(formData.get('discountValue') as string) : 0,
      originalPrice: formData.get('originalPrice') ? parseFloat(formData.get('originalPrice') as string) : null,
      discountedPrice: formData.get('discountedPrice') ? parseFloat(formData.get('discountedPrice') as string) : null,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      terms: formData.get('terms') as string,
      businessName: formData.get('businessName') as string,
      businessType: formData.get('businessType') as string,
      contactEmail: formData.get('contactEmail') as string,
      contactPhone: formData.get('contactPhone') as string,
      website: formData.get('website') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
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
      ...promotionData,
      title: promotionData.title,
      images: imageData,
      submissionData: promotionData
    }

    const result = await db.collection('submissions').insertOne(submission)

    return NextResponse.json({
      message: 'Promotion submission created successfully',
      submissionId: result.insertedId
    }, { status: 201 })

  } catch (error) {
    console.error('Promotion submission error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
