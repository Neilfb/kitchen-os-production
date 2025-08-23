// Menu Categories API - Firebase Implementation
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { firebaseMenuService, CreateMenuCategoryInput } from "@/lib/services/firebaseMenuService";
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
    console.error('[Menu Categories Auth] Token verification failed:', error);
    return null;
  }
}

/**
 * GET /api/restaurants/[restaurantId]/menus/[menuId]/categories
 * Get all categories for a menu
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { restaurantId: string; menuId: string } }
) {
  try {
    console.log('[Menu Categories] GET request for menu:', params.menuId);

    // Verify Firebase authentication
    const userId = await verifyFirebaseToken(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify restaurant ownership
    console.log('[Menu Categories] Verifying restaurant ownership for user:', userId, 'restaurant:', params.restaurantId);
    const restaurant = await serverRestaurantService.getRestaurant(params.restaurantId, userId);
    if (!restaurant) {
      console.warn('[Menu Categories] Restaurant ownership verification failed');
      return NextResponse.json(
        { error: "Restaurant not found or access denied" },
        { status: 404 }
      );
    }

    // Verify menu exists and belongs to restaurant
    const menu = await firebaseMenuService.getMenu(params.menuId, userId);
    if (!menu || menu.restaurantId !== params.restaurantId) {
      console.warn('[Menu Categories] Menu not found or doesn\'t belong to restaurant');
      return NextResponse.json(
        { error: "Menu not found" },
        { status: 404 }
      );
    }

    // Get categories for the menu
    const categories = await firebaseMenuService.getMenuCategories(params.menuId);

    console.log('[Menu Categories] ✅ Found', categories.length, 'categories');

    return NextResponse.json({
      success: true,
      categories,
    });

  } catch (error) {
    console.error('[Menu Categories] GET error:', error);
    return NextResponse.json(
      { error: "Failed to fetch menu categories" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/restaurants/[restaurantId]/menus/[menuId]/categories
 * Create a new category for a menu
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { restaurantId: string; menuId: string } }
) {
  try {
    console.log('[Menu Categories] POST request for menu:', params.menuId);

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

    // Verify menu exists and belongs to restaurant
    const menu = await firebaseMenuService.getMenu(params.menuId, userId);
    if (!menu || menu.restaurantId !== params.restaurantId) {
      return NextResponse.json(
        { error: "Menu not found" },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    // Create category input
    const categoryInput: CreateMenuCategoryInput = {
      name: body.name.trim(),
      description: body.description || '',
      order: body.order || 0,
      isVisible: body.isVisible !== false,
    };

    // Create category
    console.log('[Menu Categories] Creating category with input:', categoryInput);
    const category = await firebaseMenuService.createMenuCategory(params.menuId, userId, categoryInput);
    console.log('[Menu Categories] ✅ Category created successfully:', category.id);

    return NextResponse.json({
      success: true,
      category,
    });

  } catch (error) {
    console.error('[Menu Categories] POST error:', error);
    return NextResponse.json(
      { error: "Failed to create menu category" },
      { status: 500 }
    );
  }
}
