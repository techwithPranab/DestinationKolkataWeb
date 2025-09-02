import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

export async function POST(request: NextRequest) {
  try {
    const { planId, billingInfo, paymentInfo } = await request.json()

    // Validate required fields
    if (!planId || !billingInfo || !paymentInfo) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate plan
    const validPlans = ['premium', 'business']
    if (!validPlans.includes(planId)) {
      return NextResponse.json(
        { message: 'Invalid plan' },
        { status: 400 }
      )
    }

    // Plan details
    const planDetails = {
      premium: {
        name: 'Premium Membership',
        price: 99900, // Price in cents (₹999)
        description: 'Premium membership with 15 listings'
      },
      business: {
        name: 'Business Membership',
        price: 299900, // Price in cents (₹2999)
        description: 'Business membership with unlimited listings'
      }
    }

    const plan = planDetails[planId as keyof typeof planDetails]

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: plan.name,
              description: plan.description,
            },
            unit_amount: plan.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/customer/checkout/success?session_id={CHECKOUT_SESSION_ID}&plan=${planId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/customer/checkout?canceled=true`,
      customer_email: billingInfo.email,
      metadata: {
        planId,
        firstName: billingInfo.firstName,
        lastName: billingInfo.lastName,
        phone: billingInfo.phone,
        address: billingInfo.address,
        city: billingInfo.city,
        state: billingInfo.state,
        pincode: billingInfo.pincode,
        company: billingInfo.company || '',
        gstNumber: billingInfo.gstNumber || '',
        paymentMethod: paymentInfo.method
      }
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    })

  } catch (error) {
    console.error('Stripe checkout session creation error:', error)
    return NextResponse.json(
      { message: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Mock membership data for demo
    const membership = {
      plan: 'free',
      planName: 'Free',
      price: 0,
      limits: { listings: 3 },
      startDate: new Date().toISOString(),
      status: 'active'
    }

    return NextResponse.json({
      membership
    })

  } catch (error) {
    console.error('Get membership error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
