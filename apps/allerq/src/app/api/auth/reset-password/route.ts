import { NextRequest, NextResponse } from "next/server";

// Note: This endpoint is deprecated and should be replaced with Firebase Auth password reset

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    // Check if we're in demo mode (no API key)
    if (!process.env.NOCODEBACKEND_SECRET_KEY) {
      // Return mock successful response for demo purposes
      return NextResponse.json({
        success: true,
        message: "Password reset email sent successfully"
      });
    }
    
    // Input validation
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      throw new Error('Invalid email address');
    }
    
    // Request password reset from backend
    const response = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) throw new Error("Failed to initiate password reset");
    
    return NextResponse.json({
      success: true,
      message: "Password reset email sent successfully"
    });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : "Failed to initiate password reset",
      },
      { status: 400 },
    );
  }
}
