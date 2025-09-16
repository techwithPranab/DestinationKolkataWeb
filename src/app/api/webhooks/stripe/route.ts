import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import connectDB from '@/lib/mongodb'
import { User } from '@/models'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const sig = headersList.get('stripe-signature')

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, sig!, endpointSecret!)
    } catch (err: unknown) {
      const error = err as Error
      console.error('Webhook signature verification failed:', error.message)
      return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
    }

    await connectDB()

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        await handleCheckoutSessionCompleted(session)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        await handleInvoicePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        await handleInvoicePaymentFailed(invoice)
        break
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object
        await handleSubscriptionCreated(subscription)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        console.log('PaymentIntent was successful!', paymentIntent.id)
        break
      }

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const { customer, subscription, metadata, customer_details } = session

  console.log('Payment was successful!', session.id)

  const planId = metadata?.planId
  const userEmail = customer_details?.email || session.customer_email

  if (!planId || !userEmail) {
    console.error('Missing planId or userEmail in session')
    return
  }

  // Find user by email
  const user = await User.findOne({ email: userEmail })
  if (!user) {
    console.error('User not found for email:', userEmail)
    return
  }

  // Parse billing info from metadata
  let billingInfo
  try {
    billingInfo = metadata?.billingInfo ? JSON.parse(metadata.billingInfo) : null
  } catch (err) {
    console.error('Failed to parse billing info:', err)
  }

  // Update user membership
  const membershipStartDate = new Date()
  const membershipExpiryDate = new Date()
  membershipExpiryDate.setMonth(membershipExpiryDate.getMonth() + 1)

  await User.findByIdAndUpdate(user._id, {
    $set: {
      membershipType: planId,
      membershipStatus: 'active',
      membershipStartDate,
      membershipExpiryDate,
      stripeCustomerId: customer as string,
      stripeSubscriptionId: subscription as string,
      lastPaymentDate: new Date(),
      ...(billingInfo && { billingInfo })
    }
  })

  console.log(`User ${userEmail} upgraded to ${planId} plan`)
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const { customer } = invoice

  if (!customer) return

  // Find user by Stripe customer ID
  const user = await User.findOne({ stripeCustomerId: customer })
  if (!user) {
    console.error('User not found for customer:', customer)
    return
  }

  // Extend membership expiry
  const currentExpiry = user.membershipExpiryDate || new Date()
  const newExpiry = new Date(Math.max(currentExpiry.getTime(), Date.now()))
  newExpiry.setMonth(newExpiry.getMonth() + 1)

  await User.findByIdAndUpdate(user._id, {
    $set: {
      membershipExpiryDate: newExpiry,
      membershipStatus: 'active',
      lastPaymentDate: new Date()
    }
  })

  console.log(`Membership renewed for user ${user.email} until ${newExpiry}`)
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const { customer } = invoice

  if (!customer) return

  const user = await User.findOne({ stripeCustomerId: customer })
  if (!user) {
    console.error('User not found for customer:', customer)
    return
  }

  await User.findByIdAndUpdate(user._id, {
    $set: {
      membershipStatus: 'payment_failed'
    }
  })

  console.log(`Payment failed for user ${user.email}`)
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const { customer } = subscription

  if (!customer) return

  const user = await User.findOne({ stripeCustomerId: customer })
  if (!user) {
    console.error('User not found for customer:', customer)
    return
  }

  await User.findByIdAndUpdate(user._id, {
    $set: {
      stripeSubscriptionId: subscription.id,
      membershipStatus: 'active'
    }
  })

  console.log(`Subscription created for user ${user.email}`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const { customer, status } = subscription

  if (!customer) return

  const user = await User.findOne({ stripeCustomerId: customer })
  if (!user) {
    console.error('User not found for customer:', customer)
    return
  }

  let membershipStatus = 'active'
  if (status === 'canceled' || status === 'unpaid') {
    membershipStatus = 'canceled'
  } else if (status === 'past_due') {
    membershipStatus = 'payment_failed'
  }

  await User.findByIdAndUpdate(user._id, {
    $set: {
      membershipStatus
    }
  })

  console.log(`Subscription updated for user ${user.email}: ${status}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { customer } = subscription

  if (!customer) return

  const user = await User.findOne({ stripeCustomerId: customer })
  if (!user) {
    console.error('User not found for customer:', customer)
    return
  }

  await User.findByIdAndUpdate(user._id, {
    $set: {
      membershipType: 'free',
      membershipStatus: 'canceled',
      membershipExpiryDate: new Date()
    },
    $unset: {
      stripeSubscriptionId: 1
    }
  })

  console.log(`Subscription canceled for user ${user.email}`)
}
