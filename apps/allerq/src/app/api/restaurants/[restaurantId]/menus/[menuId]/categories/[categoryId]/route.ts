// Individual Menu Category API - Firebase Implementation
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { firebaseMenuService, UpdateMenuCategoryInput } from "@/lib/services/firebaseMenuService";
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
    console.error('[Menu Category Auth] Token verification failed:', error);
    return null;
  }
}

/**
 * PUT /api/restaurants/[restaurantId]/menus/[menuId]/categories/[categoryId]
 * Update a menu category
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { restaurantId: string; menuId: string; categoryId: string } }
) {
  try {
    console.log('[Menu Category] PUT request for category:', params.categoryId);

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

    // Create update input
    const updateInput: UpdateMenuCategoryInput = {};
    if (body.name !== undefined) updateInput.name = body.name;
    if (body.description !== undefined) updateInput.description = body.description;
    if (body.order !== undefined) updateInput.order = body.order;
    if (body.isVisible !== undefined) updateInput.isVisible = body.isVisible;

    // Update category
    console.log('[Menu Category] Updating category with input:', updateInput);
    const category = await firebaseMenuService.updateMenuCategory(params.categoryId, userId, updateInput);
    console.log('[Menu Category] ✅ Category updated successfully:', category.id);

    return NextResponse.json({
      success: true,
      category,
    });

  } catch (error) {
    console.error('[Menu Category] PUT error:', error);
    return NextResponse.json(
      { error: "Failed to update menu category" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/restaurants/[restaurantId]/menus/[menuId]/categories/[categoryId]
 * Delete a menu category
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { restaurantId: string; menuId: string; categoryId: string } }
) {
  try {
    console.log('[Menu Category] DELETE request for category:', params.categoryId);

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

    // Delete category
    console.log('[Menu Category] Deleting category:', params.categoryId);
    await firebaseMenuService.deleteMenuCategory(params.categoryId, userId);
    console.log('[Menu Category] ✅ Category deleted successfully:', params.categoryId);

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });

  } catch (error) {
    console.error('[Menu Category] DELETE error:', error);
    return NextResponse.json(
      { error: "Failed to delete menu category" },
      { status: 500 }
    );
  }
}
