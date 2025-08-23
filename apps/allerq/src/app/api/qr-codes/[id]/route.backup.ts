// GET, PUT, DELETE individual QR codes
import { NextRequest, NextResponse } from "next/server";
import { noCodeBackendFetch } from "@/lib/noCodeBackendFetch";

interface QrCode {
  id: string;
  // ...add more fields as needed
}

// Helper to extract qrCodeId from the URL
function getQrCodeIdFromUrl(req: NextRequest): string | null {
  const url = req.nextUrl;
  // /api/qr-codes/[id]
  const segments = url.pathname.split("/");
  const idx = segments.indexOf("qr-codes");
  if (idx !== -1 && segments.length > idx + 1) {
    return segments[idx + 1];
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const qrCodeId = getQrCodeIdFromUrl(req);
    if (!qrCodeId) {
      return NextResponse.json({ error: "Missing QR code id" }, { status: 400 });
    }
    const qrCode = await noCodeBackendFetch<QrCode>(
      `/qrCodes/${qrCodeId}`,
      { method: "GET" }
    );
    return NextResponse.json({ qrCode });
  } catch (error) {
    console.error("QR code not found", error);
    return NextResponse.json({ error: "QR code not found" }, { status: 404 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const qrCodeId = getQrCodeIdFromUrl(req);
    if (!qrCodeId) {
      return NextResponse.json({ error: "Missing QR code id" }, { status: 400 });
    }
    const input = await req.json();
    const qrCode = await noCodeBackendFetch<QrCode>(
      `/qrCodes/${qrCodeId}`,
      {
        method: "PUT",
        body: JSON.stringify(input),
      }
    );
    return NextResponse.json({ qrCode });
  } catch (error) {
    console.error("Failed to update QR code", error);
    return NextResponse.json(
      { error: "Failed to update QR code" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const qrCodeId = getQrCodeIdFromUrl(req);
    if (!qrCodeId) {
      return NextResponse.json({ error: "Missing QR code id" }, { status: 400 });
    }
    await noCodeBackendFetch<null>(
      `/qrCodes/${qrCodeId}`,
      { method: "DELETE" }
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete QR code", error);
    return NextResponse.json(
      { error: "Failed to delete QR code" },
      { status: 500 },
    );
  }
}
