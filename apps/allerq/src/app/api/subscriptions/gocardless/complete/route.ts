// GoCardless Redirect Flow Completion Handler
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log('[GoCardless Complete] Processing redirect completion');

    const url = new URL(request.url);
    const redirectFlowId = url.searchParams.get('redirect_flow_id');
    const sessionToken = url.searchParams.get('session_token');
    const planId = url.searchParams.get('plan_id');
    const userId = url.searchParams.get('user_id');

    if (!redirectFlowId || !sessionToken || !planId || !userId) {
      console.error('[GoCardless Complete] Missing required parameters');
      return NextResponse.redirect(
        new URL('/subscription-setup?error=missing_parameters', request.url)
      );
    }

    // Check if GoCardless is configured
    if (!process.env.GOCARDLESS_ACCESS_TOKEN) {
      console.log('[GoCardless Complete] Demo mode - redirecting to dashboard');
      return NextResponse.redirect(
        new URL('/dashboard?subscription=demo&payment_method=direct_debit', request.url)
      );
    }

    try {
      // Dynamic import to prevent build-time issues
      const {
        completeRedirectFlow,
        createGoCardlessSubscription,
        getGoCardlessPlanById
      } = await import("@/lib/gocardless");

      // Complete the redirect flow
      const completedFlow = await completeRedirectFlow({
        redirectFlowId,
        sessionToken
      });

      const mandateId = completedFlow.links.mandate;
      const customerId = completedFlow.links.customer;

      console.log('[GoCardless Complete] Flow completed:', {
        mandateId,
        customerId,
        planId
      });

      // Get plan details
      const plan = getGoCardlessPlanById(planId);
      if (!plan) {
        console.error('[GoCardless Complete] Invalid plan:', planId);
        return NextResponse.redirect(
          new URL('/subscription-setup?error=invalid_plan', request.url)
        );
      }

      // Create subscription with 14-day trial
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14);
      
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
          customerId,
          trialEnd: trialEndDate.toISOString()
        },
        startDate: trialEndDate.toISOString().split('T')[0] // Start after trial
      });

      console.log('[GoCardless Complete] Subscription created:', subscription.id);

      // Redirect to dashboard with success
      const dashboardUrl = new URL('/dashboard', request.url);
      dashboardUrl.searchParams.set('subscription', 'success');
      dashboardUrl.searchParams.set('payment_method', 'direct_debit');
      dashboardUrl.searchParams.set('subscription_id', subscription.id);
      dashboardUrl.searchParams.set('trial_days', '14');

      return NextResponse.redirect(dashboardUrl);

    } catch (error) {
      console.error('[GoCardless Complete] Error processing completion:', error);
      
      // Redirect to subscription setup with error
      const errorUrl = new URL('/subscription-setup', request.url);
      errorUrl.searchParams.set('error', 'setup_failed');
      errorUrl.searchParams.set('message', 'Failed to complete direct debit setup. Please try again.');
      
      return NextResponse.redirect(errorUrl);
    }

  } catch (error) {
    console.error('[GoCardless Complete] Unexpected error:', error);
    
    return NextResponse.redirect(
      new URL('/subscription-setup?error=unexpected_error', request.url)
    );
  }
}
