// API route for QR codes (placeholder)
import { NextResponse } from "next/server";

export async function POST() {
  // TODO: Generate and return QR code data
  return NextResponse.json({ success: true });
}

export async function GET() {
  // TODO: Return list of generated QR codes
  return NextResponse.json([]);
}
