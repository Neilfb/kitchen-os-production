// GoCardless Subscription API
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";

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
    console.error('[GoCardless Auth] Token verification failed:', error);
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

// GET method for creating redirect flow (as mentioned in handover docs)
export async function GET(request: NextRequest) {
  try {
    console.log('[GoCardless API] GET request - creating redirect flow');

    // Dynamic import to prevent build-time issues
    const { GOCARDLESS_PLANS, getGoCardlessPlanById } = await import("@/lib/gocardless");

    const url = new URL(request.url);
    const planId = url.searchParams.get('planId') || 'basic';

    // Validate plan
    const plan = getGoCardlessPlanById(planId);
    if (!plan) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    // Check if GoCardless is configured
    if (!process.env.GOCARDLESS_ACCESS_TOKEN) {
      console.warn('[GoCardless API] GoCardless not configured, returning demo response');

      return NextResponse.json({
        success: true,
        type: 'demo',
        message: 'GoCardless not configured - demo mode',
        redirect_flow: {
          redirect_url: `${process.env.NEXT_PUBLIC_PUBLIC_BASE_URL || 'http://localhost:3000'}/demo/gocardless-redirect`,
          id: 'demo_redirect_flow_id'
        },
        session_token: 'demo_session_token',
        plan: plan
      });
    }

    // Generate session token for security
    const sessionToken = generateSessionToken();

    // Create redirect flow
    const redirectFlow = await createRedirectFlow({
      description: `${plan.name} subscription setup`,
      sessionToken,
      successRedirectUrl: `${process.env.NEXT_PUBLIC_PUBLIC_BASE_URL}/api/subscriptions/gocardless/complete?plan_id=${planId}&session_token=${sessionToken}&user_id=anonymous`
    });

    console.log('[GoCardless API] Redirect flow created:', redirectFlow.id);

    return NextResponse.json({
      success: true,
      type: 'redirect_flow_created',
      redirect_flow: {
        redirect_url: redirectFlow.redirect_url,
        id: redirectFlow.id
      },
      session_token: sessionToken,
      plan: plan
    });

  } catch (error) {
    console.error('[GoCardless API] Error creating redirect flow:', error);
    return NextResponse.json(
      { error: "Failed to create redirect flow" },
      { status: 500 }
    );
  }
}

// Create GoCardless redirect flow for bank account setup
export async function POST(request: NextRequest) {
  try {
    console.log('[GoCardless API] POST request - creating redirect flow');

    // Verify Firebase authentication
    const userId = await verifyFirebaseToken(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { planId, billingPeriod = 'monthly', action } = body;

    // Handle different actions
    if (action === 'complete_redirect') {
      return await handleCompleteRedirect(request, body, userId);
    }

    // Default action: create redirect flow
    return await handleCreateRedirectFlow(request, body, userId);

  } catch (error) {
    console.error('[GoCardless API] Error:', error);
    return NextResponse.json(
      { error: "Failed to process GoCardless request" },
      { status: 500 }
    );
  }
}

async function handleCreateRedirectFlow(
  request: NextRequest,
  body: any,
  userId: string
) {
  // Dynamic import to prevent build-time issues
  const {
    getGoCardlessPlanById,
    generateSessionToken,
    createRedirectFlow
  } = await import("@/lib/gocardless");

  const { planId } = body;

  // Validate plan
  const plan = getGoCardlessPlanById(planId);
  if (!plan) {
    return NextResponse.json(
      { error: "Invalid plan selected" },
      { status: 400 }
    );
  }

  // Check if GoCardless is configured
  if (!process.env.GOCARDLESS_ACCESS_TOKEN) {
    console.warn('[GoCardless API] GoCardless not configured, returning demo response');
    
    return NextResponse.json({
      success: true,
      type: 'demo',
      message: 'Demo mode: GoCardless direct debit setup',
      demoRedirectUrl: '/dashboard?subscription=demo&payment_method=direct_debit'
    });
  }

  try {
    // Get user info from Firebase
    const userRecord = await getAuth().getUser(userId);
    
    // Generate session token
    const sessionToken = generateSessionToken();
    
    // Create redirect flow
    const baseUrl = request.headers.get('origin') || 'https://aller-q-forge.vercel.app';
    const successUrl = `${baseUrl}/api/subscriptions/gocardless/complete?session_token=${sessionToken}&plan_id=${planId}&user_id=${userId}`;
    
    const redirectFlow = await createRedirectFlow({
      description: `AllerQ ${plan.name} - Monthly Subscription`,
      sessionToken,
      successRedirectUrl: successUrl,
      prefillCustomer: {
        email: userRecord.email!,
        givenName: userRecord.displayName?.split(' ')[0],
        familyName: userRecord.displayName?.split(' ').slice(1).join(' ')
      }
    });

    console.log('[GoCardless API] Redirect flow created:', redirectFlow.id);

    // Store session token and plan info (in production, use Redis or database)
    // For now, we'll pass it through the URL

    return NextResponse.json({
      success: true,
      type: 'redirect',
      redirectUrl: redirectFlow.redirect_url,
      sessionToken,
      redirectFlowId: redirectFlow.id
    });

  } catch (error) {
    console.error('[GoCardless API] Error creating redirect flow:', error);
    return NextResponse.json(
      { error: "Failed to create direct debit setup" },
      { status: 500 }
    );
  }
}

async function handleCompleteRedirect(
  request: NextRequest,
  body: any,
  userId: string
) {
  // Dynamic import to prevent build-time issues
  const {
    completeRedirectFlow,
    getGoCardlessPlanById,
    createGoCardlessSubscription
  } = await import("@/lib/gocardless");

  const { redirectFlowId, sessionToken, planId } = body;

  if (!redirectFlowId || !sessionToken || !planId) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  try {
    // Complete the redirect flow
    const completedFlow = await completeRedirectFlow({
      redirectFlowId,
      sessionToken
    });

    const mandateId = completedFlow.links.mandate;
    const customerId = completedFlow.links.customer;

    console.log('[GoCardless API] Redirect flow completed:', {
      mandateId,
      customerId
    });

    // Get plan details
    const plan = getGoCardlessPlanById(planId);
    if (!plan) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    // Create subscription
    const subscription = await createGoCardlessSubscription({
      amount: plan.amount,
      currency: plan.currency,
      name: plan.name,
      intervalUnit: plan.interval_unit,
      interval: plan.interval,
      mandateId,
      metadata: {
        firebaseUserId: userId,
        planId: plan.id,
        customerId
      },
      // Start subscription after 14-day trial
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    console.log('[GoCardless API] Subscription created:', subscription.id);

    return NextResponse.json({
      success: true,
      type: 'subscription_created',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        amount: subscription.amount,
        currency: subscription.currency,
        startDate: subscription.start_date,
        mandateId,
        customerId
      }
    });

  } catch (error) {
    console.error('[GoCardless API] Error completing redirect:', error);
    return NextResponse.json(
      { error: "Failed to complete direct debit setup" },
      { status: 500 }
    );
  }
}
