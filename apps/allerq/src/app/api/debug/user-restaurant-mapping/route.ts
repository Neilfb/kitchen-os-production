// Debug endpoint to understand user-restaurant mapping
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { serverRestaurantService } from "@/lib/services/serverRestaurantService";

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
    console.log('[Debug] Starting user-restaurant mapping debug');

    // Verify Firebase authentication
    const userId = await verifyFirebaseToken(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log('[Debug] Authenticated user ID:', userId, 'type:', typeof userId);

    // Get all restaurants for this user
    const restaurants = await serverRestaurantService.getRestaurantsByOwner(userId);
    
    console.log('[Debug] Found restaurants:', restaurants.length);

    // Get URL parameters for specific restaurant check
    const url = new URL(req.url);
    const restaurantId = url.searchParams.get('restaurantId');

    let specificRestaurant = null;
    if (restaurantId) {
      console.log('[Debug] Checking specific restaurant:', restaurantId);
      specificRestaurant = await serverRestaurantService.getRestaurant(restaurantId, userId);
      console.log('[Debug] Specific restaurant result:', !!specificRestaurant);
    }

    return NextResponse.json({
      success: true,
      debug: {
        userId: userId,
        userIdType: typeof userId,
        restaurantCount: restaurants.length,
        restaurants: restaurants.map(r => ({
          id: r.id,
          name: r.name,
          ownerId: r.ownerId,
          ownerIdType: typeof r.ownerId,
          ownerIdMatches: r.ownerId === userId
        })),
        specificRestaurant: specificRestaurant ? {
          id: specificRestaurant.id,
          name: specificRestaurant.name,
          ownerId: specificRestaurant.ownerId,
          ownerIdType: typeof specificRestaurant.ownerId,
          ownerIdMatches: specificRestaurant.ownerId === userId
        } : null,
        requestedRestaurantId: restaurantId
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
