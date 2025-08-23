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
        database: 'checking...',
        firestore: 'checking...'
      }
    };

    // Quick Firebase connectivity test
    try {
      const db = getFirestore();
      
      // Test Firebase connectivity by checking if we can access collections
      const testCollection = await db.collection('restaurants').limit(1).get();
      
      health.services.database = 'operational';
      health.services.firestore = 'operational';
      
    } catch (dbError) {
      console.error('Firebase connectivity test failed:', dbError);
      health.services.database = 'error';
      health.services.firestore = 'error';
      health.status = 'degraded';
    }

    return NextResponse.json({
      success: true,
      ...health
    });
    
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      success: false,
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
