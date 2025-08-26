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
      console.error('[Verify API] Missing Firebase credentials');
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
      console.log('[Verify API] Firebase Admin initialized');
    }
  } catch (error) {
    console.error('[Verify API] Firebase Admin initialization failed:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Verify API] Processing verify request');

    // Get the ID token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const idToken = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      // Verify the ID token
      const decodedToken = await getAuth().verifyIdToken(idToken);
      const uid = decodedToken.uid;

      console.log('[Verify API] ✅ Token verified for user:', uid);

      // Get user profile from Firestore
      const db = getFirestore();
      const userDoc = await db.collection('users').doc(uid).get();
      
      let userProfile = null;
      if (userDoc.exists) {
        userProfile = userDoc.data();
        console.log('[Verify API] ✅ User profile found in Firestore');
      } else {
        // Create user profile if it doesn't exist
        const userRecord = await getAuth().getUser(uid);
        userProfile = {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName || userRecord.email?.split('@')[0],
          role: 'admin', // Default role for Stage-1 MVP
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        };
        
        await db.collection('users').doc(uid).set(userProfile);
        console.log('[Verify API] ✅ User profile created in Firestore');
      }

      // Generate custom token for API authentication
      const customToken = await getAuth().createCustomToken(uid);

      return NextResponse.json({
        success: true,
        message: "User verified successfully",
        user: {
          uid: uid,
          email: userProfile.email,
          displayName: userProfile.displayName,
          role: userProfile.role || 'admin'
        },
        customToken
      });

    } catch (firebaseError: any) {
      console.error('[Verify API] Token verification failed:', firebaseError);
      
      if (firebaseError.code === 'auth/id-token-expired') {
        return NextResponse.json(
          { error: "Session expired. Please sign in again." },
          { status: 401 }
        );
      }
      
      if (firebaseError.code === 'auth/id-token-revoked') {
        return NextResponse.json(
          { error: "Session revoked. Please sign in again." },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: "Invalid session. Please sign in again." },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('[Verify API] Unexpected error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
