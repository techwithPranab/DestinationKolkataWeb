import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { EmergencyContact } from '@/models'

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const query: { isActive: boolean; category?: string } = { isActive: true }

    if (category) {
      query.category = category
    }

    const emergencyContacts = await EmergencyContact.find(query)
      .sort({ category: 1, service: 1 })
      .lean()

    return NextResponse.json({
      success: true,
      data: emergencyContacts,
      count: emergencyContacts.length
    })

  } catch (error) {
    console.error('Error fetching emergency contacts:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch emergency contacts'
      },
      { status: 500 }
    )
  }
}
