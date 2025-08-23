import { NextRequest, NextResponse } from "next/server";

// Note: This endpoint is deprecated and should be replaced with Firebase Auth password reset

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    
    // Check if we're in demo mode (no API key)
    if (!process.env.NOCODEBACKEND_SECRET_KEY) {
      // Return mock successful response for demo purposes
      return NextResponse.json({
        success: true,
        message: "Password reset successful"
      });
    }
    
    // Input validation
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid reset token');
    }
    
    if (!password || typeof password !== 'string' || password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    
    // Request password reset from backend
    const response = await fetch(`${BASE_URL}/auth/complete-reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({ token, password }),
    });
    
    if (!response.ok) throw new Error("Failed to reset password");
    
    return NextResponse.json({
      success: true,
      message: "Password reset successful"
    });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : "Failed to reset password",
      },
      { status: 400 },
    );
  }
}
