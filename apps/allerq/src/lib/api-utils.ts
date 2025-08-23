// Create a utility function to generate headers with protection bypass for API routes
import { NextResponse } from "next/server";

// Helper function to create consistent headers for API responses including the protection bypass
export function createApiResponse<T>(data: T, statusCode: number = 200) {
  // Get protection bypass secret from environment variable
  const protectionBypass = process.env.VERCEL_PROTECTION_BYPASS || '';
  
  // Create headers with CORS and auth bypass
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Accept, Authorization, x-vercel-protection-bypass',
    'x-middleware-skip-auth': '1',
    'x-middleware-bypass': '1',
  };
  
  // Add protection bypass header if available
  if (protectionBypass) {
    headers['x-vercel-protection-bypass'] = protectionBypass;
  }
  
  return NextResponse.json(data, {
    status: statusCode,
    headers
  });
}

// Helper function for OPTIONS responses
export function createOptionsResponse() {
  // Get protection bypass secret from environment variable
  const protectionBypass = process.env.VERCEL_PROTECTION_BYPASS || '';
  
  // Create headers with CORS and auth bypass
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Accept, Authorization, x-vercel-protection-bypass',
    'Access-Control-Max-Age': '86400',
    'x-middleware-skip-auth': '1',
    'x-middleware-bypass': '1',
  };
  
  // Add protection bypass header if available
  if (protectionBypass) {
    headers['x-vercel-protection-bypass'] = protectionBypass;
  }
  
  return NextResponse.json({}, {
    status: 200,
    headers
  });
}
