import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { User, Hotel, Restaurant, Attraction, Event, Sports } from '../models';

const router = Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil',
});

// Webhook endpoint secret
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// POST /api/webhooks/stripe - Handle Stripe webhooks
router.post('/stripe', async (req: Request, res: Response) => {
  let event: Stripe.Event;

  try {
    // Verify webhook signature
    const signature = req.headers['stripe-signature'] as string;
    
    if (!signature || !webhookSecret) {
      console.error('Missing Stripe signature or webhook secret');
      return res.status(400).json({
        success: false,
        message: 'Missing signature or webhook secret'
      });
    }

    try {
      event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    console.log(`Received webhook event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({
      success: true,
      message: 'Webhook processed successfully',
      eventType: event.type
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// Handle successful payment intent
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log(`Payment successful: ${paymentIntent.id}`);
    
    const metadata = paymentIntent.metadata;
    const customerId = metadata.customer_id;
    const bookingType = metadata.booking_type;
    const itemId = metadata.item_id;

    if (customerId) {
      // Update user's booking history
      await User.findByIdAndUpdate(customerId, {
        $push: {
          bookingHistory: {
            type: bookingType,
            itemId: itemId,
            itemName: metadata.item_name || 'Unknown',
            bookingDate: new Date(),
            status: 'confirmed',
            amount: paymentIntent.amount / 100, // Convert from cents
            currency: paymentIntent.currency.toUpperCase(),
            paymentIntentId: paymentIntent.id
          }
        }
      });

      console.log(`Updated booking history for user: ${customerId}`);
    }

    // Update booking count for the item if applicable
    if (itemId && bookingType) {
      const Model = getModelByType(bookingType);
      if (Model) {
        await Model.findByIdAndUpdate(itemId, {
          $inc: { 'stats.bookingCount': 1 }
        });
      }
    }

  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

// Handle failed payment intent
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log(`Payment failed: ${paymentIntent.id}`);
    
    const metadata = paymentIntent.metadata;
    const customerId = metadata.customer_id;
    const bookingType = metadata.booking_type;
    const itemId = metadata.item_id;

    if (customerId) {
      // Update user's booking history with failed status
      await User.findByIdAndUpdate(customerId, {
        $push: {
          bookingHistory: {
            type: bookingType,
            itemId: itemId,
            itemName: metadata.item_name || 'Unknown',
            bookingDate: new Date(),
            status: 'failed',
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency.toUpperCase(),
            paymentIntentId: paymentIntent.id,
            failureReason: paymentIntent.last_payment_error?.message || 'Unknown error'
          }
        }
      });

      console.log(`Updated failed booking for user: ${customerId}`);
    }

  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

// Handle completed checkout session
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log(`Checkout session completed: ${session.id}`);
    
    const metadata = session.metadata;
    const customerId = metadata?.customer_id;

    if (customerId && session.payment_status === 'paid') {
      // Mark booking as confirmed
      await User.findByIdAndUpdate(customerId, {
        $push: {
          bookingHistory: {
            type: metadata?.booking_type,
            itemId: metadata?.item_id,
            itemName: metadata?.item_name || 'Unknown',
            bookingDate: new Date(),
            status: 'confirmed',
            amount: (session.amount_total || 0) / 100,
            currency: session.currency?.toUpperCase() || 'INR',
            sessionId: session.id
          }
        }
      });

      console.log(`Confirmed booking for user: ${customerId}`);
    }

  } catch (error) {
    console.error('Error handling checkout completion:', error);
  }
}

// Handle successful invoice payment (for subscriptions)
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    console.log(`Invoice payment succeeded: ${invoice.id}`);
    
    if (invoice.customer) {
      // Update subscription status in user record
      const customerId = invoice.customer as string;
      
      await User.findOneAndUpdate(
        { stripeCustomerId: customerId },
        {
          $set: {
            'subscription.status': 'active',
            'subscription.currentPeriodEnd': new Date((invoice.period_end || 0) * 1000),
            'subscription.lastPayment': new Date()
          }
        }
      );

      console.log(`Updated subscription status for customer: ${customerId}`);
    }

  } catch (error) {
    console.error('Error handling invoice payment success:', error);
  }
}

// Handle failed invoice payment
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    console.log(`Invoice payment failed: ${invoice.id}`);
    
    if (invoice.customer) {
      const customerId = invoice.customer as string;
      
      await User.findOneAndUpdate(
        { stripeCustomerId: customerId },
        {
          $set: {
            'subscription.status': 'past_due',
            'subscription.lastFailedPayment': new Date()
          }
        }
      );

      console.log(`Updated failed payment status for customer: ${customerId}`);
    }

  } catch (error) {
    console.error('Error handling invoice payment failure:', error);
  }
}

// Handle subscription created
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    console.log(`Subscription created: ${subscription.id}`);
    
    const customerId = subscription.customer as string;
    
    await User.findOneAndUpdate(
      { stripeCustomerId: customerId },
      {
        $set: {
          'subscription.id': subscription.id,
          'subscription.status': subscription.status,
          'subscription.currentPeriodStart': new Date((subscription as any).current_period_start * 1000),
          'subscription.currentPeriodEnd': new Date((subscription as any).current_period_end * 1000),
          'subscription.planId': subscription.items.data[0]?.price?.id,
          'membershipType': 'premium'
        }
      }
    );

    console.log(`Created subscription record for customer: ${customerId}`);

  } catch (error) {
    console.error('Error handling subscription creation:', error);
  }
}

// Handle subscription updated
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    console.log(`Subscription updated: ${subscription.id}`);
    
    const customerId = subscription.customer as string;
    
    await User.findOneAndUpdate(
      { stripeCustomerId: customerId },
      {
        $set: {
          'subscription.status': subscription.status,
          'subscription.currentPeriodStart': new Date((subscription as any).current_period_start * 1000),
          'subscription.currentPeriodEnd': new Date((subscription as any).current_period_end * 1000),
          'subscription.planId': subscription.items.data[0]?.price?.id
        }
      }
    );

    console.log(`Updated subscription for customer: ${customerId}`);

  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

// Handle subscription deleted/cancelled
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    console.log(`Subscription cancelled: ${subscription.id}`);
    
    const customerId = subscription.customer as string;
    
    await User.findOneAndUpdate(
      { stripeCustomerId: customerId },
      {
        $set: {
          'subscription.status': 'cancelled',
          'subscription.cancelledAt': new Date(),
          'membershipType': 'basic'
        }
      }
    );

    console.log(`Cancelled subscription for customer: ${customerId}`);

  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}

// Helper function to get model by booking type
function getModelByType(type: string) {
  switch (type) {
    case 'hotel':
      return Hotel;
    case 'restaurant':
      return Restaurant;
    case 'attraction':
      return Attraction;
    case 'event':
      return Event;
    case 'sports':
      return Sports;
    default:
      return null;
  }
}

// GET /api/webhooks/test - Test webhook endpoint (development only)
router.get('/test', async (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ message: 'Not found' });
  }

  res.json({
    success: true,
    message: 'Webhook endpoint is working',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// POST /api/webhooks/test-payment - Test payment processing (development only)
router.post('/test-payment', async (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ message: 'Not found' });
  }

  try {
    const { userId, itemId, itemType, amount } = req.body;

    // Simulate a successful payment
    await handlePaymentIntentSucceeded({
      id: `pi_test_${Date.now()}`,
      amount: amount * 100, // Convert to cents
      currency: 'inr',
      metadata: {
        customer_id: userId,
        booking_type: itemType,
        item_id: itemId,
        item_name: 'Test Item'
      }
    } as any);

    res.json({
      success: true,
      message: 'Test payment processed successfully',
      data: {
        userId,
        itemId,
        itemType,
        amount
      }
    });

  } catch (error) {
    console.error('Error processing test payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing test payment',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

export default router;
