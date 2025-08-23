// Menu items API for restaurant-specific menu management
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { serverRestaurantService } from "@/lib/services/serverRestaurantService";
import { firebaseMenuService, CreateMenuItemInput } from "@/lib/services/firebaseMenuService";
import { allergenDetectionService } from "@/lib/ai/allergenDetection";

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

// GET /api/restaurants/[restaurantId]/menus/[menuId]/items - Get all items for a menu
export async function GET(
  req: NextRequest,
  { params }: { params: { restaurantId: string; menuId: string } }
) {
  try {
    console.log(`[Menu Items] GET request for menu: ${params.menuId} in restaurant: ${params.restaurantId}`);

    // Verify Firebase authentication
    const userId = await verifyFirebaseToken(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify restaurant ownership
    console.log('[Menu Items] Verifying restaurant ownership for user:', userId, 'restaurant:', params.restaurantId);
    const restaurant = await serverRestaurantService.getRestaurant(params.restaurantId, userId);
    if (!restaurant) {
      console.warn('[Menu Items] Restaurant ownership verification failed:', {
        restaurantId: params.restaurantId,
        userId: userId,
        userIdType: typeof userId
      });
      return NextResponse.json(
        { error: "Restaurant not found or access denied" },
        { status: 404 }
      );
    }
    console.log('[Menu Items] ✅ Restaurant ownership verified for:', restaurant.name);

    // Verify menu exists and belongs to restaurant
    console.log('[Menu Items] Fetching menu:', params.menuId, 'for user:', userId);
    const menu = await firebaseMenuService.getMenu(params.menuId, userId);
    if (!menu || menu.restaurantId !== params.restaurantId) {
      console.warn('[Menu Items] Menu not found or doesn\'t belong to restaurant:', {
        menuFound: !!menu,
        menuRestaurantId: menu?.restaurantId,
        expectedRestaurantId: params.restaurantId
      });
      return NextResponse.json(
        { error: "Menu not found" },
        { status: 404 }
      );
    }

    console.log('[Menu Items] ✅ Menu found:', menu.name, 'with', menu.items?.length || 0, 'items');

    // Menu items are already included in the menu object from Firebase
    return NextResponse.json({
      success: true,
      items: menu.items || [],
      region: menu.region || 'EU',
      menu: {
        id: menu.id,
        name: menu.name,
        description: menu.description,
      },
    });

  } catch (error) {
    console.error("[Menu Items] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}

// POST /api/restaurants/[restaurantId]/menus/[menuId]/items - Create new menu item with AI integration
export async function POST(
  req: NextRequest,
  { params }: { params: { restaurantId: string; menuId: string } }
) {
  try {
    console.log(`[Menu Items] POST request for menu: ${params.menuId} in restaurant: ${params.restaurantId}`);

    // Verify Firebase authentication
    const userId = await verifyFirebaseToken(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify restaurant ownership
    console.log('[Menu Items] POST - Verifying restaurant ownership for user:', userId, 'restaurant:', params.restaurantId);
    const restaurant = await serverRestaurantService.getRestaurant(params.restaurantId, userId);
    if (!restaurant) {
      console.warn('[Menu Items] POST - Restaurant ownership verification failed:', {
        restaurantId: params.restaurantId,
        userId: userId,
        userIdType: typeof userId
      });
      return NextResponse.json(
        { error: "Restaurant not found or access denied" },
        { status: 404 }
      );
    }
    console.log('[Menu Items] POST - ✅ Restaurant ownership verified for:', restaurant.name);

    // Verify menu exists and belongs to restaurant
    const menu = await firebaseMenuService.getMenu(params.menuId, userId);
    if (!menu || menu.restaurantId !== params.restaurantId) {
      return NextResponse.json(
        { error: "Menu not found" },
        { status: 404 }
      );
    }

    // Parse input
    const body = await req.json();

    // Validate required fields
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return NextResponse.json(
        { error: "Item name is required" },
        { status: 400 }
      );
    }

    // Create menu item input
    const itemInput: CreateMenuItemInput = {
      name: body.name.trim(),
      description: body.description || '',
      price: body.price || 0,
      category: body.category || '',
      allergens: body.allergens || [],
      dietary: body.dietary || [],
      image: body.image || '',
      isVisible: body.isVisible !== false,
      order: body.order || 0,
    };

    // Create menu item
    const menuItem = await firebaseMenuService.createMenuItem(params.menuId, userId, itemInput);

    // If AI processing is requested and item has description, process with AI
    if (body.processWithAI && itemInput.description) {
      try {
        // Determine region based on restaurant location
        let region: 'EU' | 'US' | 'CA' | 'ASIA' = 'EU';
        if (restaurant.location?.country) {
          const country = restaurant.location.country;
          if (country === 'US' || country === 'United States') region = 'US';
          else if (country === 'CA' || country === 'Canada') region = 'CA';
          else if (['China', 'Japan', 'South Korea', 'India', 'Thailand', 'Singapore'].includes(country)) region = 'ASIA';
          else region = 'EU';
        }

        // Process with AI
        const aiResponse = await allergenDetectionService.processMenuItems({
          menuId: params.menuId,
          restaurantId: params.restaurantId,
          region,
          items: [{
            name: itemInput.name,
            description: itemInput.description,
          }],
        });

        if (aiResponse.success && aiResponse.processedItems.length > 0) {
          const processedItem = aiResponse.processedItems[0];

          // Update menu item with AI-detected allergens and dietary info
          const updatedItem = await firebaseMenuService.updateMenuItem(menuItem.id, userId, {
            allergens: processedItem.allergens || [],
            dietary: processedItem.dietary || [],
          });

          console.log(`[Menu Items] Item created with AI processing: ${updatedItem.id}`);

          return NextResponse.json({
            success: true,
            item: updatedItem,
            aiProcessing: {
              processed: true,
              warnings: aiResponse.warnings,
              processingTime: aiResponse.processingTime,
            },
            message: `Menu item "${updatedItem.name}" created successfully with AI allergen detection`,
          });
        }
      } catch (aiError) {
        console.error('[Menu Items] AI processing failed:', aiError);
        // Continue without AI processing - item was still created
      }
    }

    console.log(`[Menu Items] Item created: ${menuItem.id}`);

    return NextResponse.json({
      success: true,
      item: menuItem,
      message: `Menu item "${menuItem.name}" created successfully`,
    });

  } catch (error) {
    console.error("[Menu Items] Error:", error);
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 }
    );
  }
}
