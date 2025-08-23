import { NextRequest, NextResponse } from "next/server";

interface Customer {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export async function GET() {
  try {
    // TODO: Implement Firebase-based super admin customer management
    return NextResponse.json({
      success: true,
      message: "Super admin customers endpoint migrated from NoCodeBackend - Firebase implementation pending",
      customers: []
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Super admin customers endpoint temporarily unavailable" },
      { status: 503 }
    );
  }
}
