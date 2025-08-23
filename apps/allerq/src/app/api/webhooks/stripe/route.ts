// Stripe Webhook Handler
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { verifyWebhookSignature } from "@/lib/stripe";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    console.log('[Stripe Webhook] Received webhook event');

    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('[Stripe Webhook] Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[Stripe Webhook] Missing STRIPE_WEBHOOK_SECRET environment variable');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = verifyWebhookSignature(body, signature, webhookSecret);
      console.log('[Stripe Webhook] Signature verified, event type:', event.type);
    } catch (error) {
      console.error('[Stripe Webhook] Signature verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
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

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log('[Stripe Webhook] Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('[Stripe Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('[Stripe Webhook] Checkout session completed:', session.id);
  
  const firebaseUserId = session.metadata?.firebaseUserId;
  const planId = session.metadata?.planId;

  if (!firebaseUserId || !planId) {
    console.error('[Stripe Webhook] Missing metadata in checkout session');
    return;
  }

  // TODO: Update user subscription status in Firebase/database
  // This would typically involve:
  // 1. Creating a subscription record in your database
  // 2. Updating user's subscription status
  // 3. Sending confirmation email
  
  console.log('[Stripe Webhook] Subscription activated for user:', firebaseUserId, 'plan:', planId);
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('[Stripe Webhook] Subscription created:', subscription.id);
  
  // TODO: Handle subscription creation
  // Update database with subscription details
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('[Stripe Webhook] Subscription updated:', subscription.id);
  
  // TODO: Handle subscription updates
  // Update database with new subscription status/plan
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('[Stripe Webhook] Subscription deleted:', subscription.id);
  
  // TODO: Handle subscription cancellation
  // Update user's access level, send cancellation email
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('[Stripe Webhook] Invoice payment succeeded:', invoice.id);
  
  // TODO: Handle successful payment
  // Update subscription status, send receipt
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('[Stripe Webhook] Invoice payment failed:', invoice.id);
  
  // TODO: Handle failed payment
  // Send payment failure notification, update subscription status
}
