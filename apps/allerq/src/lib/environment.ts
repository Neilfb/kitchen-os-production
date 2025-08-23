/**
 * Environment Detection and Configuration Library
 * Provides safe environment-specific configuration for payment integrations
 */

export type PaymentEnvironment = 'sandbox' | 'live';
export type VercelEnvironment = 'development' | 'preview' | 'production';

export interface GoCardlessConfig {
  accessToken: string | undefined;
  webhookSecret: string | undefined;
  apiBase: string;
  environment: PaymentEnvironment;
}

export interface StripeConfig {
  secretKey: string | undefined;
  webhookSecret: string | undefined;
  environment: PaymentEnvironment;
}

export interface EnvironmentConfig {
  vercelEnv: VercelEnvironment;
  paymentEnv: PaymentEnvironment;
  gocardless: GoCardlessConfig;
  stripe: StripeConfig;
  baseUrl: string;
  isProduction: boolean;
  isDevelopment: boolean;
  isPreview: boolean;
}

/**
 * Detect the current Vercel environment
 */
export function getVercelEnvironment(): VercelEnvironment {
  const vercelEnv = process.env.VERCEL_ENV as VercelEnvironment;
  
  // Default to development if not set (local development)
  if (!vercelEnv) {
    return 'development';
  }
  
  return vercelEnv;
}

/**
 * Determine the payment environment based on Vercel environment
 */
export function getPaymentEnvironment(): PaymentEnvironment {
  const vercelEnv = getVercelEnvironment();
  
  // Use sandbox/test for development and preview
  if (vercelEnv === 'development' || vercelEnv === 'preview') {
    return 'sandbox';
  }
  
  // Use live for production
  if (vercelEnv === 'production') {
    return 'live';
  }
  
  // Default to sandbox for safety
  return 'sandbox';
}

/**
 * Get GoCardless configuration for current environment
 */
export function getGoCardlessConfig(): GoCardlessConfig {
  const paymentEnv = getPaymentEnvironment();
  
  if (paymentEnv === 'live') {
    return {
      accessToken: process.env.GOCARDLESS_ACCESS_TOKEN_LIVE || process.env.GOCARDLESS_ACCESS_TOKEN,
      webhookSecret: process.env.GOCARDLESS_WEBHOOK_SECRET_LIVE || process.env.GOCARDLESS_WEBHOOK_SECRET,
      apiBase: process.env.GOCARDLESS_API_BASE_LIVE || 'https://api.gocardless.com',
      environment: 'live'
    };
  }
  
  return {
    accessToken: process.env.GOCARDLESS_ACCESS_TOKEN_SANDBOX || process.env.GOCARDLESS_ACCESS_TOKEN,
    webhookSecret: process.env.GOCARDLESS_WEBHOOK_SECRET_SANDBOX || process.env.GOCARDLESS_WEBHOOK_SECRET,
    apiBase: process.env.GOCARDLESS_API_BASE_SANDBOX || process.env.GOCARDLESS_API_BASE || 'https://api-sandbox.gocardless.com',
    environment: 'sandbox'
  };
}

/**
 * Get Stripe configuration for current environment
 */
export function getStripeConfig(): StripeConfig {
  const paymentEnv = getPaymentEnvironment();
  
  if (paymentEnv === 'live') {
    return {
      secretKey: process.env.STRIPE_SECRET_KEY_LIVE || process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET_LIVE || process.env.STRIPE_WEBHOOK_SECRET,
      environment: 'live'
    };
  }
  
  return {
    secretKey: process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET_TEST || process.env.STRIPE_WEBHOOK_SECRET,
    environment: 'sandbox'
  };
}

/**
 * Get the base URL for the current environment
 */
export function getBaseUrl(): string {
  // Use explicit base URL if set
  if (process.env.NEXT_PUBLIC_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_PUBLIC_BASE_URL;
  }
  
  // Fallback to Vercel URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Local development fallback
  return 'http://localhost:3000';
}

/**
 * Get complete environment configuration
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const vercelEnv = getVercelEnvironment();
  const paymentEnv = getPaymentEnvironment();
  
  return {
    vercelEnv,
    paymentEnv,
    gocardless: getGoCardlessConfig(),
    stripe: getStripeConfig(),
    baseUrl: getBaseUrl(),
    isProduction: vercelEnv === 'production',
    isDevelopment: vercelEnv === 'development',
    isPreview: vercelEnv === 'preview'
  };
}

/**
 * Validate environment configuration
 */
export function validateEnvironment(): { valid: boolean; errors: string[]; warnings: string[] } {
  const config = getEnvironmentConfig();
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for missing critical variables
  if (!config.gocardless.accessToken) {
    errors.push(`Missing GoCardless access token for ${config.paymentEnv} environment`);
  }
  
  if (!config.gocardless.webhookSecret) {
    errors.push(`Missing GoCardless webhook secret for ${config.paymentEnv} environment`);
  }
  
  if (!config.stripe.secretKey) {
    errors.push(`Missing Stripe secret key for ${config.paymentEnv} environment`);
  }
  
  // Validate token formats match environment
  if (config.gocardless.accessToken) {
    if (config.paymentEnv === 'live' && !config.gocardless.accessToken.startsWith('live_')) {
      errors.push('Live environment requires live GoCardless token (starts with "live_")');
    }
    
    if (config.paymentEnv === 'sandbox' && !config.gocardless.accessToken.startsWith('sandbox_')) {
      warnings.push('Sandbox environment should use sandbox GoCardless token (starts with "sandbox_")');
    }
  }
  
  if (config.stripe.secretKey) {
    if (config.paymentEnv === 'live' && !config.stripe.secretKey.startsWith('sk_live_')) {
      errors.push('Live environment requires live Stripe key (starts with "sk_live_")');
    }
    
    if (config.paymentEnv === 'sandbox' && !config.stripe.secretKey.startsWith('sk_test_')) {
      warnings.push('Sandbox environment should use test Stripe key (starts with "sk_test_")');
    }
  }
  
  // Check base URL format
  if (!config.baseUrl.startsWith('http')) {
    errors.push('Base URL must start with http:// or https://');
  }
  
  if (config.isProduction && !config.baseUrl.startsWith('https://')) {
    errors.push('Production environment must use HTTPS base URL');
  }
  
  // Environment mismatch warnings
  if (config.vercelEnv === 'production' && config.paymentEnv === 'sandbox') {
    warnings.push('Production deployment using sandbox payment environment');
  }
  
  if ((config.vercelEnv === 'development' || config.vercelEnv === 'preview') && config.paymentEnv === 'live') {
    errors.push('Development/Preview environments should not use live payment credentials');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Log environment configuration (safe for production)
 */
export function logEnvironmentInfo(): void {
  const config = getEnvironmentConfig();
  const validation = validateEnvironment();
  
  console.log('[Environment] Configuration:', {
    vercelEnv: config.vercelEnv,
    paymentEnv: config.paymentEnv,
    baseUrl: config.baseUrl,
    gocardlessConfigured: !!config.gocardless.accessToken,
    stripeConfigured: !!config.stripe.secretKey,
    valid: validation.valid,
    errorCount: validation.errors.length,
    warningCount: validation.warnings.length
  });
  
  if (validation.errors.length > 0) {
    console.error('[Environment] Errors:', validation.errors);
  }
  
  if (validation.warnings.length > 0) {
    console.warn('[Environment] Warnings:', validation.warnings);
  }
}

/**
 * Throw error if environment is invalid (use in critical paths)
 */
export function requireValidEnvironment(): void {
  const validation = validateEnvironment();
  
  if (!validation.valid) {
    throw new Error(`Invalid environment configuration: ${validation.errors.join(', ')}`);
  }
}

/**
 * Check if we're in a safe environment for testing
 */
export function isSafeForTesting(): boolean {
  const config = getEnvironmentConfig();
  return config.paymentEnv === 'sandbox' && !config.isProduction;
}

/**
 * Get environment-appropriate webhook URLs
 */
export function getWebhookUrls() {
  const baseUrl = getBaseUrl();
  
  return {
    gocardless: `${baseUrl}/api/webhooks/gocardless`,
    stripe: `${baseUrl}/api/webhooks/stripe`
  };
}
