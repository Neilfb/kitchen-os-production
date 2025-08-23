import { NextRequest, NextResponse } from "next/server";

interface AnalyticsEvent {
  restaurant_id?: number;
  menu_id?: number;
  event_type: string;
  timestamp?: number;
  user_agent?: string;
  ip_addresss?: string; // Note: API has typo "ip_addresss"
  referrer?: string;
  metadata?: string;
  created_at?: number;
}

interface AnalyticsResponse {
  status: string;
  message: string;
  id: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyticsEvent = await request.json();

    // Demo mode response
    if (!process.env.NOCODEBACKEND_SECRET_KEY) {
      console.log('[Demo Mode] Analytics event received:', body);
      return NextResponse.json({
        status: "success",
        message: "Record created successfully (demo mode)",
        id: Math.floor(Math.random() * 1000)
      });
    }

    const baseUrl = process.env.NOCODEBACKEND_BASE_URL || 'https://api.nocodebackend.com';
    const apiKey = process.env.NOCODEBACKEND_SECRET_KEY;
    const instanceId = '48346_allerq';

    // Get client IP address
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown";

    // Prepare the analytics payload
    const analyticsPayload: AnalyticsEvent = {
      restaurant_id: body.restaurant_id || 0,
      menu_id: body.menu_id || 0,
      event_type: body.event_type,
      timestamp: body.timestamp || Date.now(),
      user_agent: body.user_agent || request.headers.get("user-agent") || "unknown",
      ip_addresss: ip, // Note: keeping the typo as per API spec
      referrer: body.referrer || request.headers.get("referer") || "",
      metadata: body.metadata || "",
      created_at: body.created_at || Date.now(),
    };

    console.log('Sending analytics event to NoCodeBackend:', analyticsPayload);

    // Send to NoCodeBackend using the /create/analytics endpoint
    const response = await fetch(`${baseUrl}/create/analytics?Instance=${instanceId}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(analyticsPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`NoCodeBackend API error: ${response.status} ${response.statusText} - ${errorText}`);
      throw new Error(`Failed to create analytics record: ${response.status}`);
    }

    const data: AnalyticsResponse = await response.json();
    console.log('Analytics event successfully created:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to track analytics event:", error);
    return NextResponse.json(
      { 
        status: "error",
        message: "Failed to track analytics event",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
