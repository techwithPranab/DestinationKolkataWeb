import { NextRequest, NextResponse } from 'next/server'

// Mock data for visiting places - replace with actual database
const visitingPlaces = [
  {
    _id: '1',
    name: 'Victoria Memorial',
    description: 'Magnificent marble building and museum dedicated to Queen Victoria',
    category: 'Historical',
    entryFee: { adult: 30, child: 10, foreignAdult: 200, foreignChild: 100 },
    operatingHours: { open: '10:00 AM', close: '5:00 PM', days: 'All days' },
    address: '1 Victoria Memorial Hall, Kolkata',
    phone: '+91-33-2223-1894',
    website: 'https://victoriamemorial-cal.org',
    features: ['Museum', 'Gardens', 'Photography', 'Guided Tours'],
    accessibility: ['Wheelchair Accessible', 'Parking Available'],
    bestTimeToVisit: 'October to March',
    images: ['/images/places/victoria-memorial.jpg'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// GET /api/admin/visiting-places/[id] - Get single visiting place
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const place = visitingPlaces.find(p => p._id === id)

    if (!place) {
      return NextResponse.json(
        { success: false, message: 'Visiting place not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      visitingPlace: place
    })
  } catch (error) {
    console.error('Error fetching visiting place:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch visiting place' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/visiting-places/[id] - Update visiting place
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params
    const placeIndex = visitingPlaces.findIndex(p => p._id === id)

    if (placeIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Visiting place not found' },
        { status: 404 }
      )
    }

    const updatedPlace = {
      ...visitingPlaces[placeIndex],
      ...body,
      _id: id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    }

    visitingPlaces[placeIndex] = updatedPlace

    return NextResponse.json({
      success: true,
      message: 'Visiting place updated successfully',
      visitingPlace: updatedPlace
    })
  } catch (error) {
    console.error('Error updating visiting place:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update visiting place' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/visiting-places/[id] - Delete visiting place
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const placeIndex = visitingPlaces.findIndex(p => p._id === id)

    if (placeIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Visiting place not found' },
        { status: 404 }
      )
    }

    const deletedPlace = visitingPlaces.splice(placeIndex, 1)[0]

    return NextResponse.json({
      success: true,
      message: 'Visiting place deleted successfully',
      visitingPlace: deletedPlace
    })
  } catch (error) {
    console.error('Error deleting visiting place:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete visiting place' },
      { status: 500 }
    )
  }
}
