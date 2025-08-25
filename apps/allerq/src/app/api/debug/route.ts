import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      status: 'API Working',
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEN_ENV,
        firebaseProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY ? 'Set' : 'Not Set',
      },
      message: 'API is working correctly'
    };

    return NextResponse.json(diagnostics);
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'API Error', 
        message: error.message 
      }, 
      { status: 500 }
    );
  }
}
