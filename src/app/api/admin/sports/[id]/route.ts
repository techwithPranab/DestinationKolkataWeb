import { NextRequest, NextResponse } from 'next/server'

// Mock data for sports facilities - replace with actual database
const sports = [
  {
    _id: '1',
    name: 'Salt Lake Stadium',
    description: 'Multi-purpose stadium hosting various sporting events',
    category: 'Stadium',
    facilities: ['Football Field', 'Athletics Track', 'Swimming Pool', 'Gym'],
    activities: ['Football', 'Cricket', 'Athletics', 'Swimming'],
    capacity: 120000,
    address: 'Salt Lake City, Kolkata',
    phone: '+91-33-2335-1234',
    website: 'https://saltlakestadium.com',
    operatingHours: { open: '6:00 AM', close: '10:00 PM', days: 'All days' },
    bookingRequired: true,
    bookingFee: { individual: 100, group: 500 },
    amenities: ['Changing Rooms', 'Parking', 'Cafeteria', 'Medical Facility'],
    images: ['/images/sports/salt-lake-stadium.jpg'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// GET /api/admin/sports/[id] - Get specific sports facility
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sport = sports.find(s => s._id === id)

    if (!sport) {
      return NextResponse.json(
        { success: false, message: 'Sports facility not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      sport
    })
  } catch (error) {
    console.error('Error fetching sports facility:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch sports facility' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/sports/[id] - Update sports facility
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params
    const sportIndex = sports.findIndex(s => s._id === id)

    if (sportIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Sports facility not found' },
        { status: 404 }
      )
    }

    const updatedSport = {
      ...sports[sportIndex],
      ...body,
      updatedAt: new Date().toISOString()
    }

    sports[sportIndex] = updatedSport

    return NextResponse.json({
      success: true,
      message: 'Sports facility updated successfully',
      sport: updatedSport
    })
  } catch (error) {
    console.error('Error updating sports facility:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update sports facility' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/sports/[id] - Delete sports facility
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sportIndex = sports.findIndex(s => s._id === id)

    if (sportIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Sports facility not found' },
        { status: 404 }
      )
    }

    const deletedSport = sports.splice(sportIndex, 1)[0]

    return NextResponse.json({
      success: true,
      message: 'Sports facility deleted successfully',
      sport: deletedSport
    })
  } catch (error) {
    console.error('Error deleting sports facility:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete sports facility' },
      { status: 500 }
    )
  }
}
