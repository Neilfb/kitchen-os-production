import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;
  
  // Demo mode response
  if (!process.env.NOCODEBACKEND_SECRET_KEY) {
    return NextResponse.json({
      id,
      event: "page_view",
      page: `/menu/${id}`,
      timestamp: new Date().toISOString(),
      userId: "anonymous-user",
      restaurantId: "demo-restaurant-1"
    });
  }
  
  try {
    const baseUrl = process.env.NOCODEBACKEND_BASE_URL || 'https://api.nocodebackend.com';
    const apiKey = process.env.NOCODEBACKEND_SECRET_KEY;
    const instanceId = '48346_allerq';

    // Use the new CRUD pattern: /read/analytics/{id}
    const response = await fetch(`${baseUrl}/read/analytics/${id}?Instance=${instanceId}`, {
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
    console.error(`Failed to fetch analytics for ID ${id}`, error);
    return NextResponse.json(
      { error: `Failed to fetch analytics for ID ${id}` },
      { status: 500 },
    );
  }
}
