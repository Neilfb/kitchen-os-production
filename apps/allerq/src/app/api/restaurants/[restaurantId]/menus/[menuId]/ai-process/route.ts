// AI processing endpoint for menu allergen detection
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { serverRestaurantService } from "@/lib/services/serverRestaurantService";
import { firebaseMenuService } from "@/lib/services/firebaseMenuService";
import { allergenDetectionService } from "@/lib/ai/allergenDetection";
import { AIProcessingRequest, MenuItemTag } from "@/lib/types/menu";

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

interface AIProcessingInput {
  items: {
    name: string;
    description?: string;
    ingredients?: string;
  }[];
  options?: {
    includeNutritionalInfo?: boolean;
    includePricing?: boolean;
    customPrompt?: string;
  };
}

// POST /api/restaurants/[restaurantId]/menus/[menuId]/ai-process
export async function POST(
  req: NextRequest,
  { params }: { params: { restaurantId: string; menuId: string } }
) {
  try {
    console.log(`[AI Processing] Processing menu ${params.menuId} for restaurant ${params.restaurantId}`);

    // Verify Firebase authentication
    const userId = await verifyFirebaseToken(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get restaurant to verify ownership and determine region
    const restaurant = await serverRestaurantService.getRestaurant(params.restaurantId, userId);
    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found or access denied" },
        { status: 404 }
      );
    }

    // Get menu to verify it exists
    const menu = await firebaseMenuService.getMenu(params.menuId, userId);
    if (!menu || menu.restaurantId !== params.restaurantId) {
      return NextResponse.json(
        { error: "Menu not found" },
        { status: 404 }
      );
    }

    // Parse input
    const input: AIProcessingInput = await req.json();

    // Validate input
    if (!input.items || !Array.isArray(input.items) || input.items.length === 0) {
      return NextResponse.json(
        { error: "Items array is required and must not be empty" },
        { status: 400 }
      );
    }

    // Validate each item
    for (const item of input.items) {
      if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
        return NextResponse.json(
          { error: "Each item must have a valid name" },
          { status: 400 }
        );
      }
    }

    // Determine region based on restaurant location
    let region: 'EU' | 'US' | 'CA' | 'ASIA' = 'EU';
    if (restaurant.location?.country) {
      const country = restaurant.location.country;
      if (country === 'US' || country === 'United States') region = 'US';
      else if (country === 'CA' || country === 'Canada') region = 'CA';
      else if (['China', 'Japan', 'South Korea', 'India', 'Thailand', 'Singapore'].includes(country)) region = 'ASIA';
      else region = 'EU';
    }

    console.log(`[AI Processing] Using region: ${region} for restaurant in ${restaurant.location?.country || 'Unknown'}`);

    // Create AI processing request
    const aiRequest: AIProcessingRequest = {
      menuId: params.menuId,
      restaurantId: params.restaurantId,
      region,
      items: input.items,
      options: input.options,
    };

    // Process with AI service
    const aiResponse = await allergenDetectionService.processMenuItems(aiRequest);

    if (!aiResponse.success) {
      return NextResponse.json({
        success: false,
        error: "AI processing failed",
        details: aiResponse.errors,
        warnings: aiResponse.warnings,
      }, { status: 500 });
    }

    // Validate regional compliance
    const complianceCheck = allergenDetectionService.validateRegionalCompliance(
      aiResponse.processedItems,
      region
    );

    // Transform AI response to menu item tags format
    const processedItems = aiResponse.processedItems.map(item => {
      const allergenTags: MenuItemTag[] = item.allergens.map(allergen => ({
        type: 'allergen' as const,
        value: allergen.tag,
        confidence: allergen.confidence,
        source: 'ai' as const,
        addedAt: new Date().toISOString(),
        addedBy: userId,
      }));

      const dietaryTags: MenuItemTag[] = item.dietary.map(dietary => ({
        type: 'dietary' as const,
        value: dietary.tag,
        confidence: dietary.confidence,
        source: 'ai' as const,
        addedAt: new Date().toISOString(),
        addedBy: userId,
      }));

      return {
        name: item.name,
        allergenTags,
        dietaryTags,
        suggestions: item.suggestions,
        aiConfidence: {
          overall: Math.round((
            [...item.allergens, ...item.dietary].reduce((sum, tag) => sum + tag.confidence, 0) /
            Math.max([...item.allergens, ...item.dietary].length, 1)
          )),
          allergens: item.allergens.length > 0 ? 
            Math.round(item.allergens.reduce((sum, tag) => sum + tag.confidence, 0) / item.allergens.length) : 0,
          dietary: item.dietary.length > 0 ? 
            Math.round(item.dietary.reduce((sum, tag) => sum + tag.confidence, 0) / item.dietary.length) : 0,
        }
      };
    });

    // Create response
    const response = {
      success: true,
      processedItems,
      region,
      compliance: complianceCheck,
      aiMetadata: {
        modelUsed: aiResponse.modelUsed,
        processingTime: aiResponse.processingTime,
        processedAt: new Date().toISOString(),
        itemCount: input.items.length,
      },
      warnings: [
        ...aiResponse.warnings,
        ...(!complianceCheck.compliant ? complianceCheck.issues : []),
      ],
      recommendations: [
        "Review all AI-generated tags for accuracy",
        "Pay special attention to items with confidence scores below 80%",
        "Consider cross-contamination risks in your kitchen",
        complianceCheck.compliant ? 
          `All items appear compliant with ${region} regulations` :
          `${complianceCheck.issues.length} potential compliance issues detected`,
      ],
    };

    console.log(`[AI Processing] Successfully processed ${processedItems.length} items with ${response.warnings.length} warnings`);

    return NextResponse.json(response);

  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    console.error("[AI Processing] Error:", error);
    return NextResponse.json(
      { error: "Failed to process menu items with AI" },
      { status: 500 }
    );
  }
}
