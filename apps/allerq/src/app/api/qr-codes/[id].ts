// API route: update/delete QR codes (placeholder)
import { NextRequest, NextResponse } from "next/server";

interface QrCode {
  id: string;
  [key: string]: unknown;
}

const qrCodes: QrCode[] = [];

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } },
) {
  const idx = qrCodes.findIndex((q) => q.id === context.params.id);
  if (idx === -1)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const data = await req.json();
  qrCodes[idx] = { ...qrCodes[idx], ...data };
  return NextResponse.json(qrCodes[idx]);
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } },
) {
  const idx = qrCodes.findIndex((q) => q.id === context.params.id);
  if (idx === -1)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const deleted = qrCodes.splice(idx, 1);
  return NextResponse.json(deleted[0]);
}
