import { NextRequest, NextResponse } from 'next/server'

// Mock data for travel packages - replace with actual database
const travelPackages = [
  {
    _id: '1',
    title: 'Kolkata Heritage Tour',
    description: 'Explore the rich history and culture of Kolkata',
    category: 'Heritage',
    duration: '3 Days',
    price: { adult: 2500, child: 1500 },
    itinerary: [
      { day: 1, activities: ['Victoria Memorial', 'St. Paul\'s Cathedral'] },
      { day: 2, activities: ['Howrah Bridge', 'South City Mall'] },
      { day: 3, activities: ['Kumartuli', 'Princep Ghat'] }
    ],
    inclusions: ['Accommodation', 'Meals', 'Guide', 'Transportation'],
    exclusions: ['Personal Expenses', 'Tips'],
    transportation: ['Private Car', 'Local Transport'],
    guides: ['English', 'Hindi', 'Bengali'],
    maxGroupSize: 20,
    minGroupSize: 2,
    bookingDeadline: '24 hours before departure',
    cancellationPolicy: 'Free cancellation up to 48 hours',
    images: ['/images/travel/kolkata-heritage.jpg'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// GET /api/admin/travel/[id] - Get specific travel package
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const travelPackage = travelPackages.find(pkg => pkg._id === id)

    if (!travelPackage) {
      return NextResponse.json(
        { success: false, message: 'Travel package not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      package: travelPackage
    })
  } catch (error) {
    console.error('Error fetching travel package:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch travel package' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/travel/[id] - Update travel package
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params
    const packageIndex = travelPackages.findIndex(pkg => pkg._id === id)

    if (packageIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Travel package not found' },
        { status: 404 }
      )
    }

    const updatedPackage = {
      ...travelPackages[packageIndex],
      ...body,
      updatedAt: new Date().toISOString()
    }

    travelPackages[packageIndex] = updatedPackage

    return NextResponse.json({
      success: true,
      message: 'Travel package updated successfully',
      package: updatedPackage
    })
  } catch (error) {
    console.error('Error updating travel package:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update travel package' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/travel/[id] - Delete travel package
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const packageIndex = travelPackages.findIndex(pkg => pkg._id === id)

    if (packageIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Travel package not found' },
        { status: 404 }
      )
    }

    const deletedPackage = travelPackages.splice(packageIndex, 1)[0]

    return NextResponse.json({
      success: true,
      message: 'Travel package deleted successfully',
      package: deletedPackage
    })
  } catch (error) {
    console.error('Error deleting travel package:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete travel package' },
      { status: 500 }
    )
  }
}
