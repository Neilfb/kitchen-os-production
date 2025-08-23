// Backend health check endpoint - Firebase Admin SDK Implementation
import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps, cert } from "firebase-admin/app";

// Initialize Firebase Admin SDK
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('[Health Check] Firebase Admin initialized successfully');
  } catch (error) {
    console.error('[Health Check] Firebase Admin initialization failed:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('[Health Check] Testing Firebase Admin Firestore connectivity...');

    // Test Firestore connectivity by attempting to read from a collection
    const adminDb = getFirestore();
    const testCollection = adminDb.collection('health');
    await testCollection.limit(1).get();

    console.log('[Health Check] Firebase Admin Firestore is healthy');
    return NextResponse.json({
      success: true,
      status: 'healthy',
      backend: 'firebase-admin-firestore',
      timestamp: new Date().toISOString(),
      message: 'Firebase Admin Firestore services are operational'
    });

  } catch (error) {
    console.error('[Health Check] Firebase Admin Firestore health check failed:', error);

    return NextResponse.json({
      success: false,
      status: 'error',
      backend: 'firebase-admin-firestore-error',
      timestamp: new Date().toISOString(),
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      error: error instanceof Error ? error.message : 'Firebase Admin Firestore connectivity test failed'
    }, { status: 503 });
  }
}
