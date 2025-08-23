// Subscriptions API - Stripe Integration
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { 
  ALLERQ_PLANS, 
  createCheckoutSession, 
  createStripeCustomer,
  getStripeSubscription 
} from "@/lib/stripe";

async function verifyFirebaseToken(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.substring(7);
    const decodedToken = await getAuth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error('[Subscriptions Auth] Token verification failed:', error);
    return null;
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Accept, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    }
  );
}

// Get all subscription plans
export async function GET(request: NextRequest) {
  try {
    console.log('[Subscriptions API] GET request - fetching plans');
    
    // Return AllerQ plans configuration
    const plans = Object.values(ALLERQ_PLANS).map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      interval: plan.interval,
      features: plan.features,
      limitations: plan.limitations || [],
      stripePriceId: plan.stripePriceId
    }));

    return NextResponse.json({
      success: true,
      plans
    });
  } catch (error) {
    console.error("[Subscriptions API] Error fetching plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription plans" },
      { status: 500 }
    );
  }
}

// Create a new subscription
export async function POST(request: NextRequest) {
  try {
    console.log('[Subscriptions API] POST request - creating subscription');

    // Verify Firebase authentication
    const userId = await verifyFirebaseToken(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { planId, billingPeriod = 'monthly' } = body;

    // Validate plan
    const plan = ALLERQ_PLANS[planId as keyof typeof ALLERQ_PLANS];
    if (!plan) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    // Handle enterprise plan
    if (plan.id === 'enterprise') {
      return NextResponse.json({
        success: true,
        type: 'enterprise_contact',
        message: 'Enterprise plan requires custom setup. Our team will contact you.',
        contactEmail: 'sales@allerq.com'
      });
    }

    // Check if we have Stripe configuration
    if (!plan.stripePriceId) {
      console.warn('[Subscriptions API] Missing Stripe price ID for plan:', planId);
      
      // Return demo success for development
      return NextResponse.json({
        success: true,
        type: 'demo',
        subscription: {
          id: `demo-sub-${Date.now()}`,
          planId: plan.id,
          status: 'active',
          userId,
          createdAt: new Date().toISOString()
        },
        message: 'Demo subscription created successfully'
      });
    }

    // Get user info from Firebase
    const userRecord = await getAuth().getUser(userId);
    
    // Create or get Stripe customer
    let customerId: string;
    try {
      const customer = await createStripeCustomer({
        email: userRecord.email!,
        name: userRecord.displayName || undefined,
        metadata: {
          firebaseUserId: userId,
          planId: plan.id
        }
      });
      customerId = customer.id;
    } catch (error) {
      console.error('[Subscriptions API] Error creating Stripe customer:', error);
      return NextResponse.json(
        { error: "Failed to create customer account" },
        { status: 500 }
      );
    }

    // Create Stripe checkout session
    const baseUrl = request.headers.get('origin') || 'https://aller-q-forge.vercel.app';
    const checkoutSession = await createCheckoutSession({
      customerId,
      priceId: plan.stripePriceId,
      successUrl: `${baseUrl}/dashboard?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/subscription-setup?cancelled=true`,
      metadata: {
        firebaseUserId: userId,
        planId: plan.id,
        billingPeriod
      },
      trialPeriodDays: 14 // 14-day trial
    });

    console.log('[Subscriptions API] Checkout session created:', checkoutSession.id);

    return NextResponse.json({
      success: true,
      type: 'checkout',
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id
    });

  } catch (error) {
    console.error('[Subscriptions API] Error creating subscription:', error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
