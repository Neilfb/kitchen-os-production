/**
 * Restaurant API Routes - Firebase Firestore Implementation
 * 
 * This API provides restaurant CRUD operations using Firebase Firestore.
 * It replaces the previous NoCodeBackend integration with a stable solution.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { serverRestaurantService, CreateRestaurantInput } from "@/lib/services/serverRestaurantService";

async function verifyFirebaseToken(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[Auth] No valid authorization header found');
      return null;
    }

    const token = authHeader.substring(7);
    const decodedToken = await getAuth().verifyIdToken(token);
    console.log('[Auth] Token verified for user:', decodedToken.uid);
    return decodedToken.uid;
  } catch (error) {
    console.error('[Auth] Token verification failed:', error);
    return null;
  }
}

/**
 * GET /api/restaurants
 * Get all restaurants for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[Restaurants API] GET request received');
    
    // Verify Firebase authentication
    const userId = await verifyFirebaseToken(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get restaurants for the authenticated user
    const restaurants = await serverRestaurantService.getRestaurantsByOwner(userId);
    
    console.log(`[Restaurants API] Returning ${restaurants.length} restaurants for user ${userId}`);
    
    return NextResponse.json({
      success: true,
      data: restaurants,
      count: restaurants.length
    });
    
  } catch (error) {
    console.error('[Restaurants API] GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch restaurants' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/restaurants
 * Create a new restaurant
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[Restaurants API] 🚀 POST request received');

    // Verify Firebase authentication
    console.log('[Restaurants API] 🔐 Verifying Firebase authentication...');
    const userId = await verifyFirebaseToken(request);
    if (!userId) {
      console.log('[Restaurants API] ❌ Authentication failed');
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    console.log('[Restaurants API] ✅ Authentication successful for user:', userId);

    // Parse request body
    console.log('[Restaurants API] 📝 Parsing request body...');
    const body = await request.json();
    console.log('[Restaurants API] 📊 Request body received:', body);

    // Validate required fields
    if (!body.name || typeof body.name !== 'string') {
      console.log('[Restaurants API] ❌ Validation failed: Restaurant name is required');
      return NextResponse.json(
        { success: false, error: 'Restaurant name is required' },
        { status: 400 }
      );
    }
    console.log('[Restaurants API] ✅ Validation passed');

    // Prepare restaurant data
    const restaurantData: CreateRestaurantInput = {
      name: body.name,
      address: body.address || '',
      website: body.website || '',
      phone: body.phone || '',
      email: body.email || '',
      logoUrl: body.logoUrl || body.logo_url || '', // Support both naming conventions
      location: body.location
    };
    console.log('[Restaurants API] 🔧 Prepared restaurant data:', restaurantData);

    // Create restaurant
    console.log('[Restaurants API] 🏗️ Calling serverRestaurantService.createRestaurant...');
    const restaurant = await serverRestaurantService.createRestaurant(userId, restaurantData);

    console.log('[Restaurants API] 🎉 Restaurant created successfully:', {
      id: restaurant.id,
      name: restaurant.name,
      ownerId: restaurant.ownerId
    });

    const response = {
      success: true,
      data: restaurant
    };
    console.log('[Restaurants API] 📤 Sending response:', { success: true, dataId: restaurant.id });

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Restaurants API] 💥 POST error details:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create restaurant'
    };
    console.log('[Restaurants API] 📤 Sending error response:', errorResponse);

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
