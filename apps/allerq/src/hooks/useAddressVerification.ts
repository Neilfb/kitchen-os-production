"use client";

import { useState, useCallback } from 'react';
import { LocationVerification, PlaceDetails } from '@/lib/location/googlePlaces';

interface UseAddressVerificationReturn {
  verifyAddress: (address: string) => Promise<LocationVerification | null>;
  searchPlaces: (query: string) => Promise<PlaceDetails[]>;
  loading: boolean;
  error: string | null;
}

export function useAddressVerification(): UseAddressVerificationReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyAddress = useCallback(async (address: string): Promise<LocationVerification | null> => {
    if (!address || address.trim() === '') {
      setError('Address is required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`[useAddressVerification] Verifying address: ${address}`);

      const response = await fetch('/api/location/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: address.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to verify address');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Address verification failed');
      }

      console.log(`[useAddressVerification] Verification successful:`, {
        verified: data.verification.verified,
        confidence: data.verification.confidence,
      });

      return data.verification;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify address';
      console.error('[useAddressVerification] Error:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchPlaces = useCallback(async (query: string): Promise<PlaceDetails[]> => {
    if (!query || query.trim() === '') {
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`[useAddressVerification] Searching places: ${query}`);

      const response = await fetch(`/api/location/verify?q=${encodeURIComponent(query.trim())}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to search places');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Place search failed');
      }

      console.log(`[useAddressVerification] Found ${data.places.length} places`);

      return data.places || [];

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search places';
      console.error('[useAddressVerification] Search error:', errorMessage);
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    verifyAddress,
    searchPlaces,
    loading,
    error,
  };
}
