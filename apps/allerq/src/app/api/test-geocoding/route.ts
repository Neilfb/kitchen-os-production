import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address') || '40 Ardaveen Ave, Newry BT35 8UJ, UK';
    
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Test Geocoding API directly
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    
    console.log(`[TestGeocoding] Testing address: ${address}`);
    
    const response = await fetch(geocodingUrl);
    const data = await response.json();
    
    console.log(`[TestGeocoding] Response status: ${data.status}`);
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0];
      
      return NextResponse.json({
        success: true,
        geocodingWorking: true,
        originalAddress: address,
        formattedAddress: result.formatted_address,
        coordinates: result.geometry.location,
        placeId: result.place_id,
        addressComponents: result.address_components,
        types: result.types,
        fullResult: result
      });
    } else {
      return NextResponse.json({
        success: false,
        geocodingWorking: false,
        error: data.status,
        errorMessage: data.error_message,
        fullResponse: data
      });
    }

  } catch (error) {
    console.error('[TestGeocoding] Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: "Test failed",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
