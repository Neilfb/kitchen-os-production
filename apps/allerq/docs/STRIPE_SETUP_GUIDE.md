# Stripe Integration Setup Guide

## Overview

AllerQ-Forge now includes a complete Stripe integration for subscription management. The system supports:

- **Standard Plan**: £7.49/month per location (most popular)
- **Pay As You Go**: £0.99/month per menu (limited to 20 items)
- **Enterprise**: Custom pricing with sales contact

## Current Status

✅ **Implemented:**
- Complete Stripe SDK integration
- Subscription API with checkout sessions
- Webhook handler for subscription events
- Demo mode for development/testing
- 14-day trial period for all plans
- Graceful fallbacks when Stripe is not configured

⚠️ **Requires Setup:**
- Stripe account configuration
- Environment variables
- Webhook endpoints
- Price IDs creation

## Demo Mode (Current State)

The application currently runs in **demo mode** because Stripe environment variables are not configured. This means:

- Users can select plans and see the subscription flow
- Instead of real Stripe checkout, they get a "demo subscription created" message
- Users are redirected to dashboard with demo status
- No actual payment processing occurs

## Production Setup Steps

### 1. Create Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create account or sign in
3. Complete business verification

### 2. Get API Keys

1. Navigate to **Developers > API Keys**
2. Copy your **Publishable key** (starts with `pk_`)
3. Copy your **Secret key** (starts with `sk_`)

### 3. Create Products and Prices

#### Standard Plan
1. Go to **Products** in Stripe Dashboard
2. Create product: "AllerQ Standard Plan"
3. Add price: £7.49 GBP, recurring monthly
4. Copy the Price ID (starts with `price_`)

#### Pay As You Go Plan
1. Create product: "AllerQ Pay As You Go"
2. Add price: £0.99 GBP, recurring monthly
3. Copy the Price ID

### 4. Configure Environment Variables

Add these to your Vercel environment variables:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key_here

# Price IDs from Stripe Dashboard
STRIPE_STANDARD_PRICE_ID=price_your_standard_price_id_here
STRIPE_PAY_AS_YOU_GO_PRICE_ID=price_your_payg_price_id_here

# Webhook Secret (after setting up webhook)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 5. Set Up Webhooks

1. Go to **Developers > Webhooks** in Stripe Dashboard
2. Add endpoint: `https://aller-q-forge.vercel.app/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook signing secret

### 6. Test the Integration

1. Deploy with environment variables configured
2. Go through signup flow
3. Select a plan on subscription setup page
4. Complete Stripe checkout with test card: `4242 4242 4242 4242`
5. Verify webhook events are received

## Testing Cards

Use these test cards in Stripe test mode:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

## Architecture

### Flow Diagram

```
User selects plan → API creates Stripe customer → Checkout session created → 
User redirected to Stripe → Payment processed → Webhook confirms → 
User redirected to dashboard with success
```

### Key Files

- `src/lib/stripe.ts` - Stripe configuration and utilities
- `src/app/api/subscriptions/route.ts` - Subscription API
- `src/app/api/webhooks/stripe/route.ts` - Webhook handler
- `src/app/subscription-setup/page.tsx` - Subscription selection UI

## Security Notes

- All Stripe operations use server-side API keys
- Webhook signatures are verified
- Customer data is linked to Firebase user IDs
- Trial periods are handled by Stripe

## Troubleshooting

### "Failed to create subscription" Error

This occurs when:
1. Stripe environment variables are missing → Check Vercel env vars
2. Price IDs are incorrect → Verify in Stripe Dashboard
3. API keys are invalid → Regenerate in Stripe Dashboard

### Demo Mode Persists

If demo mode continues after adding environment variables:
1. Redeploy the application
2. Check environment variable names match exactly
3. Verify Stripe keys are valid

## Next Steps

1. **Immediate**: Configure Stripe environment variables
2. **Short-term**: Test with real payments
3. **Medium-term**: Add subscription management UI
4. **Long-term**: Implement usage-based billing for Pay As You Go

## Support

For Stripe-specific issues:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)

For AllerQ integration issues:
- Check application logs in Vercel
- Review webhook events in Stripe Dashboard
- Test API endpoints directly
