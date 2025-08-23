import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
      if (privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
      }

      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    }
  } catch (error) {
    console.error('[Health API] Firebase Admin initialization failed:', error);
  }
}

export async function GET() {
  try {
    const timestamp = new Date().toISOString();

    // Basic health check
    const health = {
      status: 'healthy',
      timestamp,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasFirebaseCredentials: !!(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY),
        firebaseProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      },
      services: {
        api: 'operational',
        database: 'checking...'
      }
    };

    // Quick Firebase connectivity test
    try {
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.NOCODEBACKEND_SECRET_KEY}`,
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(5000) // 5 second timeout
        }
      );

      health.services.database = testResponse.ok ? 'operational' : `error_${testResponse.status}`;
    } catch (dbError) {
      health.services.database = `error: ${dbError instanceof Error ? dbError.message : 'unknown'}`;
    }

    return NextResponse.json({
      success: true,
      ...health
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
