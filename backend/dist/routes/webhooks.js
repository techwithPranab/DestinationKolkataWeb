"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stripe_1 = __importDefault(require("stripe"));
const models_1 = require("../models");
const router = (0, express_1.Router)();
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-08-27.basil',
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
router.post('/stripe', async (req, res) => {
    let event;
    try {
        const signature = req.headers['stripe-signature'];
        if (!signature || !webhookSecret) {
            console.error('Missing Stripe signature or webhook secret');
            return res.status(400).json({
                success: false,
                message: 'Missing signature or webhook secret'
            });
        }
        try {
            event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
        }
        catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return res.status(400).json({
                success: false,
                message: 'Invalid signature'
            });
        }
        console.log(`Received webhook event: ${event.type}`);
        switch (event.type) {
            case 'payment_intent.succeeded':
                await handlePaymentIntentSucceeded(event.data.object);
                break;
            case 'payment_intent.payment_failed':
                await handlePaymentIntentFailed(event.data.object);
                break;
            case 'checkout.session.completed':
                await handleCheckoutSessionCompleted(event.data.object);
                break;
            case 'invoice.payment_succeeded':
                await handleInvoicePaymentSucceeded(event.data.object);
                break;
            case 'invoice.payment_failed':
                await handleInvoicePaymentFailed(event.data.object);
                break;
            case 'customer.subscription.created':
                await handleSubscriptionCreated(event.data.object);
                break;
            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object);
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
        res.json({
            success: true,
            message: 'Webhook processed successfully',
            eventType: event.type
        });
    }
    catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({
            success: false,
            message: 'Webhook processing failed',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});
async function handlePaymentIntentSucceeded(paymentIntent) {
    try {
        console.log(`Payment successful: ${paymentIntent.id}`);
        const metadata = paymentIntent.metadata;
        const customerId = metadata.customer_id;
        const bookingType = metadata.booking_type;
        const itemId = metadata.item_id;
        if (customerId) {
            await models_1.User.findByIdAndUpdate(customerId, {
                $push: {
                    bookingHistory: {
                        type: bookingType,
                        itemId: itemId,
                        itemName: metadata.item_name || 'Unknown',
                        bookingDate: new Date(),
                        status: 'confirmed',
                        amount: paymentIntent.amount / 100,
                        currency: paymentIntent.currency.toUpperCase(),
                        paymentIntentId: paymentIntent.id
                    }
                }
            });
            console.log(`Updated booking history for user: ${customerId}`);
        }
        if (itemId && bookingType) {
            const Model = getModelByType(bookingType);
            if (Model) {
                await Model.findByIdAndUpdate(itemId, {
                    $inc: { 'stats.bookingCount': 1 }
                });
            }
        }
    }
    catch (error) {
        console.error('Error handling payment success:', error);
    }
}
async function handlePaymentIntentFailed(paymentIntent) {
    try {
        console.log(`Payment failed: ${paymentIntent.id}`);
        const metadata = paymentIntent.metadata;
        const customerId = metadata.customer_id;
        const bookingType = metadata.booking_type;
        const itemId = metadata.item_id;
        if (customerId) {
            await models_1.User.findByIdAndUpdate(customerId, {
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
    }
    catch (error) {
        console.error('Error handling payment failure:', error);
    }
}
async function handleCheckoutSessionCompleted(session) {
    try {
        console.log(`Checkout session completed: ${session.id}`);
        const metadata = session.metadata;
        const customerId = metadata?.customer_id;
        if (customerId && session.payment_status === 'paid') {
            await models_1.User.findByIdAndUpdate(customerId, {
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
    }
    catch (error) {
        console.error('Error handling checkout completion:', error);
    }
}
async function handleInvoicePaymentSucceeded(invoice) {
    try {
        console.log(`Invoice payment succeeded: ${invoice.id}`);
        if (invoice.customer) {
            const customerId = invoice.customer;
            await models_1.User.findOneAndUpdate({ stripeCustomerId: customerId }, {
                $set: {
                    'subscription.status': 'active',
                    'subscription.currentPeriodEnd': new Date((invoice.period_end || 0) * 1000),
                    'subscription.lastPayment': new Date()
                }
            });
            console.log(`Updated subscription status for customer: ${customerId}`);
        }
    }
    catch (error) {
        console.error('Error handling invoice payment success:', error);
    }
}
async function handleInvoicePaymentFailed(invoice) {
    try {
        console.log(`Invoice payment failed: ${invoice.id}`);
        if (invoice.customer) {
            const customerId = invoice.customer;
            await models_1.User.findOneAndUpdate({ stripeCustomerId: customerId }, {
                $set: {
                    'subscription.status': 'past_due',
                    'subscription.lastFailedPayment': new Date()
                }
            });
            console.log(`Updated failed payment status for customer: ${customerId}`);
        }
    }
    catch (error) {
        console.error('Error handling invoice payment failure:', error);
    }
}
async function handleSubscriptionCreated(subscription) {
    try {
        console.log(`Subscription created: ${subscription.id}`);
        const customerId = subscription.customer;
        await models_1.User.findOneAndUpdate({ stripeCustomerId: customerId }, {
            $set: {
                'subscription.id': subscription.id,
                'subscription.status': subscription.status,
                'subscription.currentPeriodStart': new Date(subscription.current_period_start * 1000),
                'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
                'subscription.planId': subscription.items.data[0]?.price?.id,
                'membershipType': 'premium'
            }
        });
        console.log(`Created subscription record for customer: ${customerId}`);
    }
    catch (error) {
        console.error('Error handling subscription creation:', error);
    }
}
async function handleSubscriptionUpdated(subscription) {
    try {
        console.log(`Subscription updated: ${subscription.id}`);
        const customerId = subscription.customer;
        await models_1.User.findOneAndUpdate({ stripeCustomerId: customerId }, {
            $set: {
                'subscription.status': subscription.status,
                'subscription.currentPeriodStart': new Date(subscription.current_period_start * 1000),
                'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
                'subscription.planId': subscription.items.data[0]?.price?.id
            }
        });
        console.log(`Updated subscription for customer: ${customerId}`);
    }
    catch (error) {
        console.error('Error handling subscription update:', error);
    }
}
async function handleSubscriptionDeleted(subscription) {
    try {
        console.log(`Subscription cancelled: ${subscription.id}`);
        const customerId = subscription.customer;
        await models_1.User.findOneAndUpdate({ stripeCustomerId: customerId }, {
            $set: {
                'subscription.status': 'cancelled',
                'subscription.cancelledAt': new Date(),
                'membershipType': 'basic'
            }
        });
        console.log(`Cancelled subscription for customer: ${customerId}`);
    }
    catch (error) {
        console.error('Error handling subscription cancellation:', error);
    }
}
function getModelByType(type) {
    switch (type) {
        case 'hotel':
            return models_1.Hotel;
        case 'restaurant':
            return models_1.Restaurant;
        case 'attraction':
            return models_1.Attraction;
        case 'event':
            return models_1.Event;
        case 'sports':
            return models_1.Sports;
        default:
            return null;
    }
}
router.get('/test', async (req, res) => {
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
router.post('/test-payment', async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(404).json({ message: 'Not found' });
    }
    try {
        const { userId, itemId, itemType, amount } = req.body;
        await handlePaymentIntentSucceeded({
            id: `pi_test_${Date.now()}`,
            amount: amount * 100,
            currency: 'inr',
            metadata: {
                customer_id: userId,
                booking_type: itemType,
                item_id: itemId,
                item_name: 'Test Item'
            }
        });
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
    }
    catch (error) {
        console.error('Error processing test payment:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing test payment',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});
exports.default = router;
//# sourceMappingURL=webhooks.js.map