// API route: list/create QR codes (placeholder)
import { NextRequest, NextResponse } from "next/server";

interface QrCode {
  id: string;
  [key: string]: unknown;
}

const qrCodes: QrCode[] = [];

export async function GET() {
  return NextResponse.json(qrCodes);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const newQr = { ...data, id: Date.now().toString() };
  qrCodes.push(newQr);
  return NextResponse.json(newQr, { status: 201 });
}
