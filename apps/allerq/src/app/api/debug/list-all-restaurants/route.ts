// Debug endpoint to list all restaurants in Firestore
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { serverRestaurantService } from "@/lib/services/serverRestaurantService";
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already done
function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    return;
  }

  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(`Missing Firebase credentials`);
    }

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
  } catch (error) {
    console.error('Firebase Admin initialization failed:', error);
    throw error;
  }
}

async function verifyFirebaseToken(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.substring(7);
    const decodedToken = await getAuth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error('[Debug Auth] Token verification failed:', error);
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    console.log('[Debug] Starting list all restaurants debug');

    // Verify Firebase authentication
    const userId = await verifyFirebaseToken(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log('[Debug] Authenticated user ID:', userId);

    // Initialize Firebase Admin
    initializeFirebaseAdmin();
    const db = getFirestore();

    // Get all restaurants from Firestore
    const restaurantsRef = db.collection('restaurants');
    const snapshot = await restaurantsRef.get();

    const allRestaurants = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      allRestaurants.push({
        id: doc.id,
        name: data.name,
        ownerId: data.ownerId,
        ownerIdType: typeof data.ownerId,
        isActive: data.isActive,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || 'No timestamp',
        ownerIdMatches: data.ownerId === userId
      });
    });

    console.log('[Debug] Found restaurants:', allRestaurants.length);

    // Also get restaurants using the service
    const userRestaurants = await serverRestaurantService.getRestaurantsByOwner(userId);

    return NextResponse.json({
      success: true,
      debug: {
        authenticatedUserId: userId,
        userIdType: typeof userId,
        totalRestaurantsInDatabase: allRestaurants.length,
        userRestaurantsFromService: userRestaurants.length,
        allRestaurants: allRestaurants,
        userRestaurants: userRestaurants.map(r => ({
          id: r.id,
          name: r.name,
          ownerId: r.ownerId,
          ownerIdType: typeof r.ownerId
        }))
      }
    });

  } catch (error) {
    console.error('[Debug] Error:', error);
    return NextResponse.json(
      { 
        error: "Debug failed",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
