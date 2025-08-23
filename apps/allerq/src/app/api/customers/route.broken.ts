// Customers CRUD API handlers
import { NextRequest, NextResponse } from "next/server";
// Legacy NoCodeBackend removed - using Firebase implementation

interface Customer {
  id: string;
  name: string;
  email: string;
  // ...add more fields as needed
}

export async function GET() {
  try {
    const data = await // TODO: Implement Firebase equivalent
      "/customers",
      { method: "GET" }
    );
    if (!data || !Array.isArray(data.items)) {
      console.error("Invalid data from backend in GET /customers", data);
      return NextResponse.json(
        { error: "Invalid data from backend" },
        { status: 500 },
      );
    }
    return NextResponse.json({ customers: data.items });
  } catch (err) {
    console.error("Error in GET /customers:", err);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const input = await req.json();
    if (!input || typeof input !== "object" || !input.name || !input.email) {
      return NextResponse.json(
        { error: "Missing required fields: name and email" },
        { status: 400 },
      );
    }
    const customer = await // TODO: Implement Firebase equivalent
      "/customers",
      {
        method: "POST",
        body: JSON.stringify(input),
      }
    );
    return NextResponse.json({ customer });
  } catch (err) {
    console.error("Error in POST /customers:", err);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 },
    );
  }
}
