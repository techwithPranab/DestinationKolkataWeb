import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'

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

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        console.log('Payment was successful!', session.id)

        // Here you would:
        // 1. Update user's membership status in database
        // 2. Send confirmation email
        // 3. Create invoice record
        // 4. Update billing history

        const planId = session.metadata?.planId
        const userEmail = session.customer_details?.email

        console.log(`User ${userEmail} upgraded to ${planId} plan`)

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
