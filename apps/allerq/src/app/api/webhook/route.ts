// API route: Stripe/GoCardless webhook handler 
import { NextRequest, NextResponse } from "next/server";

// Handle CORS preflight requests
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Accept, Authorization, stripe-signature',
        'Access-Control-Max-Age': '86400',
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Demo mode response or real webhook handling
    if (!process.env.STRIPE_SECRET_KEY) {
      console.log("Received webhook in demo mode:", JSON.stringify(body).slice(0, 100) + "...");
      return NextResponse.json({ received: true, mode: "demo" });
    }
    
    // For real implementation, validate Stripe signature
    // const signature = request.headers.get("stripe-signature");
    // if (!signature) {
    //   return NextResponse.json({ error: "Missing stripe signature" }, { status: 400 });
    // }
    
    // In real implementation, handle different event types
    console.log("Processing webhook event:", body.type || "unknown-event");
    
    // Success response
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
