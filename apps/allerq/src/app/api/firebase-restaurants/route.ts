import { NextRequest, NextResponse } from "next/server";
import { serverRestaurantService } from "@/lib/services/serverRestaurantService";
import { auth } from "@/lib/firebase/config";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps, cert } from "firebase-admin/app";

// Initialize Firebase Admin SDK for server-side token verification
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('[Firebase Admin] Initialization failed:', error);
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
    console.error('[Firebase Auth] Token verification failed:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('[Firebase Restaurants API] GET request received');
    
    // Verify Firebase authentication
    const userId = await verifyFirebaseToken(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get restaurants for the authenticated user
    const restaurants = await serverRestaurantService.getRestaurantsByOwner(userId);
    
    return NextResponse.json({
      success: true,
      data: restaurants,
      count: restaurants.length
    });
    
  } catch (error) {
    console.error('[Firebase Restaurants API] GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch restaurants' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Firebase Restaurants API] POST request received');
    
    // Verify Firebase authentication
    const userId = await verifyFirebaseToken(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    console.log('[Firebase Restaurants API] Request body:', body);

    // Validate required fields
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Restaurant name is required' },
        { status: 400 }
      );
    }

    // Create restaurant
    const restaurant = await serverRestaurantService.createRestaurant(userId, body);
    
    return NextResponse.json({
      success: true,
      data: restaurant
    });
    
  } catch (error) {
    console.error('[Firebase Restaurants API] POST error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create restaurant' 
      },
      { status: 500 }
    );
  }
}
