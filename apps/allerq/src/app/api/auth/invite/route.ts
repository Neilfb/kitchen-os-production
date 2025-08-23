import { NextRequest, NextResponse } from "next/server";

// Note: This endpoint is deprecated and should be replaced with Firebase Auth invitations

export async function POST(req: NextRequest) {
  try {
    const { email, role } = await req.json();
    
    // Check if we're in demo mode (no API key)
    if (!process.env.NOCODEBACKEND_SECRET_KEY) {
      // Return mock successful response for demo purposes
      return NextResponse.json({
        success: true,
        message: `Invitation sent to ${email} in demo mode`,
        invite: {
          id: "demo-invite-id",
          email: email,
          role: role,
          status: "pending"
        }
      });
    }
    
    const response = await fetch(`${BASE_URL}/auth/invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({ email, role }),
    });
    if (!response.ok) throw new Error("Invite failed");
    const result = await response.json();
    return NextResponse.json({ success: true, inviteUrl: result.inviteUrl });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : "Invite failed",
      },
      { status: 400 },
    );
  }
}
