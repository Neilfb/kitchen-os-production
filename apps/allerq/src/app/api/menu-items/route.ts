// Menu Items API - Firebase Firestore Implementation
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
      console.error('[Menu Items API] Missing Firebase credentials');
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
      console.log('[Menu Items API] Firebase Admin initialized');
    }
  } catch (error) {
    console.error('[Menu Items API] Firebase Admin initialization failed:', error);
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
    console.error('[Menu Items Auth] Token verification failed:', error);
    return null;
  }
}

interface MenuItem {
  id: string;
  menuId: string;
  restaurantId: string;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  allergens?: string[];
  dietary?: string[];
  tags?: string[];
  image?: string;
  order?: number;
  isVisible?: boolean;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
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

// Get all menu items for authenticated user
export async function GET(request: NextRequest) {
  try {
    console.log('[Menu Items API] GET request - fetching menu items');

    // Verify Firebase authentication
    const userId = await verifyFirebaseToken(request);
    if (!userId) {
      console.error('[Menu Items API] Authentication failed - no valid token');
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log('[Menu Items API] User authenticated:', userId);

    const db = getFirestore();
    
    // Get all menu items for this user's restaurants
    const menuItemsRef = db.collection('menuItems');
    const query = menuItemsRef
      .where('ownerId', '==', userId)
      .where('isVisible', '==', true)
      .orderBy('createdAt', 'desc');

    const snapshot = await query.get();
    
    const menuItems: MenuItem[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      menuItems.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as MenuItem);
    });

    console.log(`[Menu Items API] Found ${menuItems.length} menu items for user`);
    
    // Group by menu for easier consumption
    const itemsByMenu = menuItems.reduce((acc, item) => {
      if (!acc[item.menuId]) {
        acc[item.menuId] = [];
      }
      acc[item.menuId].push(item);
      return acc;
    }, {} as Record<string, MenuItem[]>);

    return NextResponse.json({
      success: true,
      items: menuItems,
      itemsByMenu,
      totalCount: menuItems.length
    });

  } catch (error) {
    console.error("[Menu Items API] Error fetching menu items:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}
