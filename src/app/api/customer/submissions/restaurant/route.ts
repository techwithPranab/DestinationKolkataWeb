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

export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)
    
    if (user.role !== 'customer') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Extract submission ID from URL or body
    const url = new URL(req.url)
    const submissionId = url.pathname.split('/').pop()
    
    if (!submissionId) {
      return NextResponse.json(
        { message: 'Submission ID is required' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const objectId = new ObjectId(submissionId)

    // Get current submission
    const currentSubmission = await db.collection('submissions').findOne({
      _id: objectId,
      userId: new ObjectId(user.userId)
    })

    if (!currentSubmission) {
      return NextResponse.json(
        { message: 'Submission not found' },
        { status: 404 }
      )
    }

    // Allow editing pending and approved submissions
    // Rejected submissions cannot be edited (must be resubmitted as new)
    if (currentSubmission.status === 'rejected') {
      return NextResponse.json(
        { message: 'Rejected submissions cannot be edited. Please create a new submission.' },
        { status: 400 }
      )
    }

    const formData = await req.formData()
    
    // Extract form fields and update submission data
    const submissionData = { ...currentSubmission.submissionData }

    for (const [key, value] of formData.entries()) {
      if (key === 'images') {
        // Handle images as JSON
        submissionData[key] = JSON.parse(value as string)
      } else if (['amenities', 'cuisineTypes', 'openingHours'].includes(key)) {
        // Handle arrays/objects
        submissionData[key] = JSON.parse(value as string)
      } else {
        submissionData[key] = value
      }
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
      submissionData,
      title: submissionData.name || submissionData.title || 'Untitled'
    }

    // If updating an approved submission, mark it as pending for re-review
    if (currentSubmission.status === 'approved') {
      updateData.status = 'pending'
      updateData.adminNotes = 'Updated by customer - pending re-review'
      updateData.previousStatus = 'approved'
      updateData.lastApprovedAt = currentSubmission.approvedAt
    }

    // Update the submission
    await db.collection('submissions').updateOne(
      { _id: objectId },
      { $set: updateData }
    )

    return NextResponse.json({
      message: 'Restaurant updated successfully'
    })

  } catch (error) {
    console.error('Restaurant update error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
