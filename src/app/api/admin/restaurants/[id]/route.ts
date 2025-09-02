import { NextRequest, NextResponse } from 'next/server'

// Mock data for restaurants - replace with actual database
const restaurants = [
  {
    _id: '1',
    name: '6 Ballygunge Place',
    description: 'Historic restaurant serving traditional Bengali cuisine',
    cuisine: 'Bengali',
    priceRange: '₹₹₹',
    rating: 4.5,
    address: '6 Ballygunge Place, Kolkata',
    phone: '+91-33-2464-0650',
    website: 'https://6ballygungeplace.com',
    openingHours: { open: '12:00 PM', close: '10:00 PM', days: 'All days' },
    features: ['AC', 'Parking', 'WiFi', 'Live Music'],
    images: ['/images/restaurants/6ballygunge.jpg'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// GET /api/admin/restaurants/[id] - Get specific restaurant
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const restaurant = restaurants.find(r => r._id === id)

    if (!restaurant) {
      return NextResponse.json(
        { success: false, message: 'Restaurant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      restaurant
    })
  } catch (error) {
    console.error('Error fetching restaurant:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch restaurant' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/restaurants/[id] - Update restaurant
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const restaurantIndex = restaurants.findIndex(r => r._id === id)

    if (restaurantIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Restaurant not found' },
        { status: 404 }
      )
    }

    const updatedRestaurant = {
      ...restaurants[restaurantIndex],
      ...body,
      updatedAt: new Date().toISOString()
    }

    restaurants[restaurantIndex] = updatedRestaurant

    return NextResponse.json({
      success: true,
      message: 'Restaurant updated successfully',
      restaurant: updatedRestaurant
    })
  } catch (error) {
    console.error('Error updating restaurant:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update restaurant' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/restaurants/[id] - Delete restaurant
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const restaurantIndex = restaurants.findIndex(r => r._id === id)

    if (restaurantIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Restaurant not found' },
        { status: 404 }
      )
    }

    const deletedRestaurant = restaurants.splice(restaurantIndex, 1)[0]

    return NextResponse.json({
      success: true,
      message: 'Restaurant deleted successfully',
      restaurant: deletedRestaurant
    })
  } catch (error) {
    console.error('Error deleting restaurant:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete restaurant' },
      { status: 500 }
    )
  }
}
