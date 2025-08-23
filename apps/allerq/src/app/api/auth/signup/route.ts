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
      console.error('[Signup API] Missing Firebase credentials');
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
      console.log('[Signup API] Firebase Admin initialized');
    }
  } catch (error) {
    console.error('[Signup API] Firebase Admin initialization failed:', error);
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
    console.log('[Signup API] Processing signup request');

    const body = await request.json();
    const { email, password, name } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Create user in Firebase Auth
    try {
      console.log('[Signup API] Creating Firebase user for:', email);
      
      const userRecord = await getAuth().createUser({
        email: email.toLowerCase().trim(),
        password,
        displayName: name || email.split('@')[0],
        emailVerified: false
      });

      console.log('[Signup API] ✅ Firebase user created:', userRecord.uid);

      // Create user profile in Firestore
      const db = getFirestore();
      const userProfile = {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || name || email.split('@')[0],
        role: 'admin', // Default role for Stage-1 MVP (restaurant admin)
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };

      await db.collection('users').doc(userRecord.uid).set(userProfile);
      console.log('[Signup API] ✅ User profile created in Firestore');

      // Generate custom token for immediate login
      const customToken = await getAuth().createCustomToken(userRecord.uid);

      return NextResponse.json({
        success: true,
        message: "Account created successfully",
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          role: 'admin'
        },
        customToken
      });

    } catch (firebaseError: any) {
      console.error('[Signup API] Firebase user creation failed:', firebaseError);
      
      // Handle specific Firebase errors
      if (firebaseError.code === 'auth/email-already-exists') {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 }
        );
      }
      
      if (firebaseError.code === 'auth/invalid-email') {
        return NextResponse.json(
          { error: "Invalid email address" },
          { status: 400 }
        );
      }
      
      if (firebaseError.code === 'auth/weak-password') {
        return NextResponse.json(
          { error: "Password is too weak" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Failed to create account. Please try again." },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('[Signup API] Unexpected error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
