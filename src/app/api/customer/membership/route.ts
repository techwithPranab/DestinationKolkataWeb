import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
})

const MEMBERSHIP_PRICES = {
  premium: {
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    amount: 99900, // ₹999 in paisa
    name: 'Premium Membership',
    description: 'Premium membership with enhanced features'
  },
  business: {
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID,
    amount: 299900, // ₹2999 in paisa
    name: 'Business Membership',
    description: 'Business membership with unlimited features'
  },
} as const

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { planId, billingInfo, paymentInfo } = await request.json()

    // Validate required fields
    if (!planId || !billingInfo || !paymentInfo) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!MEMBERSHIP_PRICES[planId as keyof typeof MEMBERSHIP_PRICES]) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 })
    }

    const plan = MEMBERSHIP_PRICES[planId as keyof typeof MEMBERSHIP_PRICES]
    
    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: billingInfo.email,
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: plan.name,
              description: plan.description,
            },
            unit_amount: plan.amount,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/customer/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/customer/checkout?plan=${planId}`,
      metadata: {
        planId,
        billingInfo: JSON.stringify(billingInfo),
      },
      billing_address_collection: 'required',
      allow_promotion_codes: true,
    })

    if (!checkoutSession.url) {
      throw new Error('Failed to create checkout session')
    }

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    })

  } catch (error) {
    console.error('Membership checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    await connectDB()

    // For demo purposes, return basic membership info
    const membership = {
      plan: 'free',
      planName: 'Free',
      price: 0,
      limits: { listings: 3 },
      startDate: new Date().toISOString(),
      status: 'active'
    }

    return NextResponse.json({ membership })

  } catch (error) {
    console.error('Get membership error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
