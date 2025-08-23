// Google Places API integration for address verification
// Documentation: https://developers.google.com/maps/documentation/places/web-service

export interface PlaceDetails {
  place_id: string;
  formatted_address: string;
  name?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  business_status?: string;
  types: string[];
}

export interface AddressComponents {
  street_number?: string;
  route?: string;
  locality?: string;
  administrative_area_level_1?: string;
  administrative_area_level_2?: string;
  country?: string;
  postal_code?: string;
}

export interface LocationVerification {
  address: string;
  formattedAddress: string;
  coordinates: { lat: number; lng: number };
  verified: boolean;
  verificationSource: 'google_places' | 'manual';
  verificationDate: Date;
  confidence: number; // 0-100
  placeId?: string;
  addressComponents: AddressComponents;
  completeness: {
    score: number; // 0-100
    issues: string[];
    isComplete: boolean;
  };
}

class GooglePlacesService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api/place';
  private lastRequestTime = 0;
  private minRequestInterval = 100; // Minimum 100ms between requests

  // Shared constants for address parsing
  private static readonly STREET_INDICATORS = [
    'street', 'st', 'avenue', 'ave', 'road', 'rd', 'lane', 'ln',
    'drive', 'dr', 'way', 'place', 'pl', 'boulevard', 'blvd',
    'court', 'ct', 'circle', 'cir', 'terrace', 'ter'
  ];

  private static readonly CITY_INDICATORS = [
    'city', 'town', 'village', 'borough'
  ];

  private static readonly COUNTRY_INDICATORS = [
    'uk', 'united kingdom', 'usa', 'united states', 'canada',
    'australia', 'ireland', 'france', 'germany', 'spain', 'italy'
  ];

  private static readonly STREET_TYPES_CAPITALIZED = [
    'Street', 'Avenue', 'Road', 'Lane', 'Drive', 'Boulevard',
    'Court', 'Circle', 'Terrace', 'Way', 'Place'
  ];

  // Regex patterns for postal codes
  private static readonly POSTAL_CODE_PATTERNS = {
    UK: /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i,
    US: /\b\d{5}(-\d{4})?\b/,
    CANADA: /\b[A-Z]\d[A-Z]\s*\d[A-Z]\d\b/i
  };

  // Regex patterns for address structure
  private static readonly ADDRESS_PATTERNS = {
    STREET_NUMBER: /^\d+[a-z]?\s/,
    STREET_NUMBER_EXTRACT: /^\d+[a-z]?/i,
    PARTIAL_ADDRESS: /^\d+\s+\w+/
  };

  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY || '';

    // Enhanced logging for debugging
    console.log('[GooglePlaces] Constructor called');
    console.log('[GooglePlaces] NODE_ENV:', process.env.NODE_ENV);
    console.log('[GooglePlaces] API Key present:', !!this.apiKey);
    console.log('[GooglePlaces] API Key length:', this.apiKey ? this.apiKey.length : 0);
    console.log('[GooglePlaces] API Key prefix:', this.apiKey ? this.apiKey.substring(0, 10) : 'not found');

    if (!this.apiKey) {
      console.warn('[GooglePlaces] Google Places API key not configured. Address verification will use fallback mode.');
    } else {
      console.log('[GooglePlaces] Google Places API key configured successfully');
    }
  }

  /**
   * Rate limiting to prevent hitting API quotas too quickly
   */
  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      console.log(`[GooglePlaces] Rate limiting: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Search for places based on text input
   */
  async searchPlaces(query: string, types: string[] = ['establishment']): Promise<PlaceDetails[]> {
    console.log(`[GooglePlaces] searchPlaces called with query: ${query}`);

    if (!this.apiKey) {
      console.warn('[GooglePlaces] No API key available, using fallback results');
      return this.getFallbackResults(query);
    }

    try {
      // Apply rate limiting
      await this.rateLimit();

      const url = `${this.baseUrl}/textsearch/json`;
      const params = new URLSearchParams({
        query,
        key: this.apiKey,
        type: types.join('|'),
      });

      const fullUrl = `${url}?${params}`;
      console.log(`[GooglePlaces] Making API request to: ${url} (full URL hidden for security)`);

      const response = await fetch(fullUrl);
      console.log(`[GooglePlaces] API response status:`, response.status);

      const data = await response.json();
      console.log(`[GooglePlaces] API response data status:`, data.status);

      if (data.status === 'OVER_QUERY_LIMIT') {
        console.error('[GooglePlaces] ❌ QUOTA EXCEEDED: Places API quota limit reached');
        console.error('[GooglePlaces] This may be causing subsequent restaurant creation failures');
        return this.getFallbackResults(query);
      }

      if (data.status !== 'OK') {
        console.error('[GooglePlaces] Google Places API error:', data.status, data.error_message);
        console.error('[GooglePlaces] Full error response:', JSON.stringify(data));
        return this.getFallbackResults(query);
      }

      console.log(`[GooglePlaces] Found ${data.results?.length || 0} results`);
      return data.results || [];
    } catch (error) {
      console.error('[GooglePlaces] Error searching places:', error);
      return this.getFallbackResults(query);
    }
  }

  /**
   * Get detailed information about a specific place
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    if (!this.apiKey) {
      return null;
    }

    try {
      const url = `${this.baseUrl}/details/json`;
      const params = new URLSearchParams({
        place_id: placeId,
        key: this.apiKey,
        fields: 'place_id,formatted_address,name,geometry,address_components,business_status,types',
      });

      const response = await fetch(`${url}?${params}`);
      const data = await response.json();

      if (data.status !== 'OK') {
        console.error('Google Places API error:', data.status, data.error_message);
        return null;
      }

      return data.result;
    } catch (error) {
      console.error('Error getting place details:', error);
      return null;
    }
  }

  /**
   * Verify an address using Google Places API (fallback to manual if geocoding not available)
   */
  async verifyAddress(address: string): Promise<LocationVerification> {
    console.log(`[GooglePlaces] Verifying address: ${address}`);

    if (!address || address.trim() === '') {
      console.error('[GooglePlaces] Empty address provided');
      throw new Error('Address is required for verification');
    }

    if (!this.apiKey) {
      console.warn('[GooglePlaces] No API key available, using fallback verification');
      return this.getFallbackVerification(address);
    }

    try {
      // Try Geocoding API first (most accurate for addresses)
      console.log(`[GooglePlaces] Attempting geocoding for: ${address}`);
      const geocodingResult = await this.geocodeAddress(address);

      if (geocodingResult) {
        console.log(`[GooglePlaces] ✅ Using geocoding result`);
        return this.createVerificationFromGeocoding(address, geocodingResult);
      }

      // Fallback to Places API if geocoding fails/unavailable
      console.log(`[GooglePlaces] ⚠️ Geocoding failed, trying Places API`);
      const placesResult = await this.findPlaceFromText(address);

      if (placesResult) {
        console.log(`[GooglePlaces] ✅ Using places result`);
        return this.createVerificationFromPlace(address, placesResult);
      }

      // Final fallback to manual verification
      console.log(`[GooglePlaces] ⚠️ Both APIs failed, using manual verification`);
      return this.getFallbackVerification(address);

    } catch (error) {
      console.error('[GooglePlaces] ❌ Error verifying address:', error);
      console.error('[GooglePlaces] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        address: address,
        hasApiKey: !!this.apiKey
      });
      return this.getFallbackVerification(address);
    }
  }

  /**
   * Create verification result from geocoding data
   */
  private createVerificationFromGeocoding(originalAddress: string, geocodingResult: any): LocationVerification {
    const addressComponents = this.parseGeocodingComponents(geocodingResult.address_components);
    const confidence = this.calculateGeocodingConfidence(originalAddress, geocodingResult.formatted_address, geocodingResult.types);
    const completeness = this.calculateAddressCompleteness(addressComponents, geocodingResult.formatted_address);
    const isVerified = confidence >= 70 && completeness.isComplete;

    return {
      address: originalAddress,
      formattedAddress: geocodingResult.formatted_address,
      coordinates: {
        lat: geocodingResult.geometry.location.lat,
        lng: geocodingResult.geometry.location.lng,
      },
      verified: isVerified,
      verificationSource: 'google_places',
      verificationDate: new Date(),
      confidence,
      placeId: geocodingResult.place_id,
      addressComponents,
      completeness,
    };
  }

  /**
   * Create verification result from places data
   */
  private createVerificationFromPlace(originalAddress: string, placeResult: any): LocationVerification {
    const addressComponents = this.parseAddressComponents(placeResult.address_components || []);
    const confidence = this.calculateConfidence(originalAddress, placeResult.formatted_address, placeResult.types);
    const completeness = this.calculateAddressCompleteness(addressComponents, placeResult.formatted_address);
    const isVerified = confidence >= 70 && completeness.isComplete;

    return {
      address: originalAddress,
      formattedAddress: placeResult.formatted_address,
      coordinates: {
        lat: placeResult.geometry.location.lat,
        lng: placeResult.geometry.location.lng,
      },
      verified: isVerified,
      verificationSource: 'google_places',
      verificationDate: new Date(),
      confidence,
      placeId: placeResult.place_id,
      addressComponents,
      completeness,
    };
  }

  /**
   * Geocode an address using Google Geocoding API (with timeout protection)
   */
  private async geocodeAddress(address: string): Promise<any | null> {
    try {
      // Apply rate limiting
      await this.rateLimit();

      const url = 'https://maps.googleapis.com/maps/api/geocode/json';
      const params = new URLSearchParams({
        address: address,
        key: this.apiKey,
      });

      const fullUrl = `${url}?${params}`;
      console.log(`[GooglePlaces] Making geocoding request for: ${address}`);

      // Add timeout protection (5 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(fullUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      console.log(`[GooglePlaces] Geocoding response status:`, response.status);

      const data = await response.json();
      console.log(`[GooglePlaces] Geocoding response status:`, data.status);

      if (data.status === 'REQUEST_DENIED') {
        console.warn('[GooglePlaces] Geocoding API not authorized - this is expected if not enabled');
        return null;
      }

      if (data.status === 'OVER_QUERY_LIMIT') {
        console.error('[GooglePlaces] ❌ QUOTA EXCEEDED: Geocoding API quota limit reached');
        console.error('[GooglePlaces] This may be causing subsequent restaurant creation failures');
        return null;
      }

      if (data.status !== 'OK') {
        console.error('[GooglePlaces] Geocoding API error:', data.status, data.error_message);
        console.error('[GooglePlaces] Full error response:', JSON.stringify(data));
        return null;
      }

      if (!data.results || data.results.length === 0) {
        console.log('[GooglePlaces] No geocoding results found');
        return null;
      }

      console.log(`[GooglePlaces] Found ${data.results.length} geocoding results`);
      return data.results[0]; // Return the first (most relevant) result
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('[GooglePlaces] Geocoding request timed out');
      } else {
        console.error('[GooglePlaces] Error in geocoding:', error);
      }
      return null;
    }
  }

  /**
   * Find place using Google Places API "Find Place from Text" (with timeout protection)
   */
  private async findPlaceFromText(address: string): Promise<any | null> {
    try {
      // Apply rate limiting
      await this.rateLimit();

      const url = `${this.baseUrl}/findplacefromtext/json`;
      const params = new URLSearchParams({
        input: address,
        inputtype: 'textquery',
        fields: 'place_id,formatted_address,geometry,address_components,types',
        key: this.apiKey,
      });

      const fullUrl = `${url}?${params}`;
      console.log(`[GooglePlaces] Making findplacefromtext request for: ${address}`);

      // Add timeout protection (5 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(fullUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      console.log(`[GooglePlaces] FindPlace response status:`, response.status);

      const data = await response.json();
      console.log(`[GooglePlaces] FindPlace response status:`, data.status);

      if (data.status === 'OVER_QUERY_LIMIT') {
        console.error('[GooglePlaces] ❌ QUOTA EXCEEDED: FindPlace API quota limit reached');
        console.error('[GooglePlaces] This may be causing subsequent restaurant creation failures');
        return null;
      }

      if (data.status !== 'OK') {
        console.error('[GooglePlaces] FindPlace API error:', data.status, data.error_message);
        console.error('[GooglePlaces] Full error response:', JSON.stringify(data));
        return null;
      }

      if (!data.candidates || data.candidates.length === 0) {
        console.log('[GooglePlaces] No place candidates found');
        return null;
      }

      console.log(`[GooglePlaces] Found ${data.candidates.length} place candidates`);
      return data.candidates[0]; // Return the first (most relevant) candidate
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('[GooglePlaces] FindPlace request timed out');
      } else {
        console.error('[GooglePlaces] Error in findplacefromtext:', error);
      }
      return null;
    }
  }

  /**
   * Parse Google Places address components into our format
   */
  private parseAddressComponents(components: PlaceDetails['address_components']): AddressComponents {
    const result: AddressComponents = {};

    for (const component of components) {
      if (component.types.includes('street_number')) {
        result.street_number = component.long_name;
      } else if (component.types.includes('route')) {
        result.route = component.long_name;
      } else if (component.types.includes('locality')) {
        result.locality = component.long_name;
      } else if (component.types.includes('administrative_area_level_1')) {
        result.administrative_area_level_1 = component.long_name;
      } else if (component.types.includes('administrative_area_level_2')) {
        result.administrative_area_level_2 = component.long_name;
      } else if (component.types.includes('country')) {
        result.country = component.long_name;
      } else if (component.types.includes('postal_code')) {
        result.postal_code = component.long_name;
      }
    }

    return result;
  }

  /**
   * Parse Google Geocoding API address components into our format
   */
  private parseGeocodingComponents(components: any[]): AddressComponents {
    const result: AddressComponents = {};

    for (const component of components) {
      if (component.types.includes('street_number')) {
        result.street_number = component.long_name;
      } else if (component.types.includes('route')) {
        result.route = component.long_name;
      } else if (component.types.includes('locality')) {
        result.locality = component.long_name;
      } else if (component.types.includes('postal_town')) {
        // Use postal_town as locality if locality is not available (common in UK)
        if (!result.locality) {
          result.locality = component.long_name;
        }
      } else if (component.types.includes('administrative_area_level_1')) {
        result.administrative_area_level_1 = component.long_name;
      } else if (component.types.includes('administrative_area_level_2')) {
        result.administrative_area_level_2 = component.long_name;
      } else if (component.types.includes('country')) {
        result.country = component.long_name;
      } else if (component.types.includes('postal_code')) {
        result.postal_code = component.long_name;
      }
    }

    return result;
  }

  /**
   * Calculate confidence score for geocoding results
   */
  private calculateGeocodingConfidence(originalAddress: string, formattedAddress: string, types: string[]): number {
    let confidence = 60; // Higher base confidence for geocoding

    // Boost confidence for specific address types
    if (types.includes('street_address')) {
      confidence += 25; // Exact street address
    } else if (types.includes('premise')) {
      confidence += 20; // Building/premise
    } else if (types.includes('route')) {
      confidence += 15; // Street/route
    }

    // Check address similarity (simple string matching)
    const similarity = this.calculateStringSimilarity(
      originalAddress.toLowerCase(),
      formattedAddress.toLowerCase()
    );
    confidence += similarity * 15;

    return Math.min(100, Math.max(0, confidence));
  }

  /**
   * Calculate confidence score based on address matching and place types
   */
  private calculateConfidence(originalAddress: string, formattedAddress: string, types: string[]): number {
    let confidence = 50; // Base confidence

    // Check if it's a business establishment
    if (types.includes('establishment') || types.includes('restaurant') || types.includes('food')) {
      confidence += 30;
    }

    // Check address similarity (simple string matching)
    const similarity = this.calculateStringSimilarity(
      originalAddress.toLowerCase(),
      formattedAddress.toLowerCase()
    );
    confidence += similarity * 20;

    return Math.min(100, Math.max(0, confidence));
  }

  /**
   * Calculate address completeness score for billing precision (optimized)
   */
  private calculateAddressCompleteness(addressComponents: AddressComponents, formattedAddress: string): {
    score: number;
    issues: string[];
    isComplete: boolean;
  } {
    const issues: string[] = [];
    let score = 0;

    // Quick checks for essential components
    if (addressComponents.street_number) score += 25;
    else issues.push("Missing building/house number");

    if (addressComponents.route) score += 25;
    else issues.push("Missing street name");

    if (addressComponents.locality) score += 25;
    else issues.push("Missing city/locality");

    if (addressComponents.postal_code) score += 15;
    else issues.push("Missing postal code");

    if (addressComponents.country) score += 10;
    else issues.push("Missing country");

    // Quick broad location check (simplified)
    const addressLower = formattedAddress.toLowerCase();
    if (addressLower.includes(' city') || addressLower.includes(' county') || addressLower.includes(' district')) {
      score = Math.max(0, score - 20);
      issues.push("Address appears to cover a broad geographic area");
    }

    // Quick generic address check
    const commaCount = (formattedAddress.match(/,/g) || []).length;
    if (commaCount <= 1) {
      score = Math.max(0, score - 15);
      issues.push("Address is too generic");
    }

    const isComplete = score >= 80 && issues.length <= 1;

    return { score, issues, isComplete };
  }

  /**
   * Fast string similarity calculation (optimized for performance)
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    // Limit string length to prevent performance issues
    const maxLength = 100;
    const s1 = str1.length > maxLength ? str1.substring(0, maxLength) : str1;
    const s2 = str2.length > maxLength ? str2.substring(0, maxLength) : str2;

    if (s1 === s2) return 1.0;
    if (s1.length === 0 || s2.length === 0) return 0.0;

    // Use simple character-based similarity for performance
    return this.fastSimilarity(s1.toLowerCase(), s2.toLowerCase());
  }

  /**
   * Fast similarity calculation using character overlap (much faster than Levenshtein)
   */
  private fastSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    // Count common characters
    let matches = 0;
    const used = new Set<number>();

    for (let i = 0; i < shorter.length; i++) {
      for (let j = 0; j < longer.length; j++) {
        if (!used.has(j) && shorter[i] === longer[j]) {
          matches++;
          used.add(j);
          break;
        }
      }
    }

    return matches / longer.length;
  }

  /**
   * Parse address components manually when Google Places API is not available
   */
  private parseAddressManually(address: string): AddressComponents {
    const components: AddressComponents = {};
    const addressLower = address.toLowerCase();

    // Split address by commas and clean up
    const parts = address.split(',').map(part => part.trim());

    // Extract postal code using shared patterns
    for (const part of parts) {
      if (GooglePlacesService.POSTAL_CODE_PATTERNS.UK.test(part)) {
        const match = part.match(GooglePlacesService.POSTAL_CODE_PATTERNS.UK);
        if (match) {
          components.postal_code = match[0];
          components.country = 'United Kingdom'; // Infer country from UK postcode
        }
      } else if (GooglePlacesService.POSTAL_CODE_PATTERNS.US.test(part)) {
        const match = part.match(GooglePlacesService.POSTAL_CODE_PATTERNS.US);
        if (match) {
          components.postal_code = match[0];
        }
      } else if (GooglePlacesService.POSTAL_CODE_PATTERNS.CANADA.test(part)) {
        const match = part.match(GooglePlacesService.POSTAL_CODE_PATTERNS.CANADA);
        if (match) {
          components.postal_code = match[0];
          components.country = 'Canada';
        }
      }
    }

    // Extract country (usually last part)
    const lastPart = parts[parts.length - 1];
    if (GooglePlacesService.COUNTRY_INDICATORS.some(country => lastPart.toLowerCase().includes(country))) {
      components.country = lastPart;
    }

    // Extract street number (usually first number in first part)
    const firstPart = parts[0];
    const streetNumberMatch = firstPart.match(GooglePlacesService.ADDRESS_PATTERNS.STREET_NUMBER_EXTRACT);
    if (streetNumberMatch) {
      components.street_number = streetNumberMatch[0];
      // Extract street name (rest of first part after number)
      const streetName = firstPart.replace(streetNumberMatch[0], '').trim();
      if (streetName) {
        components.route = streetName;
      }
    }

    // Extract locality/city (usually second-to-last part, or second part if no country specified)
    if (parts.length >= 2) {
      const cityIndex = components.country ? parts.length - 2 : parts.length - 1;
      if (cityIndex >= 0 && cityIndex < parts.length) {
        let cityPart = parts[cityIndex];
        // Remove postal code from city part if present
        if (components.postal_code) {
          cityPart = cityPart.replace(components.postal_code, '').trim();
        }
        if (cityPart) {
          components.locality = cityPart;
        }
      }
    }

    return components;
  }

  /**
   * Fallback verification when Google Places API is not available
   */
  private getFallbackVerification(address: string): LocationVerification {
    console.log(`[GooglePlaces] Using fallback verification for: ${address}`);

    // Parse address components manually
    const addressComponents = this.parseAddressManually(address);

    // Calculate completeness based on parsed components
    const completeness = this.calculateAddressCompleteness(addressComponents, address);

    // Calculate confidence score based on address structure and content
    let confidence = this.calculateFallbackConfidence(address, addressComponents);

    return {
      address,
      formattedAddress: address,
      coordinates: { lat: 0, lng: 0 }, // Default coordinates
      verified: confidence >= 70, // Consider verified if we parsed most components
      verificationSource: 'manual',
      verificationDate: new Date(),
      confidence,
      addressComponents,
      completeness,
    };
  }

  /**
   * Calculate confidence for fallback verification based on address structure
   */
  private calculateFallbackConfidence(address: string, addressComponents: AddressComponents): number {
    let confidence = 30; // Base confidence for manual parsing

    // Boost confidence based on address structure
    const addressLower = address.toLowerCase().trim();

    // Check for numeric street number at start
    if (GooglePlacesService.ADDRESS_PATTERNS.STREET_NUMBER.test(address.trim())) {
      confidence += 25; // Has street number
    }

    // Check for common street indicators
    if (GooglePlacesService.STREET_INDICATORS.some(indicator => addressLower.includes(indicator))) {
      confidence += 20; // Has street type
    }

    // Check for city/town indicators
    if (GooglePlacesService.CITY_INDICATORS.some(indicator => addressLower.includes(indicator))) {
      confidence += 10; // Has city indicator
    }

    // Check for postal code patterns
    const hasValidPostalCode = Object.values(GooglePlacesService.POSTAL_CODE_PATTERNS)
      .some(pattern => pattern.test(address));

    if (hasValidPostalCode) {
      confidence += 15; // Has valid postal code format
    }

    // Check for country indicators
    if (GooglePlacesService.COUNTRY_INDICATORS.some(country => addressLower.includes(country))) {
      confidence += 10; // Has country
    }

    // Boost confidence for longer, more detailed addresses
    const parts = address.split(',').map(p => p.trim()).filter(p => p.length > 0);
    if (parts.length >= 3) {
      confidence += 15; // Multi-part address
    }

    // Boost confidence based on successfully parsed components
    if (addressComponents.street_number) confidence += 5;
    if (addressComponents.route) confidence += 5;
    if (addressComponents.locality) confidence += 5;
    if (addressComponents.postal_code) confidence += 5;
    if (addressComponents.country) confidence += 5;

    return Math.min(95, Math.max(30, confidence)); // Cap between 30-95% for manual parsing
  }

  /**
   * Fallback search results when Google Places API is not available
   */
  private getFallbackResults(query: string): PlaceDetails[] {
    console.log(`[GooglePlaces] Generating fallback results for: ${query}`);

    // Don't return fallback results for autocomplete - it's better to show no suggestions
    // than to show a single unhelpful suggestion that just repeats the query
    if (query.length < 10) {
      console.log(`[GooglePlaces] Query too short for fallback suggestions`);
      return [];
    }

    // For longer queries, provide some basic suggestions based on common patterns
    const suggestions: PlaceDetails[] = [];

    // If it looks like a partial address, suggest completing it
    if (query.trim().match(GooglePlacesService.ADDRESS_PATTERNS.PARTIAL_ADDRESS)) {
      // Looks like "123 Main" - suggest some common completions
      GooglePlacesService.STREET_TYPES_CAPITALIZED.slice(0, 5).forEach((type, index) => {
        suggestions.push({
          place_id: `fallback-street-${index}-${Date.now()}`,
          formatted_address: `${query} ${type}`,
          name: `${query} ${type}`,
          geometry: { location: { lat: 0, lng: 0 } },
          address_components: [],
          types: ['route'],
        });
      });
    } else {
      // For other queries, just return the query as a single suggestion
      suggestions.push({
        place_id: `fallback-${Date.now()}`,
        formatted_address: query,
        name: query,
        geometry: { location: { lat: 0, lng: 0 } },
        address_components: [],
        types: ['establishment'],
      });
    }

    console.log(`[GooglePlaces] Generated ${suggestions.length} fallback suggestions`);
    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }
}

// Export singleton instance
export const googlePlacesService = new GooglePlacesService();
