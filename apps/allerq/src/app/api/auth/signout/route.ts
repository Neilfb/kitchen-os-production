import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log('[SIGNOUT] Processing signout request');

    // Create response with cleared cookies
    const response = NextResponse.json({
      success: true,
      message: "Successfully signed out"
    });

    // Clear the authentication cookie
    response.cookies.set('token', '', {
      httpOnly: false, // Allow client-side access for localStorage sync
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0) // Expire immediately
    });

    console.log('[SIGNOUT] Signout completed successfully');
    return response;

  } catch (error) {
    console.error('[SIGNOUT] Error during signout:', error);
    return NextResponse.json(
      {
        success: false,
        error: "Signout failed"
      },
      { status: 500 }
    );
  }
}

// Also support GET for simple logout links
export async function GET(request: NextRequest) {
  return POST(request);
}
