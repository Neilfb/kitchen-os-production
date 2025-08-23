// Individual menu management API for restaurant-specific menus
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { serverRestaurantService } from "@/lib/services/serverRestaurantService";
import { firebaseMenuService, UpdateMenuInput } from "@/lib/services/firebaseMenuService";
import { EnhancedMenu } from "@/lib/types/menu";

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

interface Params {
  restaurantId: string;
  menuId: string;
}

// GET - Fetch individual menu
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    console.log(`[Restaurant Menu GET] Fetching menu ${params.menuId} for restaurant ${params.restaurantId}`);

    // Verify Firebase authentication
    const userId = await verifyFirebaseToken(request);
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

    // Get menu from Firebase
    const menu = await firebaseMenuService.getMenu(params.menuId, userId);
    if (!menu) {
      return NextResponse.json(
        { error: "Menu not found" },
        { status: 404 }
      );
    }

    // Verify menu belongs to the restaurant
    if (menu.restaurantId !== params.restaurantId) {
      return NextResponse.json(
        { error: "Menu not found" },
        { status: 404 }
      );
    }

    console.log(`[Restaurant Menu GET] Successfully fetched menu: ${menu.name}`);

    return NextResponse.json({
      success: true,
      menu
    });

  } catch (error) {
    console.error('[Restaurant Menu GET] Error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update individual menu
export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    console.log(`[Restaurant Menu PUT] Updating menu ${params.menuId} for restaurant ${params.restaurantId}`);

    // Verify Firebase authentication
    const userId = await verifyFirebaseToken(request);
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
    const body = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return NextResponse.json(
        { error: "Menu name is required" },
        { status: 400 }
      );
    }

    // Create update input
    const updateInput: UpdateMenuInput = {
      name: body.name.trim(),
      description: body.description || '',
      status: body.status || 'draft',
      region: body.region,
    };

    // Update menu using Firebase service
    const updatedMenu = await firebaseMenuService.updateMenu(params.menuId, userId, updateInput);

    // Verify menu belongs to the restaurant
    if (updatedMenu.restaurantId !== params.restaurantId) {
      return NextResponse.json(
        { error: "Menu not found" },
        { status: 404 }
      );
    }

    console.log(`[Restaurant Menu PUT] Successfully updated menu: ${updatedMenu.name}`);

    return NextResponse.json({
      success: true,
      menu: updatedMenu
    });

  } catch (error) {
    console.error('[Restaurant Menu PUT] Error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete individual menu
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    console.log(`[Restaurant Menu DELETE] Deleting menu ${params.menuId} for restaurant ${params.restaurantId}`);

    // Verify Firebase authentication
    const userId = await verifyFirebaseToken(request);
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

    // Delete menu using Firebase service
    await firebaseMenuService.deleteMenu(params.menuId, userId);

    console.log(`[Restaurant Menu DELETE] Successfully deleted menu: ${params.menuId}`);

    return NextResponse.json({
      success: true,
      message: "Menu deleted successfully"
    });

  } catch (error) {
    console.error('[Restaurant Menu DELETE] Error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
