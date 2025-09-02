import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { message: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'line_items']
    })

    if (!session) {
      return NextResponse.json(
        { message: 'Session not found' },
        { status: 404 }
      )
    }

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { message: 'Payment not completed' },
        { status: 400 }
      )
    }

    // Extract order details from session
    const lineItem = session.line_items?.data[0]
    const amount = lineItem?.amount_total || 0
    const planId = session.metadata?.planId

    // Create order details response
    const orderDetails = {
      sessionId: session.id,
      planId,
      amount: amount / 100, // Convert from cents to rupees
      currency: session.currency,
      customerEmail: session.customer_details?.email,
      paymentStatus: session.payment_status,
      createdAt: new Date(session.created * 1000).toISOString(),
      billingDetails: {
        firstName: session.metadata?.firstName,
        lastName: session.metadata?.lastName,
        email: session.customer_details?.email,
        phone: session.metadata?.phone,
        address: session.metadata?.address,
        city: session.metadata?.city,
        state: session.metadata?.state,
        pincode: session.metadata?.pincode,
        company: session.metadata?.company,
        gstNumber: session.metadata?.gstNumber
      },
      paymentMethod: session.metadata?.paymentMethod
    }

    return NextResponse.json(orderDetails)

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { message: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
