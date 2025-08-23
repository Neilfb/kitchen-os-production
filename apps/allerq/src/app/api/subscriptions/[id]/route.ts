// API route handlers for single subscription (GET, PUT, DELETE)
import { NextRequest, NextResponse } from "next/server";

// Note: This endpoint is deprecated and should be replaced with Firebase/Stripe subscription management

// Handle CORS preflight requests
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Accept, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    }
  );
}

// Get a single subscription by ID
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  // Demo mode response
  if (!process.env.NOCODEBACKEND_SECRET_KEY) {
    return NextResponse.json({
      id: id,
      status: "active",
      plan: id.includes("premium") ? "premium" : "standard",
      startDate: "2023-01-01",
      endDate: "2024-01-01",
      customerId: "demo-customer-1"
    });
  }

  try {
    const response = await fetch(`${BASE_URL}/subscriptions/${id}`, {
      headers: {
        "x-api-key": API_KEY
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Subscription not found" },
          { status: 404 }
        );
      }
      throw new Error(`Failed to fetch subscription: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

// Update a subscription
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  
  try {
    const body = await request.json();
    
    // Demo mode response
    if (!process.env.NOCODEBACKEND_SECRET_KEY) {
      return NextResponse.json({
        id: id,
        ...body,
        status: body.status || "active",
        updatedAt: new Date().toISOString()
      });
    }
    
    const response = await fetch(`${BASE_URL}/subscriptions/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Subscription not found" },
          { status: 404 }
        );
      }
      throw new Error(`Failed to update subscription: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}

// Delete a subscription
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  
  // Demo mode response
  if (!process.env.NOCODEBACKEND_SECRET_KEY) {
    return NextResponse.json({
      id: id,
      status: "deleted",
      deletedAt: new Date().toISOString()
    });
  }
  
  try {
    const response = await fetch(`${BASE_URL}/subscriptions/${id}`, {
      method: "DELETE",
      headers: {
        "x-api-key": API_KEY
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Subscription not found" },
          { status: 404 }
        );
      }
      throw new Error(`Failed to delete subscription: ${response.status}`);
    }
    
    // Some APIs return no content on DELETE
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return NextResponse.json(
      { error: "Failed to delete subscription" },
      { status: 500 }
    );
  }
}
