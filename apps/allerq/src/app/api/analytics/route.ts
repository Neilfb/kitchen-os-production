// Analytics API endpoint
import { NextResponse } from "next/server";
import { createApiResponse } from "@/lib/api-utils";

// Handle CORS preflight requests
export async function OPTIONS() {
  // Get protection bypass secret from environment variable
  const protectionBypass = process.env.VERCEL_PROTECTION_BYPASS || '';
  
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
  
  return NextResponse.json(
    {},
    {
      status: 200,
      headers,
    }
  );
}

export async function GET() {
  // Demo mode response when DEMO_MODE is enabled or when no API keys are set
  if (process.env.DEMO_MODE === 'true' || !process.env.NOCODEBACKEND_SECRET_KEY) {
    return createApiResponse([
      {
        id: "demo-analytics-1",
        event: "page_view",
        page: "/menu/123",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        userId: "anonymous-1",
        restaurantId: "demo-restaurant-1"
      },
      {
        id: "demo-analytics-2",
        event: "menu_item_click",
        itemId: "dish-456",
        timestamp: new Date(Date.now() - 43200000).toISOString(),
        userId: "anonymous-2",
        restaurantId: "demo-restaurant-1"
      },
      {
        id: "demo-analytics-3",
        event: "page_view",
        page: "/menu/123",
        timestamp: new Date(Date.now() - 21600000).toISOString(),
        userId: "anonymous-3",
        restaurantId: "demo-restaurant-1"
      }
    ]);
  }

  try {
    const baseUrl = process.env.NOCODEBACKEND_BASE_URL || 'https://api.nocodebackend.com';
    const apiKey = process.env.NOCODEBACKEND_SECRET_KEY || 'demo-mode-key-for-vercel-deployment';
    const instanceId = '48346_allerq';

    // Use the new CRUD pattern: /read/analytics
    const response = await fetch(`${baseUrl}/read/analytics?Instance=${instanceId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch analytics: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch analytics", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
