import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware';
import { locales } from './i18n';

// Get protection bypass secret from environment variable
const PROTECTION_BYPASS_SECRET = process.env.VERCEL_PROTECTION_BYPASS || '';

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always'
});

// This middleware handles all routes
export function middleware(request: NextRequest) {
  // Skip i18n for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next();

    // Set CORS headers for API routes
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Authorization, x-vercel-protection-bypass');

    // Add protection bypass headers
    response.headers.set('x-middleware-skip-auth', '1');
    response.headers.set('x-middleware-bypass', '1');

    if (PROTECTION_BYPASS_SECRET) {
      response.headers.set('x-vercel-protection-bypass', PROTECTION_BYPASS_SECRET);
    }

    return response;
  }

  // Handle internationalization for non-API routes
  const response = intlMiddleware(request);

  // Add protection bypass headers to i18n response
  response.headers.set('x-middleware-skip-auth', '1');
  response.headers.set('x-middleware-bypass', '1');

  if (PROTECTION_BYPASS_SECRET) {
    response.headers.set('x-vercel-protection-bypass', PROTECTION_BYPASS_SECRET);
  }

  return response;
}

export const config = {
  // Match only internationalized pathnames and API routes
  // Remove '/' to prevent conflict with root layout
  matcher: ['/(en|es)/:path*', '/api/:path*']
}
