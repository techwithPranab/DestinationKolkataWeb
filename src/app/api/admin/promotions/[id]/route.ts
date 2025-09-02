import { NextRequest, NextResponse } from 'next/server'

// Mock data for promotions - replace with actual database
const promotions = [
  {
    _id: '1',
    title: 'Durga Puja Special Offer',
    description: 'Get 20% off on all hotel bookings during Durga Puja',
    type: 'Discount',
    discountType: 'Percentage',
    discountValue: 20,
    code: 'DURGA2024',
    validFrom: '2024-09-25',
    validUntil: '2024-10-10',
    applicableTo: ['Hotels', 'Restaurants'],
    minimumPurchase: 1000,
    maximumDiscount: 2000,
    usageLimit: 500,
    usedCount: 0,
    terms: 'Valid only during Durga Puja period. Cannot be combined with other offers.',
    images: ['/images/promotions/durga-puja-offer.jpg'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// GET /api/admin/promotions/[id] - Get specific promotion
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const promotion = promotions.find(p => p._id === id)

    if (!promotion) {
      return NextResponse.json(
        { success: false, message: 'Promotion not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      promotion
    })
  } catch (error) {
    console.error('Error fetching promotion:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch promotion' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/promotions/[id] - Update promotion
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params
    const promotionIndex = promotions.findIndex(p => p._id === id)

    if (promotionIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Promotion not found' },
        { status: 404 }
      )
    }

    const updatedPromotion = {
      ...promotions[promotionIndex],
      ...body,
      updatedAt: new Date().toISOString()
    }

    promotions[promotionIndex] = updatedPromotion

    return NextResponse.json({
      success: true,
      message: 'Promotion updated successfully',
      promotion: updatedPromotion
    })
  } catch (error) {
    console.error('Error updating promotion:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update promotion' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/promotions/[id] - Delete promotion
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const promotionIndex = promotions.findIndex(p => p._id === id)

    if (promotionIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Promotion not found' },
        { status: 404 }
      )
    }

    const deletedPromotion = promotions.splice(promotionIndex, 1)[0]

    return NextResponse.json({
      success: true,
      message: 'Promotion deleted successfully',
      promotion: deletedPromotion
    })
  } catch (error) {
    console.error('Error deleting promotion:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete promotion' },
      { status: 500 }
    )
  }
}
