/**
 * Debug Environment API
 * Provides comprehensive environment information for debugging purposes
 * Includes payment integrations, Firebase, and deployment status
 */

import { NextRequest, NextResponse } from "next/server";

// Helper function to safely check environment variable presence and format
const checkEnvVar = (value: string | undefined, showPrefix = false) => {
  if (!value) return 'missing';
  if (showPrefix && value.length > 8) {
    return `configured (${value.substring(0, 8)}...)`;
  }
  return 'configured';
};

// Helper function to detect GoCardless environment
const detectGoCardlessEnvironment = () => {
  const token = process.env.GOCARDLESS_ACCESS_TOKEN;
  const apiBase = process.env.GOCARDLESS_API_BASE;

  if (!token) return 'not-configured';

  if (token.startsWith('sandbox_')) return 'sandbox';
  if (token.startsWith('live_')) return 'live';

  // Fallback to API base detection
  if (apiBase?.includes('sandbox')) return 'sandbox';
  if (apiBase?.includes('api.gocardless.com')) return 'live';

  return 'unknown';
};

export async function GET(request: NextRequest) {
  try {
    // Only allow in development or with specific debug header
    const isDevelopment = process.env.NODE_ENV === 'development';
    const debugHeader = request.headers.get('x-debug-key');
    const isAuthorized = isDevelopment || debugHeader === process.env.DEBUG_API_KEY;

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Debug endpoint not available" },
        { status: 404 }
      );
    }

    const gcEnvironment = detectGoCardlessEnvironment();
    const baseUrl = process.env.NEXT_PUBLIC_PUBLIC_BASE_URL;

    const environmentInfo = {
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),

      // Firebase Configuration
      firebase: {
        projectId: checkEnvVar(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
        apiKey: checkEnvVar(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
        authDomain: checkEnvVar(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
        clientEmail: checkEnvVar(process.env.FIREBASE_CLIENT_EMAIL),
        privateKey: checkEnvVar(process.env.FIREBASE_PRIVATE_KEY),
      },

      // Payment Integrations
      payments: {
        stripe: {
          secretKey: checkEnvVar(process.env.STRIPE_SECRET_KEY, true),
          webhookSecret: checkEnvVar(process.env.STRIPE_WEBHOOK_SECRET),
          environment: process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ? 'test' :
                      process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'live' : 'unknown'
        },
        gocardless: {
          accessToken: checkEnvVar(process.env.GOCARDLESS_ACCESS_TOKEN, true),
          webhookSecret: checkEnvVar(process.env.GOCARDLESS_WEBHOOK_SECRET),
          apiBase: process.env.GOCARDLESS_API_BASE || 'not-set',
          environment: gcEnvironment,
          configured: gcEnvironment !== 'not-configured'
        }
      },

      // External APIs
      apis: {
        googlePlaces: checkEnvVar(process.env.GOOGLE_PLACES_API_KEY, true),
        openai: checkEnvVar(process.env.OPENAI_API_KEY, true),
      },

      // Deployment Information
      deployment: {
        vercel: !!process.env.VERCEL,
        vercelUrl: process.env.VERCEL_URL || 'not-set',
        vercelEnv: process.env.VERCEL_ENV || 'not-set',
        publicBaseUrl: baseUrl || 'not-set',
        baseUrlValid: baseUrl ? baseUrl.startsWith('https://') : false
      },

      // Environment Validation
      validation: {
        paymentEnvironmentMatch: (
          (gcEnvironment === 'sandbox' && process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) ||
          (gcEnvironment === 'live' && process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_'))
        ),
        webhookUrlsValid: baseUrl ? baseUrl.startsWith('https://') : false,
        criticalMissing: [
          !process.env.GOCARDLESS_ACCESS_TOKEN && 'GOCARDLESS_ACCESS_TOKEN',
          !process.env.GOCARDLESS_WEBHOOK_SECRET && 'GOCARDLESS_WEBHOOK_SECRET',
          !process.env.STRIPE_SECRET_KEY && 'STRIPE_SECRET_KEY',
          !process.env.NEXT_PUBLIC_PUBLIC_BASE_URL && 'NEXT_PUBLIC_PUBLIC_BASE_URL'
        ].filter(Boolean)
      }
    };

    return NextResponse.json({
      success: true,
      environment: environmentInfo,
      message: "Comprehensive environment debug information",
      recommendations: generateRecommendations(environmentInfo)
    });

  } catch (error) {
    console.error('[Debug Environment] Error:', error);
    return NextResponse.json(
      { error: "Failed to get environment info" },
      { status: 500 }
    );
  }
}

// Generate environment-specific recommendations
function generateRecommendations(env: any): string[] {
  const recommendations: string[] = [];

  if (env.validation.criticalMissing.length > 0) {
    recommendations.push(`Missing critical environment variables: ${env.validation.criticalMissing.join(', ')}`);
  }

  if (!env.validation.paymentEnvironmentMatch) {
    recommendations.push('Payment environment mismatch: Stripe and GoCardless should both be in same environment (test/sandbox or live)');
  }

  if (!env.validation.webhookUrlsValid) {
    recommendations.push('Base URL must be HTTPS for webhook endpoints to work properly');
  }

  if (env.payments.gocardless.environment === 'unknown') {
    recommendations.push('GoCardless environment detection failed - check token format and API base URL');
  }

  if (env.deployment.vercelEnv === 'preview' && env.payments.gocardless.environment === 'live') {
    recommendations.push('WARNING: Using live GoCardless tokens in Preview environment');
  }

  if (env.deployment.vercelEnv === 'production' && env.payments.gocardless.environment === 'sandbox') {
    recommendations.push('WARNING: Using sandbox GoCardless tokens in Production environment');
  }

  return recommendations;
}
