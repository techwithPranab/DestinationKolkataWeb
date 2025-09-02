import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { ReportIssue } from '@/models'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const priority = searchParams.get('priority')

    // Build query
    const query: Record<string, unknown> = {}

    if (status) {
      query.status = status
    }

    if (type) {
      query.type = type
    }

    if (priority) {
      query.priority = priority
    }

    // Get total count
    const total = await ReportIssue.countDocuments(query)
    const totalPages = Math.ceil(total / limit)

    // Get reports with pagination
    const reports = await ReportIssue.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    return NextResponse.json({
      success: true,
      data: reports,
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
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()

    // Validate required fields
    const requiredFields = ['type', 'businessName', 'description']
    const missingFields = requiredFields.filter(field => !body[field])

    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate report type
    const validTypes = ['inaccurate', 'outdated', 'closed', 'inappropriate', 'spam', 'other']
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid report type' },
        { status: 400 }
      )
    }

    // Validate email if provided
    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { success: false, error: 'Invalid email format' },
          { status: 400 }
        )
      }
    }

    // Create new report
    const report = new ReportIssue({
      type: body.type,
      businessName: body.businessName.trim(),
      location: body.location ? body.location.trim() : undefined,
      description: body.description.trim(),
      evidence: body.evidence ? body.evidence.trim() : undefined,
      email: body.email ? body.email.toLowerCase().trim() : undefined,
      category: body.category || 'other',
      priority: body.priority || 'medium'
    })

    await report.save()

    return NextResponse.json({
      success: true,
      data: report,
      message: 'Report submitted successfully. We will investigate and take appropriate action.'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit report' },
      { status: 500 }
    )
  }
}
