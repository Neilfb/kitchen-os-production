// Single customer CRUD API handlers
import { NextRequest, NextResponse } from "next/server";

interface Customer {
  id: string;
  name: string;
  email: string;
  // ...add more fields as needed
}

// Helper to extract customerId from the URL
function getCustomerIdFromUrl(req: NextRequest): string | null {
  const url = req.nextUrl;
  // /api/customers/[customerId]
  const segments = url.pathname.split("/");
  const idx = segments.indexOf("customers");
  if (idx !== -1 && segments.length > idx + 1) {
    return segments[idx + 1];
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const customerId = getCustomerIdFromUrl(req);
    if (!customerId) {
      return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
    }
    const customer = await // TODO: Implement Firebase equivalent
      `/customers/${customerId}`,
      { method: "GET" }
    );
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    return NextResponse.json({ customer });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error in GET /customers/[customerId]:", err.message, err.stack);
    } else {
      console.error("Unknown error in GET /customers/[customerId]:", err);
    }
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const customerId = getCustomerIdFromUrl(req);
    if (!customerId) {
      return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
    }
    const input = await req.json();
    // Input validation: must be object, and at least one of name or email must be a non-empty string
    if (
      !input ||
      typeof input !== "object" ||
      (typeof input.name !== "string" || input.name.trim() === "") &&
      (typeof input.email !== "string" || input.email.trim() === "")
    ) {
      return NextResponse.json(
        { error: "Missing or invalid fields to update (name or email)" },
        { status: 400 },
      );
    }
    const customer = await // TODO: Implement Firebase equivalent
      `/customers/${customerId}`,
      {
        method: "PUT",
        body: JSON.stringify(input),
      }
    );
    return NextResponse.json({ customer });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error in PUT /customers/[customerId]:", err.message, err.stack);
    } else {
      console.error("Unknown error in PUT /customers/[customerId]:", err);
    }
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const customerId = getCustomerIdFromUrl(req);
    if (!customerId) {
      return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
    }
    await // TODO: Implement Firebase equivalent
      `/customers/${customerId}`,
      { method: "DELETE" }
    );
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error in DELETE /customers/[customerId]:", err.message, err.stack);
    } else {
      console.error("Unknown error in DELETE /customers/[customerId]:", err);
    }
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 },
    );
  }
}
