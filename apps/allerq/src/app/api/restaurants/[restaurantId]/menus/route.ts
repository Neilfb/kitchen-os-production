// Restaurant-specific menu management API
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { serverRestaurantService } from "@/lib/services/serverRestaurantService";
import { firebaseMenuService, CreateMenuInput } from "@/lib/services/firebaseMenuService";
import { EnhancedMenu } from "@/lib/types/menu";

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      console.error('[Firebase Admin] Missing credentials:', {
        projectId: !!projectId,
        clientEmail: !!clientEmail,
        privateKey: !!privateKey
      });
      throw new Error('Missing Firebase Admin credentials');
    }

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

    console.log('[Firebase Admin] Initialized successfully for menu API');
  } catch (error) {
    console.error('[Firebase Admin] Initialization failed:', error);
  }
}

async function verifyFirebaseToken(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[Auth] No authorization header found');
      return null;
    }

    const token = authHeader.substring(7);
    console.log('[Auth] Attempting to verify Firebase token...');

    const decodedToken = await getAuth().verifyIdToken(token);
    console.log('[Auth] Token verified successfully for user:', decodedToken.uid);
    return decodedToken.uid;
  } catch (error) {
    console.error('[Auth] Token verification failed:', error);
    return null;
  }
}



// GET /api/restaurants/[restaurantId]/menus - Get all menus for a restaurant
export async function GET(
  req: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    console.log(`[Restaurant Menus] GET request for restaurant: ${params.restaurantId}`);

    // Log request headers for debugging
    const authHeader = req.headers.get('authorization');
    console.log('[Restaurant Menus] Authorization header present:', !!authHeader);
    console.log('[Restaurant Menus] Authorization header format:', authHeader?.substring(0, 20) + '...');

    // Verify Firebase authentication
    const userId = await verifyFirebaseToken(req);
    if (!userId) {
      console.log('[Restaurant Menus] Authentication failed - no user ID');
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log('[Restaurant Menus] Authentication successful for user:', userId);

    // Verify restaurant ownership
    console.log('[Restaurant Menus] Verifying restaurant ownership for user:', userId, 'restaurant:', params.restaurantId);
    const restaurant = await serverRestaurantService.getRestaurant(params.restaurantId, userId);
    if (!restaurant) {
      console.warn('[Restaurant Menus] Restaurant ownership verification failed:', {
        restaurantId: params.restaurantId,
        userId: userId,
        userIdType: typeof userId
      });
      return NextResponse.json(
        { error: "Restaurant not found or access denied" },
        { status: 404 }
      );
    }
    console.log('[Restaurant Menus] ✅ Restaurant ownership verified for:', restaurant.name);

    // Get menus for this restaurant
    const menus = await firebaseMenuService.getRestaurantMenus(params.restaurantId, userId);

    return NextResponse.json({
      success: true,
      menus,
    });

  } catch (error) {
    console.error('[Restaurant Menus] GET error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/restaurants/[restaurantId]/menus - Create new menu
export async function POST(
  req: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    console.log(`[Restaurant Menus] POST request for restaurant: ${params.restaurantId}`);

    // Verify Firebase authentication
    const userId = await verifyFirebaseToken(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify restaurant ownership
    const restaurant = await serverRestaurantService.getRestaurant(params.restaurantId, userId);
    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found or access denied" },
        { status: 404 }
      );
    }

    // Parse input
    const body = await req.json();

    // Validate required fields
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return NextResponse.json(
        { error: "Menu name is required" },
        { status: 400 }
      );
    }

    // Determine region based on restaurant location (default to EU)
    const region = restaurant.location?.country === 'US' ? 'US' :
                   restaurant.location?.country === 'CA' ? 'CA' : 'EU';

    // Create menu input
    const menuInput: CreateMenuInput = {
      name: body.name.trim(),
      description: body.description || '',
      restaurantId: params.restaurantId,
      region: body.region || region,
      status: body.status || 'draft',
    };

    // Create menu using Firebase service
    const menu = await firebaseMenuService.createMenu(userId, menuInput);

    console.log(`[Restaurant Menus] Created menu: ${menu.name} (${menu.id}) for restaurant: ${params.restaurantId}`);

    return NextResponse.json({
      success: true,
      menu,
      message: `Menu "${menu.name}" created successfully`,
    });

  } catch (error) {
    console.error("[Restaurant Menus] Error:", error);
    return NextResponse.json(
      { error: "Failed to create menu" },
      { status: 500 }
    );
  }
}
