import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User } from '@/models'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const { action, email } = await req.json()

    if (!email || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    switch (action) {
      case 'cancel':
        if (!user.stripeSubscriptionId) {
          return NextResponse.json({ error: 'No active subscription found' }, { status: 400 })
        }

        await stripe.subscriptions.cancel(user.stripeSubscriptionId)
        
        await User.findByIdAndUpdate(user._id, {
          $set: {
            membershipStatus: 'canceled'
          }
        })

        return NextResponse.json({ message: 'Subscription canceled successfully' })

      case 'reactivate':
        if (!user.stripeSubscriptionId) {
          return NextResponse.json({ error: 'No subscription found' }, { status: 400 })
        }

        await stripe.subscriptions.update(user.stripeSubscriptionId, {
          cancel_at_period_end: false
        })

        await User.findByIdAndUpdate(user._id, {
          $set: {
            membershipStatus: 'active'
          }
        })

        return NextResponse.json({ message: 'Subscription reactivated successfully' })

      case 'get-portal-url': {
        if (!user.stripeCustomerId) {
          return NextResponse.json({ error: 'No Stripe customer ID found' }, { status: 400 })
        }

        const portalSession = await stripe.billingPortal.sessions.create({
          customer: user.stripeCustomerId,
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/customer/membership`,
        })

        return NextResponse.json({ url: portalSession.url })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Subscription management error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    await connectDB()

    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let subscription = null
    if (user.stripeSubscriptionId) {
      try {
        subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId)
      } catch (error) {
        console.error('Error fetching subscription:', error)
      }
    }

    return NextResponse.json({
      subscription: {
        id: subscription?.id,
        status: subscription?.status,
        plan: user.membershipType,
        startDate: user.membershipStartDate,
        expiryDate: user.membershipExpiryDate,
        lastPaymentDate: user.lastPaymentDate
      }
    })

  } catch (error) {
    console.error('Get subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
