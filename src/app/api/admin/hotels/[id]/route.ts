import { NextRequest, NextResponse } from 'next/server'

// Mock data for hotels - replace with actual database
const hotels = [
  {
    _id: '1',
    name: 'The Astor',
    description: 'Luxury heritage hotel in the heart of Kolkata',
    category: 'Heritage',
    starRating: 5,
    address: '15 Shakespeare Sarani, Kolkata',
    phone: '+91-33-2229-0101',
    website: 'https://theastor.in',
    email: 'reservations@theastor.in',
    amenities: ['WiFi', 'Swimming Pool', 'Spa', 'Restaurant', 'Bar'],
    roomTypes: [
      { type: 'Deluxe Room', price: 15000, capacity: 2 },
      { type: 'Suite', price: 25000, capacity: 2 }
    ],
    checkInTime: '2:00 PM',
    checkOutTime: '12:00 PM',
    policies: ['No smoking', 'Pet friendly', 'Free cancellation 24hrs before'],
    images: ['/images/hotels/the-astor.jpg'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// GET /api/admin/hotels/[id] - Get single hotel
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const hotel = hotels.find(h => h._id === id)

    if (!hotel) {
      return NextResponse.json(
        { success: false, message: 'Hotel not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      hotel
    })
  } catch (error) {
    console.error('Error fetching hotel:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch hotel' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/hotels/[id] - Update hotel
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params
    const hotelIndex = hotels.findIndex(h => h._id === id)

    if (hotelIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Hotel not found' },
        { status: 404 }
      )
    }

    const updatedHotel = {
      ...hotels[hotelIndex],
      ...body,
      _id: id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    }

    hotels[hotelIndex] = updatedHotel

    return NextResponse.json({
      success: true,
      message: 'Hotel updated successfully',
      hotel: updatedHotel
    })
  } catch (error) {
    console.error('Error updating hotel:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update hotel' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/hotels/[id] - Delete hotel
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const hotelIndex = hotels.findIndex(h => h._id === id)

    if (hotelIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Hotel not found' },
        { status: 404 }
      )
    }

    const deletedHotel = hotels.splice(hotelIndex, 1)[0]

    return NextResponse.json({
      success: true,
      message: 'Hotel deleted successfully',
      hotel: deletedHotel
    })
  } catch (error) {
    console.error('Error deleting hotel:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete hotel' },
      { status: 500 }
    )
  }
}
