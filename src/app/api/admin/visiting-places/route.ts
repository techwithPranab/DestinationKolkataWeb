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

// GET /api/admin/visiting-places - Get all visiting places
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const status = searchParams.get('status')

    let filteredPlaces = [...visitingPlaces]

    // Apply filters
    if (search) {
      filteredPlaces = filteredPlaces.filter(place =>
        place.name.toLowerCase().includes(search.toLowerCase()) ||
        place.category.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (category) {
      filteredPlaces = filteredPlaces.filter(place =>
        place.category === category
      )
    }

    if (status) {
      filteredPlaces = filteredPlaces.filter(place =>
        status === 'active' ? place.isActive : !place.isActive
      )
    }

    return NextResponse.json({
      success: true,
      visitingPlaces: filteredPlaces,
      total: filteredPlaces.length
    })
  } catch (error) {
    console.error('Error fetching visiting places:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch visiting places' },
      { status: 500 }
    )
  }
}

// POST /api/admin/visiting-places - Create new visiting place
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const newPlace = {
      _id: Date.now().toString(),
      ...body,
      isActive: body.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    visitingPlaces.push(newPlace)

    return NextResponse.json({
      success: true,
      message: 'Visiting place created successfully',
      visitingPlace: newPlace
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating visiting place:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create visiting place' },
      { status: 500 }
    )
  }
}
