// Stripe configuration and utilities
import Stripe from 'stripe';

// Check if Stripe is configured
export const isStripeConfigured = () => {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
};

// Server-side Stripe instance (only create if configured)
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
      typescript: true,
    })
  : null;

// Client-side Stripe configuration
export const getStripePublishableKey = () => {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable');
  }
  return key;
};

// AllerQ subscription plans configuration
export const ALLERQ_PLANS = {
  standard: {
    id: 'standard',
    name: 'Standard',
    description: 'Best for restaurants',
    price: 749, // £7.49 in pence
    currency: 'gbp',
    interval: 'month',
    stripePriceId: process.env.STRIPE_STANDARD_PRICE_ID,
    features: [
      'Unlimited menus & items',
      'AI allergen & dietary tagging',
      'Customizable QR codes & live preview',
      'Real-time scan analytics',
      'Priority email support'
    ]
  },
  payAsYouGo: {
    id: 'pay-as-you-go',
    name: 'Pay As You Go',
    description: 'For single-menu vendors',
    price: 99, // £0.99 in pence
    currency: 'gbp',
    interval: 'month',
    stripePriceId: process.env.STRIPE_PAY_AS_YOU_GO_PRICE_ID,
    features: [
      'AI allergen & dietary tagging',
      'Basic QR code generation',
      'Scan analytics',
      'Email support'
    ],
    limitations: ['Maximum 20 items per menu']
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For restaurant chains & franchises',
    price: null, // Custom pricing
    currency: 'gbp',
    interval: 'month',
    stripePriceId: null,
    features: [
      'Multiple locations',
      'Volume discounts',
      'White-label solution',
      'Advanced analytics & reporting',
      'API access',
      'Custom allergen rules',
      'Dedicated account manager'
    ]
  }
} as const;

// Helper function to get plan by ID
export const getPlanById = (planId: string) => {
  return ALLERQ_PLANS[planId as keyof typeof ALLERQ_PLANS];
};

// Helper function to format price for display
export const formatPrice = (priceInPence: number, currency: string = 'gbp') => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(priceInPence / 100);
};

// Create a Stripe customer
export const createStripeCustomer = async (params: {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}) => {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }
  return await stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: params.metadata || {},
  });
};

// Create a subscription
export const createStripeSubscription = async (params: {
  customerId: string;
  priceId: string;
  metadata?: Record<string, string>;
  trialPeriodDays?: number;
}) => {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }
  return await stripe.subscriptions.create({
    customer: params.customerId,
    items: [{ price: params.priceId }],
    metadata: params.metadata || {},
    trial_period_days: params.trialPeriodDays,
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
  });
};

// Create a checkout session for subscription
export const createCheckoutSession = async (params: {
  customerId?: string;
  customerEmail?: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  trialPeriodDays?: number;
}) => {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata || {},
  };

  if (params.customerId) {
    sessionParams.customer = params.customerId;
  } else if (params.customerEmail) {
    sessionParams.customer_email = params.customerEmail;
  }

  if (params.trialPeriodDays) {
    sessionParams.subscription_data = {
      trial_period_days: params.trialPeriodDays,
    };
  }

  return await stripe.checkout.sessions.create(sessionParams);
};

// Get subscription by ID
export const getStripeSubscription = async (subscriptionId: string) => {
  return await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['default_payment_method', 'customer'],
  });
};

// Cancel subscription
export const cancelStripeSubscription = async (subscriptionId: string) => {
  return await stripe.subscriptions.cancel(subscriptionId);
};

// Update subscription
export const updateStripeSubscription = async (
  subscriptionId: string,
  params: Stripe.SubscriptionUpdateParams
) => {
  return await stripe.subscriptions.update(subscriptionId, params);
};

// Webhook signature verification
export const verifyWebhookSignature = (
  payload: string | Buffer,
  signature: string,
  secret: string
) => {
  return stripe.webhooks.constructEvent(payload, signature, secret);
};
