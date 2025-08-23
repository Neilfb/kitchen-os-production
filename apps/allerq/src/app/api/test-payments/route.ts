import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

/**
 * Payment Integration Test API
 * Tests Stripe Test and GoCardless Sandbox connections
 */
export async function POST(request: NextRequest) {
  try {
    const { provider, test } = await request.json();

    switch (provider) {
      case 'stripe':
        return await testStripe(test);
      case 'gocardless':
        return await testGoCardless(test);
      default:
        return NextResponse.json(
          { error: 'Invalid provider' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[Payment Test API] Error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function testStripe(test: string) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 500 }
    );
  }

  switch (test) {
    case 'connection':
      try {
        // Test basic API connection by listing payment methods
        const paymentMethods = await stripe.paymentMethods.list({
          type: 'card',
          limit: 1,
        });
        
        return NextResponse.json({
          success: true,
          provider: 'stripe',
          test: 'connection',
          message: 'Stripe API connection successful',
          details: {
            environment: process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ? 'test' : 'live',
            apiVersion: stripe.getApiField('version'),
            connected: true
          }
        });
      } catch (error) {
        throw new Error(`Stripe connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

    case 'create_customer':
      try {
        // Test customer creation
        const customer = await stripe.customers.create({
          email: 'test@example.com',
          name: 'Test Customer',
          metadata: {
            test: 'true',
            created_by: 'payment_test_api'
          }
        });

        // Clean up test customer
        await stripe.customers.del(customer.id);

        return NextResponse.json({
          success: true,
          provider: 'stripe',
          test: 'create_customer',
          message: 'Customer creation test successful',
          details: {
            customerId: customer.id,
            deleted: true
          }
        });
      } catch (error) {
        throw new Error(`Stripe customer creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

    case 'list_prices':
      try {
        // Test price listing
        const prices = await stripe.prices.list({
          limit: 5,
          active: true
        });

        return NextResponse.json({
          success: true,
          provider: 'stripe',
          test: 'list_prices',
          message: 'Price listing test successful',
          details: {
            priceCount: prices.data.length,
            prices: prices.data.map(price => ({
              id: price.id,
              amount: price.unit_amount,
              currency: price.currency,
              interval: price.recurring?.interval
            }))
          }
        });
      } catch (error) {
        throw new Error(`Stripe price listing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

    default:
      return NextResponse.json(
        { error: 'Invalid Stripe test type' },
        { status: 400 }
      );
  }
}

async function testGoCardless(test: string) {
  // Dynamic import to prevent build-time issues
  const { gocardless } = await import('@/lib/gocardless');

  if (!gocardless) {
    return NextResponse.json(
      { error: 'GoCardless not configured' },
      { status: 500 }
    );
  }

  switch (test) {
    case 'connection':
      try {
        // Test basic API connection by listing creditors
        const creditors = await gocardless.creditors.list({
          limit: 1
        });

        return NextResponse.json({
          success: true,
          provider: 'gocardless',
          test: 'connection',
          message: 'GoCardless API connection successful',
          details: {
            environment: process.env.GOCARDLESS_ENVIRONMENT || 'sandbox',
            creditorCount: creditors.creditors?.length || 0,
            connected: true
          }
        });
      } catch (error) {
        throw new Error(`GoCardless connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

    case 'create_customer':
      try {
        // Test customer creation
        const customer = await gocardless.customers.create({
          email: 'test@example.com',
          given_name: 'Test',
          family_name: 'Customer',
          address_line1: '123 Test Street',
          city: 'London',
          postal_code: 'SW1A 1AA',
          country_code: 'GB',
          metadata: {
            test: 'true',
            created_by: 'payment_test_api'
          }
        });

        return NextResponse.json({
          success: true,
          provider: 'gocardless',
          test: 'create_customer',
          message: 'Customer creation test successful',
          details: {
            customerId: customer.id,
            email: customer.email,
            created: customer.created_at
          }
        });
      } catch (error) {
        throw new Error(`GoCardless customer creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

    case 'list_events':
      try {
        // Test event listing
        const events = await gocardless.events.list({
          limit: 5
        });

        return NextResponse.json({
          success: true,
          provider: 'gocardless',
          test: 'list_events',
          message: 'Event listing test successful',
          details: {
            eventCount: events.events?.length || 0,
            events: events.events?.map(event => ({
              id: event.id,
              action: event.action,
              resource_type: event.resource_type,
              created_at: event.created_at
            })) || []
          }
        });
      } catch (error) {
        throw new Error(`GoCardless event listing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

    default:
      return NextResponse.json(
        { error: 'Invalid GoCardless test type' },
        { status: 400 }
      );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Payment Test API',
    availableTests: {
      stripe: ['connection', 'create_customer', 'list_prices'],
      gocardless: ['connection', 'create_customer', 'list_events']
    },
    usage: 'POST with { provider: "stripe|gocardless", test: "test_name" }'
  });
}
