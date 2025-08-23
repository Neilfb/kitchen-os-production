/**
 * Single Restaurant API Routes - Firebase Firestore Implementation
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { serverRestaurantService, UpdateRestaurantInput } from "@/lib/services/serverRestaurantService";

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

export async function GET(
  request: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    const userId = await verifyFirebaseToken(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const restaurant = await serverRestaurantService.getRestaurant(params.restaurantId, userId);
    
    if (!restaurant) {
      return NextResponse.json({ success: false, error: 'Restaurant not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: restaurant });
  } catch (error) {
    console.error('[Restaurant API] GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch restaurant' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    const userId = await verifyFirebaseToken(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    // Check if request is FormData (for file uploads) or JSON
    const contentType = request.headers.get('content-type');

    interface RequestBody {
      name: string;
      address?: string;
      website?: string;
      contact?: string;
      phone?: string;
      email?: string;
      logoUrl?: string;
      logo_url?: string;
      isActive?: boolean;
      location?: {
        lat: number;
        lng: number;
        formatted: string;
        placeId?: string;
      };
    }

    let body: RequestBody;
    let logoFile: File | null = null;

    if (contentType?.includes('multipart/form-data')) {
      // Handle FormData for file uploads
      const formData = await request.formData();
      body = {
        name: formData.get('name') as string,
        address: formData.get('address') as string,
        website: formData.get('website') as string,
        contact: formData.get('contact') as string,
        phone: formData.get('phone') as string,
        email: formData.get('email') as string,
      };

      // Handle address verification data
      const addressVerificationStr = formData.get('addressVerification') as string;
      if (addressVerificationStr) {
        try {
          const addressVerification = JSON.parse(addressVerificationStr);
          if (addressVerification?.coordinates) {
            body.location = {
              lat: addressVerification.coordinates.lat,
              lng: addressVerification.coordinates.lng,
              formatted: addressVerification.formattedAddress,
              placeId: addressVerification.placeId
            };
          }
        } catch (e) {
          console.warn('[Restaurant API] Failed to parse address verification:', e);
        }
      }

      // Handle logo file
      logoFile = formData.get('logo') as File;
    } else {
      // Handle JSON request
      body = await request.json();
    }

    // Process logo upload if present
    let logoUrl = body.logoUrl || body.logo_url;
    if (logoFile && logoFile.size > 0) {
      try {
        // Import the file upload utility
        const { processLogoUpload } = await import('@/lib/fileUpload');
        logoUrl = await processLogoUpload(logoFile, userId);
        console.log('[Restaurant API] Logo uploaded successfully:', logoUrl);
      } catch (uploadError) {
        console.error('[Restaurant API] Logo upload failed:', uploadError);
        return NextResponse.json({
          success: false,
          error: 'Failed to upload logo'
        }, { status: 500 });
      }
    }

    const updateData: UpdateRestaurantInput = {
      name: body.name,
      address: body.address,
      website: body.website,
      phone: body.phone || body.contact, // Support both field names
      email: body.email,
      logoUrl: logoUrl,
      location: body.location,
      isActive: body.isActive
    };

    console.log('[Restaurant API] Updating restaurant with data:', updateData);
    const restaurant = await serverRestaurantService.updateRestaurant(params.restaurantId, userId, updateData);

    return NextResponse.json({ success: true, data: restaurant });
  } catch (error) {
    console.error('[Restaurant API] PUT error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update restaurant' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    const userId = await verifyFirebaseToken(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    await serverRestaurantService.deleteRestaurant(params.restaurantId, userId);
    return NextResponse.json({ success: true, message: 'Restaurant deleted successfully' });
  } catch (error) {
    console.error('[Restaurant API] DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete restaurant' }, { status: 500 });
  }
}
