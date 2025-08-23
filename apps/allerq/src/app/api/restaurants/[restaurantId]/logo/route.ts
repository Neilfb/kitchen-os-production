/**
 * Restaurant Logo API - Handles logo retrieval and display
 */

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
    console.error('[Auth] Token verification failed:', error);
    return null;
  }
}

/**
 * GET /api/restaurants/[restaurantId]/logo
 * Get restaurant logo (handles both URL and base64 data URLs)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    console.log(`[Restaurant Logo] GET request for restaurant: ${params.restaurantId}`);

    // Check if this is a public request (no auth required for public logos)
    const isPublic = request.nextUrl.searchParams.get('public') === 'true';
    
    let userId: string | null = null;
    if (!isPublic) {
      userId = await verifyFirebaseToken(request);
      if (!userId) {
        return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
      }
    }

    // Get restaurant (use 'public' as userId for public requests)
    const restaurant = await serverRestaurantService.getRestaurant(
      params.restaurantId,
      userId || 'public'
    );
    
    if (!restaurant) {
      return NextResponse.json({ success: false, error: 'Restaurant not found' }, { status: 404 });
    }

    // Check if restaurant has a logo
    if (!restaurant.logoUrl) {
      return NextResponse.json({ success: false, error: 'No logo found' }, { status: 404 });
    }

    // If it's a data URL (base64), return it directly
    if (restaurant.logoUrl.startsWith('data:')) {
      return NextResponse.json({
        success: true,
        logoUrl: restaurant.logoUrl,
        type: 'base64'
      });
    }

    // If it's a regular URL, return it
    return NextResponse.json({
      success: true,
      logoUrl: restaurant.logoUrl,
      type: 'url'
    });

  } catch (error) {
    console.error('[Restaurant Logo] GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch logo' }, { status: 500 });
  }
}

/**
 * PUT /api/restaurants/[restaurantId]/logo
 * Update restaurant logo
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    console.log(`[Restaurant Logo] PUT request for restaurant: ${params.restaurantId}`);

    // Verify Firebase authentication
    const userId = await verifyFirebaseToken(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    // Check if request is FormData (for file uploads) or JSON
    const contentType = request.headers.get('content-type');
    let logoFile: File | null = null;
    let logoUrl: string | null = null;

    if (contentType?.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData();
      logoFile = formData.get('logo') as File;
    } else {
      // Handle JSON with base64 data URL
      const body = await request.json();
      logoUrl = body.logoUrl;
    }

    // Process logo upload if file is provided
    if (logoFile && logoFile.size > 0) {
      try {
        const { processLogoUpload } = await import('@/lib/fileUpload');
        logoUrl = await processLogoUpload(logoFile, userId);
        console.log('[Restaurant Logo] Logo uploaded successfully:', logoUrl?.substring(0, 50) + '...');
      } catch (uploadError) {
        console.error('[Restaurant Logo] Logo upload failed:', uploadError);
        return NextResponse.json({
          success: false,
          error: 'Failed to upload logo'
        }, { status: 500 });
      }
    }

    if (!logoUrl) {
      return NextResponse.json({
        success: false,
        error: 'No logo provided'
      }, { status: 400 });
    }

    // Update restaurant with new logo
    const updatedRestaurant = await serverRestaurantService.updateRestaurant(
      params.restaurantId,
      userId,
      { logoUrl }
    );

    if (!updatedRestaurant) {
      return NextResponse.json({
        success: false,
        error: 'Failed to update restaurant logo'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      logoUrl: updatedRestaurant.logoUrl,
      message: 'Logo updated successfully'
    });

  } catch (error) {
    console.error('[Restaurant Logo] PUT error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update logo' }, { status: 500 });
  }
}

/**
 * DELETE /api/restaurants/[restaurantId]/logo
 * Remove restaurant logo
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    console.log(`[Restaurant Logo] DELETE request for restaurant: ${params.restaurantId}`);

    // Verify Firebase authentication
    const userId = await verifyFirebaseToken(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    // Update restaurant to remove logo
    const updatedRestaurant = await serverRestaurantService.updateRestaurant(
      params.restaurantId,
      userId,
      { logoUrl: '' }
    );

    if (!updatedRestaurant) {
      return NextResponse.json({
        success: false,
        error: 'Failed to remove restaurant logo'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Logo removed successfully'
    });

  } catch (error) {
    console.error('[Restaurant Logo] DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Failed to remove logo' }, { status: 500 });
  }
}
