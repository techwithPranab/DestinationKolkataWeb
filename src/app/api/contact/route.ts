import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Contact } from '@/models'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const category = searchParams.get('category')

    // Build query
    const query: Record<string, unknown> = {}

    if (status) {
      query.status = status
    }

    if (priority) {
      query.priority = priority
    }

    if (category) {
      query.category = category
    }

    // Get total count
    const total = await Contact.countDocuments(query)
    const totalPages = Math.ceil(total / limit)

    // Get contacts with pagination
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    return NextResponse.json({
      success: true,
      data: contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contacts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'subject', 'message']
    const missingFields = requiredFields.filter(field => !body[field])

    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Create new contact
    const contact = new Contact({
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      email: body.email.toLowerCase().trim(),
      subject: body.subject.trim(),
      message: body.message.trim(),
      category: body.category || 'general',
      priority: body.priority || 'medium'
    })

    await contact.save()

    return NextResponse.json({
      success: true,
      data: contact,
      message: 'Contact form submitted successfully. We will get back to you soon.'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating contact:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit contact form' },
      { status: 500 }
    )
  }
}
