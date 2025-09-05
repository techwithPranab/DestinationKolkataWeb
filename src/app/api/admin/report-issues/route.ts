import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { ReportIssue } from '@/models'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')

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

    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    // Get total count
    const total = await ReportIssue.countDocuments(query)
    const totalPages = Math.ceil(total / limit)

    // Get reports with pagination
    const reports = await ReportIssue.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('investigatedBy', 'firstName lastName email')
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
    console.error('Error fetching report issues:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch report issues' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { id, status, priority, resolution, actionTaken, investigatedBy, incrementView } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Report ID is required' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}

    if (status) {
      updateData.status = status
      if (status !== 'new' && status !== 'investigating') {
        updateData.investigatedAt = new Date()
        updateData.investigatedBy = investigatedBy
      }
    }

    if (priority) {
      updateData.priority = priority
    }

    if (resolution !== undefined) {
      updateData.resolution = resolution
    }

    if (actionTaken !== undefined) {
      updateData.actionTaken = actionTaken
    }

    // Handle view tracking
    if (incrementView) {
      updateData.$inc = { viewCount: 1 }
      updateData.viewedAt = new Date()
      // Note: viewedBy would need to be passed from the frontend or obtained from session
    }

    updateData.updatedAt = new Date()

    const report = await ReportIssue.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('investigatedBy', 'firstName lastName email')

    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: report,
      message: 'Report updated successfully'
    })

  } catch (error) {
    console.error('Error updating report:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update report' },
      { status: 500 }
    )
  }
}
