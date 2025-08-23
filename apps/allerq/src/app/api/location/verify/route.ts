// API endpoint for address verification
import { NextRequest, NextResponse } from "next/server";
import { googlePlacesService } from "@/lib/location/googlePlaces";

export async function POST(req: NextRequest) {
  try {
    console.log('[Location Verify] Request received');

    const { address } = await req.json();

    if (!address || typeof address !== 'string' || address.trim() === '') {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    console.log(`[Location Verify] Verifying address: ${address}`);

    // Verify the address using Google Places API
    const verification = await googlePlacesService.verifyAddress(address.trim());

    console.log(`[Location Verify] Verification result:`, {
      verified: verification.verified,
      confidence: verification.confidence,
      source: verification.verificationSource,
    });

    return NextResponse.json({
      success: true,
      verification,
    });

  } catch (error) {
    console.error('[Location Verify] Error:', error);
    return NextResponse.json(
      { error: "Failed to verify address" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query || query.trim() === '') {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    console.log(`[Location Search] Searching for: ${query}`);

    // Search for places
    const places = await googlePlacesService.searchPlaces(query.trim());

    console.log(`[Location Search] Found ${places.length} places`);

    return NextResponse.json({
      success: true,
      places: places.slice(0, 5), // Limit to top 5 results
    });

  } catch (error) {
    console.error('[Location Search] Error:', error);
    return NextResponse.json(
      { error: "Failed to search places" },
      { status: 500 }
    );
  }
}
