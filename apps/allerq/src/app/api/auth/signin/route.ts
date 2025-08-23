import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps, cert } from "firebase-admin/app";

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      console.error('[Signin API] Missing Firebase credentials');
    } else {
      // Handle private key formatting
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
      console.log('[Signin API] Firebase Admin initialized');
    }
  } catch (error) {
    console.error('[Signin API] Firebase Admin initialization failed:', error);
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Accept, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Signin API] Processing signin request');

    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    try {
      console.log('[Signin API] Attempting Firebase signin for:', email);
      
      // Note: Firebase Admin SDK doesn't have a direct signin method
      // We need to verify the user exists and return a custom token
      // The actual authentication happens on the client side
      
      // Get user by email to verify they exist
      const userRecord = await getAuth().getUserByEmail(email.toLowerCase().trim());
      console.log('[Signin API] ✅ User found in Firebase:', userRecord.uid);

      // Get user profile from Firestore
      const db = getFirestore();
      const userDoc = await db.collection('users').doc(userRecord.uid).get();
      
      let userProfile = null;
      if (userDoc.exists) {
        userProfile = userDoc.data();
        console.log('[Signin API] ✅ User profile found in Firestore');
      } else {
        // Create user profile if it doesn't exist
        userProfile = {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName || email.split('@')[0],
          role: 'admin', // Default role for Stage-1 MVP
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        };
        
        await db.collection('users').doc(userRecord.uid).set(userProfile);
        console.log('[Signin API] ✅ User profile created in Firestore');
      }

      // Generate custom token for client-side authentication
      const customToken = await getAuth().createCustomToken(userRecord.uid);

      return NextResponse.json({
        success: true,
        message: "Signin successful",
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName || userProfile.displayName,
          role: userProfile.role || 'restaurant_admin'
        },
        customToken
      });

    } catch (firebaseError: any) {
      console.error('[Signin API] Firebase signin failed:', firebaseError);
      
      // Handle specific Firebase errors
      if (firebaseError.code === 'auth/user-not-found') {
        return NextResponse.json(
          { error: "No account found with this email address" },
          { status: 404 }
        );
      }
      
      if (firebaseError.code === 'auth/invalid-email') {
        return NextResponse.json(
          { error: "Invalid email address" },
          { status: 400 }
        );
      }
      
      if (firebaseError.code === 'auth/user-disabled') {
        return NextResponse.json(
          { error: "This account has been disabled" },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('[Signin API] Unexpected error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
