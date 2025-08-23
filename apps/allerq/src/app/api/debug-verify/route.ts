import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    console.log('[Debug Verify] Starting verification...');
    const startTime = Date.now();

    const { address } = await req.json();
    console.log(`[Debug Verify] Address: ${address}`);

    if (!address || typeof address !== 'string' || address.trim() === '') {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    console.log(`[Debug Verify] API key present: ${!!apiKey}`);

    // Step 1: Test Geocoding API directly
    console.log('[Debug Verify] Step 1: Testing Geocoding API...');
    const geocodingStart = Date.now();
    
    try {
      const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
      const geocodingResponse = await fetch(geocodingUrl);
      const geocodingData = await geocodingResponse.json();
      
      const geocodingTime = Date.now() - geocodingStart;
      console.log(`[Debug Verify] Geocoding completed in ${geocodingTime}ms`);
      
      if (geocodingData.status === 'OK' && geocodingData.results && geocodingData.results.length > 0) {
        const result = geocodingData.results[0];
        
        // Simple confidence calculation (no complex algorithms)
        let confidence = 75; // Base confidence for geocoding
        if (result.types.includes('street_address')) confidence += 15;
        if (result.geometry.location_type === 'ROOFTOP') confidence += 10;
        
        const totalTime = Date.now() - startTime;
        console.log(`[Debug Verify] Total time: ${totalTime}ms`);
        
        return NextResponse.json({
          success: true,
          method: 'geocoding',
          verification: {
            address: address,
            formattedAddress: result.formatted_address,
            coordinates: result.geometry.location,
            verified: confidence >= 70,
            verificationSource: 'google_places',
            verificationDate: new Date(),
            confidence,
            placeId: result.place_id,
            addressComponents: result.address_components,
            completeness: {
              score: 90, // Simplified
              issues: [],
              isComplete: true
            }
          },
          timing: {
            geocodingTime,
            totalTime
          }
        });
      }
    } catch (geocodingError) {
      console.error('[Debug Verify] Geocoding error:', geocodingError);
    }

    // Step 2: Test Places API if geocoding fails
    console.log('[Debug Verify] Step 2: Testing Places API...');
    const placesStart = Date.now();
    
    try {
      const placesUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(address)}&inputtype=textquery&fields=place_id,formatted_address,geometry,address_components,types&key=${apiKey}`;
      const placesResponse = await fetch(placesUrl);
      const placesData = await placesResponse.json();
      
      const placesTime = Date.now() - placesStart;
      console.log(`[Debug Verify] Places API completed in ${placesTime}ms`);
      
      if (placesData.status === 'OK' && placesData.candidates && placesData.candidates.length > 0) {
        const result = placesData.candidates[0];
        
        // Simple confidence calculation
        let confidence = 70; // Base confidence for places
        if (result.types.includes('establishment')) confidence += 15;
        if (result.types.includes('restaurant')) confidence += 10;
        
        const totalTime = Date.now() - startTime;
        console.log(`[Debug Verify] Total time: ${totalTime}ms`);
        
        return NextResponse.json({
          success: true,
          method: 'places',
          verification: {
            address: address,
            formattedAddress: result.formatted_address,
            coordinates: result.geometry.location,
            verified: confidence >= 70,
            verificationSource: 'google_places',
            verificationDate: new Date(),
            confidence,
            placeId: result.place_id,
            addressComponents: result.address_components || [],
            completeness: {
              score: 85, // Simplified
              issues: [],
              isComplete: true
            }
          },
          timing: {
            placesTime,
            totalTime
          }
        });
      }
    } catch (placesError) {
      console.error('[Debug Verify] Places error:', placesError);
    }

    // Step 3: Simple fallback
    console.log('[Debug Verify] Step 3: Using simple fallback...');
    const totalTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      method: 'fallback',
      verification: {
        address: address,
        formattedAddress: address,
        coordinates: { lat: 0, lng: 0 },
        verified: false,
        verificationSource: 'manual',
        verificationDate: new Date(),
        confidence: 50,
        placeId: `fallback-${Date.now()}`,
        addressComponents: {},
        completeness: {
          score: 50,
          issues: ['Using fallback verification'],
          isComplete: false
        }
      },
      timing: {
        totalTime
      }
    });

  } catch (error) {
    console.error('[Debug Verify] Error:', error);
    return NextResponse.json(
      { 
        error: "Debug verification failed",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
