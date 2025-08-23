import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { serverMenuService } from "@/lib/services/serverMenuService";

// Initialize Firebase Admin SDK if not already initialized
let firebaseInitialized = false;
if (!getApps().length) {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      console.warn('[Menus API] Missing Firebase credentials - API will return 503');
      firebaseInitialized = false;
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
      console.log('[Menus API] Firebase Admin initialized');
      firebaseInitialized = true;
    }
  } catch (error) {
    console.error('[Menus API] Firebase Admin initialization failed:', error);
    firebaseInitialized = false;
  }
} else {
  firebaseInitialized = true;
}

async function verifyFirebaseToken(request: NextRequest): Promise<string | null> {
  try {
    // Check if Firebase is initialized
    if (!firebaseInitialized || !getApps().length) {
      console.error('[Menus API] Firebase Admin not initialized');
      return null;
    }

    const authHeader = request.headers.get('authorization');
    console.log('[Menus API] Auth header present:', !!authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[Menus API] No valid authorization header');
      return null;
    }

    const token = authHeader.substring(7);
    console.log('[Menus API] Token length:', token.length);

    const decodedToken = await getAuth().verifyIdToken(token);
    console.log('[Menus API] Token verified for user:', decodedToken.uid);
    return decodedToken.uid;
  } catch (error) {
    console.error('[Menus API] Token verification failed:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('[Menus API] GET request received - Firebase credentials configured');

    // Check if Firebase is initialized
    if (!firebaseInitialized) {
      return NextResponse.json(
        { success: false, error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    // Verify Firebase authentication
    const userId = await verifyFirebaseToken(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's menus
    const menus = await serverMenuService.getMenusByOwner(userId);

    return NextResponse.json({
      success: true,
      data: menus
    });
  } catch (error) {
    console.error("[Menus API] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch menus" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Menus API] POST request received - Firebase credentials configured');

    // Check if Firebase is initialized
    if (!firebaseInitialized) {
      return NextResponse.json(
        { success: false, error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    // Verify Firebase authentication
    const userId = await verifyFirebaseToken(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, restaurantId } = body;

    // Validate required fields
    if (!name || !restaurantId) {
      return NextResponse.json(
        { success: false, error: 'Name and restaurant ID are required' },
        { status: 400 }
      );
    }

    // Create menu
    const menu = await serverMenuService.createMenu(userId, {
      name: name.trim(),
      description: description?.trim() || '',
      restaurantId
    });

    return NextResponse.json({
      success: true,
      data: menu
    });
  } catch (error) {
    console.error("[Menus API] POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create menu" },
      { status: 500 }
    );
  }
}
