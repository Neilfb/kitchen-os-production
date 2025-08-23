"use client";
import { useState, useCallback, useEffect } from "react";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { auth } from "@/lib/firebase/config";

export interface Restaurant {
  id: number; // NoCodeBackend uses numeric IDs
  name: string;
  address?: string;
  owner_id?: string; // Firebase user UID
  logo_url?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  region?: string | null;
  location?: string | null;
  created_at?: number;
  updated_at?: number;
}

export interface RestaurantInput {
  name: string;
  address?: string;
  website?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  location?: string;
}

export function useFirebaseRestaurants() {
  const { user } = useFirebaseAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const getAuthHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    if (auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken();
        headers["Authorization"] = `Bearer ${token}`;
      } catch (error) {
        console.error('[Firebase Restaurants] Failed to get auth token:', error);
        throw new Error('Authentication failed');
      }
    }

    return headers;
  }, []);

  const fetchRestaurants = useCallback(async (signal?: AbortSignal) => {
    console.log('[Firebase Restaurants] fetchRestaurants called, user:', user ? 'authenticated' : 'not authenticated');

    if (!user) {
      console.log('[Firebase Restaurants] No user, setting empty array');
      setRestaurants([]);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const headers = await getAuthHeaders();

      const res = await fetch("/api/firebase-restaurants", {
        signal,
        headers
      });
      
      if (signal?.aborted) return;
      
      if (!res.ok) {
        if (res.status === 401) {
          console.warn('[Firebase Restaurants] Authentication failed, user may need to re-login');
          setError('Authentication expired. Please sign in again.');
          setRestaurants([]);
          return;
        }
        throw new Error(`Failed to fetch restaurants (${res.status})`);
      }
      
      const response = await res.json();
      console.log('[Firebase Restaurants] Raw API response:', response);

      // Extract restaurants array from response with strict validation
      let restaurantsArray = response.data || response.restaurants || response || [];

      // Ensure we always have an array
      if (!Array.isArray(restaurantsArray)) {
        console.warn('[Firebase Restaurants] ⚠️ Response is not an array, converting:', {
          type: typeof restaurantsArray,
          value: restaurantsArray,
          isNull: restaurantsArray === null,
          isUndefined: restaurantsArray === undefined
        });
        restaurantsArray = [];
      }

      console.log('[Firebase Restaurants] Extracted restaurants array:', restaurantsArray);
      console.log('[Firebase Restaurants] Is array?', Array.isArray(restaurantsArray));
      console.log('[Firebase Restaurants] Array length:', restaurantsArray.length);

      setRestaurants(restaurantsArray);
      console.log(`[Firebase Restaurants] ✅ Fetched ${restaurantsArray.length} restaurants`);
      
    } catch (err) {
      if (!signal?.aborted) {
        console.error('[Firebase Restaurants] Fetch error:', err);
        setError(err instanceof Error ? err.message : "Failed to fetch restaurants.");
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [user, getAuthHeaders]);

  const saveRestaurant = useCallback(async (input: RestaurantInput) => {
    if (!user) {
      throw new Error('Authentication required');
    }

    setLoading(true);
    setError("");
    try {
      console.log('[Firebase Restaurants] Creating restaurant:', input);
      
      const headers = await getAuthHeaders();

      const res = await fetch("/api/firebase-restaurants", {
        method: "POST",
        headers,
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[Firebase Restaurants] Create failed:', res.status, errorData);

        if (res.status === 401) {
          throw new Error('Session expired. Please sign in again.');
        }

        throw new Error(errorData.error || `Failed to save restaurant (${res.status})`);
      }

      const { data: restaurant } = await res.json();
      console.log('[Firebase Restaurants] ✅ Restaurant created:', restaurant);

      // Refresh restaurant list
      await fetchRestaurants();

      return restaurant;
    } catch (err) {
      console.error('[Firebase Restaurants] Save error:', err);
      setError(err instanceof Error ? err.message : "Failed to save restaurant.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, getAuthHeaders, fetchRestaurants]);

  const getRestaurant = useCallback(async (id: number, signal?: AbortSignal) => {
    if (!user) return null;

    try {
      const headers = await getAuthHeaders();

      const res = await fetch(`/api/firebase-restaurants/${id}`, {
        signal,
        headers
      });
      
      if (signal?.aborted) return null;
      
      if (!res.ok) {
        throw new Error("Failed to fetch restaurant");
      }
      
      const data = await res.json();
      setSelectedRestaurant(data.data);
      return data.data;
    } catch (err) {
      if (!signal?.aborted) {
        console.error('[Firebase Restaurants] Get restaurant error:', err);
        setError(err instanceof Error ? err.message : "Failed to fetch restaurant");
      }
      return null;
    }
  }, [user, getAuthHeaders]);

  const updateRestaurant = useCallback(async (id: number, input: RestaurantInput) => {
    if (!user) {
      throw new Error('Authentication required');
    }

    setLoading(true);
    setError("");
    try {
      const headers = await getAuthHeaders();

      const res = await fetch(`/api/firebase-restaurants/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(input),
      });
      
      if (!res.ok) {
        throw new Error("Failed to update restaurant");
      }
      
      const { data: restaurant } = await res.json();
      
      // Update local state with safe array handling
      setRestaurants((prev) => {
        const safeArray = Array.isArray(prev) ? prev : [];
        return safeArray.map(r => r.id === id ? restaurant : r);
      });
      if (selectedRestaurant?.id === id) {
        setSelectedRestaurant(restaurant);
      }
      
      return restaurant;
    } catch (err) {
      console.error('[Firebase Restaurants] Update error:', err);
      setError(err instanceof Error ? err.message : "Failed to update restaurant.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, getAuthHeaders, selectedRestaurant]);

  const deleteRestaurant = useCallback(async (id: number) => {
    if (!user) {
      throw new Error('Authentication required');
    }

    setLoading(true);
    setError("");
    try {
      const headers = await getAuthHeaders();

      const res = await fetch(`/api/firebase-restaurants/${id}`, {
        method: "DELETE",
        headers
      });
      
      if (!res.ok) {
        throw new Error("Failed to delete restaurant");
      }
      
      // Remove from local state with safe array handling
      setRestaurants((prev) => {
        const safeArray = Array.isArray(prev) ? prev : [];
        return safeArray.filter(r => r.id !== id);
      });
      
      if (selectedRestaurant?.id === id) {
        setSelectedRestaurant(null);
      }
      
      return true;
    } catch (err) {
      console.error('[Firebase Restaurants] Delete error:', err);
      setError(err instanceof Error ? err.message : "Failed to delete restaurant.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, getAuthHeaders, selectedRestaurant]);

  // Auto-fetch restaurants when user changes
  useEffect(() => {
    const abortController = new AbortController();
    fetchRestaurants(abortController.signal);
    return () => {
      abortController.abort();
    };
  }, [fetchRestaurants]);

  return { 
    restaurants, 
    loading, 
    error, 
    fetchRestaurants, 
    saveRestaurant, 
    updateRestaurant,
    deleteRestaurant,
    setRestaurants,
    getRestaurant,
    selectedRestaurant
  };
}
