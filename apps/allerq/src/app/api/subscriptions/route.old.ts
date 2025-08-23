// API route: handle subscriptions
import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NOCODEBACKEND_BASE_URL || 'https://api.nocodebackend.com/api';
const API_KEY = process.env.NOCODEBACKEND_SECRET_KEY || 'demo-mode-key-for-vercel-deployment';

export async function GET() {
  // Demo mode response when no API keys are set
  if (!process.env.NOCODEBACKEND_SECRET_KEY) {
    return NextResponse.json([
      {
        id: "demo-subscription-1",
        status: "active",
        plan: "premium",
        startDate: "2023-01-01",
        endDate: "2024-01-01",
        customerId: "demo-customer-1"
      },
      {
        id: "demo-subscription-2",
        status: "pending",
        plan: "standard",
        startDate: "2023-02-15",
        endDate: "2024-02-15",
        customerId: "demo-customer-2"
      }
    ]);
  }
  
  try {
    const response = await fetch(`${BASE_URL}/subscriptions`, {
      headers: {
        "x-api-key": API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch subscriptions: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

// Create a new subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Demo mode response
    if (!process.env.NOCODEBACKEND_SECRET_KEY) {
      return NextResponse.json({
        id: `demo-subscription-${Date.now()}`,
        ...body,
        status: "active",
        createdAt: new Date().toISOString()
      });
    }
    
    const response = await fetch(`${BASE_URL}/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create subscription: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
