// GoCardless Webhook Handler
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getFirestore } from "firebase-admin/firestore";

// Idempotency tracking
const processedEvents = new Set<string>();

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let eventIds: string[] = [];

  try {
    console.log('[GoCardless Webhook] Received webhook event');

    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('webhook-signature');

    if (!signature) {
      console.error('[GoCardless Webhook] Missing webhook-signature header');
      return NextResponse.json(
        { error: 'Missing webhook-signature header' },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.GOCARDLESS_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[GoCardless Webhook] Missing GOCARDLESS_WEBHOOK_SECRET environment variable');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify webhook signature
    try {
      // Dynamic import to prevent build-time issues
      const { verifyGoCardlessWebhook } = await import("@/lib/gocardless");
      const isValid = verifyGoCardlessWebhook(body, signature, webhookSecret);
      if (!isValid) {
        console.error('[GoCardless Webhook] Invalid signature');
        await logWebhookEvent('signature_verification_failed', { signature, bodyLength: body.length });
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 400 }
        );
      }
      console.log('[GoCardless Webhook] Signature verified');
    } catch (error) {
      console.error('[GoCardless Webhook] Signature verification failed:', error);
      await logWebhookEvent('signature_verification_error', { error: error instanceof Error ? error.message : 'Unknown error' });
      return NextResponse.json(
        { error: 'Signature verification failed' },
        { status: 400 }
      );
    }

    // Parse webhook payload
    let webhookData;
    try {
      webhookData = JSON.parse(body);
    } catch (error) {
      console.error('[GoCardless Webhook] Invalid JSON payload');
      await logWebhookEvent('invalid_json_payload', { error: error instanceof Error ? error.message : 'Unknown error' });
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // Process events
    const events = webhookData.events || [];
    eventIds = events.map((e: any) => e.id);
    console.log(`[GoCardless Webhook] Processing ${events.length} events:`, eventIds);

    const results = [];
    for (const event of events) {
      try {
        const result = await processWebhookEvent(event);
        results.push({ eventId: event.id, status: 'success', result });
      } catch (error) {
        console.error(`[GoCardless Webhook] Error processing event ${event.id}:`, error);
        results.push({
          eventId: event.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Log successful webhook processing
    await logWebhookEvent('webhook_processed', {
      eventCount: events.length,
      eventIds,
      processingTime: Date.now() - startTime,
      results
    });

    return NextResponse.json({
      received: true,
      processed: events.length,
      results
    });

  } catch (error) {
    console.error('[GoCardless Webhook] Error processing webhook:', error);
    await logWebhookEvent('webhook_processing_failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      eventIds,
      processingTime: Date.now() - startTime
    });
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Webhook event logging function
async function logWebhookEvent(eventType: string, data: any) {
  try {
    const db = getFirestore();
    await db.collection('webhook_logs').add({
      eventType,
      data,
      timestamp: new Date(),
      source: 'gocardless'
    });
  } catch (error) {
    console.error('[GoCardless Webhook] Failed to log event:', error);
  }
}

async function processWebhookEvent(event: any) {
  const { id, resource_type, action, links, created_at } = event;

  console.log(`[GoCardless Webhook] Processing event: ${id} (${resource_type}.${action})`);

  // Check for idempotency
  const eventKey = `${id}_${resource_type}_${action}`;
  if (processedEvents.has(eventKey)) {
    console.log(`[GoCardless Webhook] Event ${id} already processed, skipping`);
    return { status: 'skipped', reason: 'already_processed' };
  }

  try {
    let result;
    switch (resource_type) {
      case 'subscriptions':
        result = await handleSubscriptionEvent(action, links, event);
        break;

      case 'payments':
        result = await handlePaymentEvent(action, links, event);
        break;

      case 'mandates':
        result = await handleMandateEvent(action, links, event);
        break;

      case 'customers':
        result = await handleCustomerEvent(action, links, event);
        break;

      default:
        console.log(`[GoCardless Webhook] Unhandled resource type: ${resource_type}`);
        result = { status: 'unhandled', resource_type };
    }

    // Mark as processed
    processedEvents.add(eventKey);

    // Log the event processing
    await logWebhookEvent('event_processed', {
      eventId: id,
      resourceType: resource_type,
      action,
      links,
      createdAt: created_at,
      result
    });

    return result;
  } catch (error) {
    console.error(`[GoCardless Webhook] Error processing ${resource_type}.${action}:`, error);

    // Log the error
    await logWebhookEvent('event_processing_error', {
      eventId: id,
      resourceType: resource_type,
      action,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    throw error;
  }
}

async function handleSubscriptionEvent(action: string, links: any, event: any) {
  const subscriptionId = links.subscription;
  const db = getFirestore();

  switch (action) {
    case 'created':
      console.log('[GoCardless Webhook] Subscription created:', subscriptionId);
      try {
        // Update subscription status in database
        await db.collection('subscriptions').doc(subscriptionId).set({
          gocardlessId: subscriptionId,
          status: 'active',
          provider: 'gocardless',
          createdAt: new Date(event.created_at),
          updatedAt: new Date(),
          eventData: event
        }, { merge: true });

        return { status: 'subscription_created', subscriptionId };
      } catch (error) {
        console.error('[GoCardless Webhook] Failed to update subscription:', error);
        throw error;
      }

    case 'payment_created':
      console.log('[GoCardless Webhook] Subscription payment created:', subscriptionId);
      try {
        // Log payment creation
        await db.collection('payment_logs').add({
          subscriptionId,
          type: 'payment_created',
          timestamp: new Date(),
          eventData: event
        });

        return { status: 'payment_logged', subscriptionId };
      } catch (error) {
        console.error('[GoCardless Webhook] Failed to log payment:', error);
        throw error;
      }

    case 'amended':
      console.log('[GoCardless Webhook] Subscription amended:', subscriptionId);
      try {
        // Update subscription details
        await db.collection('subscriptions').doc(subscriptionId).update({
          status: 'amended',
          updatedAt: new Date(),
          lastAmendment: event
        });

        return { status: 'subscription_amended', subscriptionId };
      } catch (error) {
        console.error('[GoCardless Webhook] Failed to update subscription:', error);
        throw error;
      }

    case 'cancelled':
      console.log('[GoCardless Webhook] Subscription cancelled:', subscriptionId);
      try {
        // Update subscription status
        await db.collection('subscriptions').doc(subscriptionId).update({
          status: 'cancelled',
          cancelledAt: new Date(),
          updatedAt: new Date(),
          cancellationReason: event.details?.reason_code || 'unknown'
        });

        // TODO: Send cancellation email to user
        // TODO: Update user's access permissions

        return { status: 'subscription_cancelled', subscriptionId };
      } catch (error) {
        console.error('[GoCardless Webhook] Failed to cancel subscription:', error);
        throw error;
      }

    case 'finished':
      console.log('[GoCardless Webhook] Subscription finished:', subscriptionId);
      try {
        // Mark subscription as finished
        await db.collection('subscriptions').doc(subscriptionId).update({
          status: 'finished',
          finishedAt: new Date(),
          updatedAt: new Date()
        });

        return { status: 'subscription_finished', subscriptionId };
      } catch (error) {
        console.error('[GoCardless Webhook] Failed to finish subscription:', error);
        throw error;
      }

    default:
      console.log(`[GoCardless Webhook] Unhandled subscription action: ${action}`);
      return { status: 'unhandled', action, subscriptionId };
  }
}

async function handlePaymentEvent(action: string, links: any, event: any) {
  const paymentId = links.payment;
  const subscriptionId = links.subscription;
  
  switch (action) {
    case 'created':
      console.log('[GoCardless Webhook] Payment created:', paymentId);
      // TODO: Log payment creation
      break;

    case 'submitted':
      console.log('[GoCardless Webhook] Payment submitted:', paymentId);
      // TODO: Update payment status
      break;

    case 'confirmed':
      console.log('[GoCardless Webhook] Payment confirmed:', paymentId);
      // TODO: Update subscription status, send receipt
      break;

    case 'paid_out':
      console.log('[GoCardless Webhook] Payment paid out:', paymentId);
      // TODO: Update accounting records
      break;

    case 'failed':
      console.log('[GoCardless Webhook] Payment failed:', paymentId);
      // TODO: Handle failed payment, send notification
      break;

    case 'cancelled':
      console.log('[GoCardless Webhook] Payment cancelled:', paymentId);
      // TODO: Handle payment cancellation
      break;

    case 'charged_back':
      console.log('[GoCardless Webhook] Payment charged back:', paymentId);
      // TODO: Handle chargeback
      break;

    default:
      console.log(`[GoCardless Webhook] Unhandled payment action: ${action}`);
  }
}

async function handleMandateEvent(action: string, links: any, event: any) {
  const mandateId = links.mandate;
  
  switch (action) {
    case 'created':
      console.log('[GoCardless Webhook] Mandate created:', mandateId);
      // TODO: Update customer mandate status
      break;

    case 'submitted':
      console.log('[GoCardless Webhook] Mandate submitted:', mandateId);
      // TODO: Update mandate status
      break;

    case 'active':
      console.log('[GoCardless Webhook] Mandate active:', mandateId);
      // TODO: Enable subscription payments
      break;

    case 'cancelled':
      console.log('[GoCardless Webhook] Mandate cancelled:', mandateId);
      // TODO: Cancel associated subscriptions
      break;

    case 'failed':
      console.log('[GoCardless Webhook] Mandate failed:', mandateId);
      // TODO: Handle mandate failure
      break;

    case 'expired':
      console.log('[GoCardless Webhook] Mandate expired:', mandateId);
      // TODO: Request new mandate
      break;

    default:
      console.log(`[GoCardless Webhook] Unhandled mandate action: ${action}`);
  }
}

async function handleCustomerEvent(action: string, links: any, event: any) {
  const customerId = links.customer;
  
  switch (action) {
    case 'created':
      console.log('[GoCardless Webhook] Customer created:', customerId);
      // TODO: Update customer records
      break;

    case 'updated':
      console.log('[GoCardless Webhook] Customer updated:', customerId);
      // TODO: Sync customer details
      break;

    default:
      console.log(`[GoCardless Webhook] Unhandled customer action: ${action}`);
  }
}
