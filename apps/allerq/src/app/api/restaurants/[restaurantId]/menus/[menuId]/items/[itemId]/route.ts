// Individual menu item API for restaurant-specific menu management
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { serverRestaurantService } from "@/lib/services/serverRestaurantService";
import { firebaseMenuService, UpdateMenuItemInput } from "@/lib/services/firebaseMenuService";

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
    console.error('[Auth] Token verification failed:', error);
    return null;
  }
}

// GET /api/restaurants/[restaurantId]/menus/[menuId]/items/[itemId] - Get specific menu item
export async function GET(
  req: NextRequest,
  { params }: { params: { restaurantId: string; menuId: string; itemId: string } }
) {
  try {
    console.log(`[Menu Item] GET request for item: ${params.itemId} in menu: ${params.menuId}`);

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

    // Get menu item
    const menuItem = await firebaseMenuService.getMenuItem(params.itemId, userId);
    if (!menuItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      item: menuItem,
    });

  } catch (error) {
    console.error("[Menu Item] GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu item" },
      { status: 500 }
    );
  }
}

// PATCH /api/restaurants/[restaurantId]/menus/[menuId]/items/[itemId] - Update menu item
export async function PATCH(
  req: NextRequest,
  { params }: { params: { restaurantId: string; menuId: string; itemId: string } }
) {
  try {
    console.log(`[Menu Item] PATCH request for item: ${params.itemId} in menu: ${params.menuId}`);

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

    // Parse request body
    const body = await req.json();
    
    // Update menu item
    const updatedItem = await firebaseMenuService.updateMenuItem(
      params.itemId,
      userId,
      body as UpdateMenuItemInput
    );

    return NextResponse.json({
      success: true,
      item: updatedItem,
    });

  } catch (error) {
    console.error("[Menu Item] PATCH Error:", error);
    return NextResponse.json(
      { error: "Failed to update menu item" },
      { status: 500 }
    );
  }
}

// DELETE /api/restaurants/[restaurantId]/menus/[menuId]/items/[itemId] - Delete menu item
export async function DELETE(
  req: NextRequest,
  { params }: { params: { restaurantId: string; menuId: string; itemId: string } }
) {
  try {
    console.log(`[Menu Item] DELETE request for item: ${params.itemId} in menu: ${params.menuId}`);

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

    // Delete menu item
    await firebaseMenuService.deleteMenuItem(params.itemId, userId);

    return NextResponse.json({
      success: true,
      message: "Menu item deleted successfully",
    });

  } catch (error) {
    console.error("[Menu Item] DELETE Error:", error);
    return NextResponse.json(
      { error: "Failed to delete menu item" },
      { status: 500 }
    );
  }
}
