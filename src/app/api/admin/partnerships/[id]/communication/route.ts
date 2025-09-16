import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Partnership } from '@/models/Partnership'
import { getAuthenticatedUser } from '@/lib/auth-helper'
import mongoose from 'mongoose'

// POST /api/admin/partnerships/[id]/communication - Add communication log
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const user = await getAuthenticatedUser(request)
    
    // Check admin permissions
    if (!['admin', 'moderator'].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access' },
        { status: 403 }
      )
    }

    const { type, summary, nextAction, nextActionDate } = await request.json()

    if (!type || !summary) {
      return NextResponse.json(
        { success: false, message: 'Communication type and summary are required' },
        { status: 400 }
      )
    }

    const partnership = await Partnership.findById(id)
    if (!partnership) {
      return NextResponse.json(
        { success: false, message: 'Partnership not found' },
        { status: 404 }
      )
    }

    // Add communication log entry
    const communicationEntry = {
      date: new Date(),
      type,
      summary,
      nextAction,
      nextActionDate: nextActionDate ? new Date(nextActionDate) : undefined,
      createdBy: new mongoose.Types.ObjectId(user.userId)
    }

    if (!partnership.communicationLog) {
      partnership.communicationLog = []
    }
    partnership.communicationLog.push(communicationEntry)

    await partnership.save()

    return NextResponse.json({
      success: true,
      message: 'Communication log added successfully',
      communicationEntry
    })
  } catch (error) {
    console.error('Error adding communication log:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to add communication log' },
      { status: 500 }
    )
  }
}

// GET /api/admin/partnerships/[id]/communication - Get communication history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const user = await getAuthenticatedUser(request)
    
    // Check admin permissions
    if (!['admin', 'moderator'].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access' },
        { status: 403 }
      )
    }

    const partnership = await Partnership.findById(id)
      .populate('communicationLog.createdBy', 'firstName lastName name email')
      .select('communicationLog partnerName')

    if (!partnership) {
      return NextResponse.json(
        { success: false, message: 'Partnership not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      communicationLog: partnership.communicationLog || [],
      partnerName: partnership.partnerName
    })
  } catch (error) {
    console.error('Error fetching communication log:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch communication log' },
      { status: 500 }
    )
  }
}
