/**
 * Restaurant Hook - Firebase Firestore Implementation
 * 
 * This hook provides restaurant state management using Firebase Firestore.
 * It replaces the previous NoCodeBackend integration with a stable solution.
 */

"use client";
import { useState, useCallback, useEffect } from "react";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import {
  clientRestaurantService,
  Restaurant,
  CreateRestaurantInput,
  UpdateRestaurantInput
} from "@/lib/services/clientRestaurantService";

// Use CreateRestaurantInput as the main input type
export type RestaurantInput = CreateRestaurantInput;

export function useRestaurants() {
  const { user } = useFirebaseAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  


  const fetchRestaurants = useCallback(async (signal?: AbortSignal) => {
    console.log('[useRestaurants] fetchRestaurants called, user:', user ? 'authenticated' : 'not authenticated');

    if (!user) {
      console.log('[useRestaurants] No user, setting empty array');
      setRestaurants([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log('[useRestaurants] 🔥 Using client-side Firestore service');
      const restaurantsArray = await clientRestaurantService.getRestaurantsByOwner(user.uid);

      if (signal?.aborted) {
        console.log('[useRestaurants] Request aborted');
        return;
      }

      console.log('[useRestaurants] ✅ Fetched restaurants directly from Firestore:', restaurantsArray);
      console.log('[useRestaurants] Array length:', restaurantsArray.length);

      setRestaurants(restaurantsArray);
      console.log(`[useRestaurants] ✅ Successfully loaded ${restaurantsArray.length} restaurants`);

    } catch (err) {
      if (!signal?.aborted) {
        console.error('[useRestaurants] Fetch error:', err);
        setError(err instanceof Error ? err.message : "Failed to fetch restaurants.");
        setRestaurants([]); // Ensure we always have an array
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [user]);

  const saveRestaurant = useCallback(async (input: RestaurantInput) => {
    if (!user) {
      throw new Error('Authentication required');
    }

    setLoading(true);
    setError("");

    try {
      console.log('[useRestaurants] 🚀 Creating restaurant with client service:', input);

      const restaurant = await clientRestaurantService.createRestaurant(user.uid, input);

      console.log('[useRestaurants] ✅ Restaurant created successfully:', restaurant);

      // Add to local state
      setRestaurants((prev) => [restaurant, ...prev]);

      return restaurant;
    } catch (err) {
      console.error('[useRestaurants] Save error:', err);
      setError(err instanceof Error ? err.message : "Failed to save restaurant.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateRestaurant = useCallback(async (id: string, input: Partial<RestaurantInput>) => {
    if (!user) {
      throw new Error('Authentication required');
    }

    setLoading(true);
    setError("");

    try {
      console.log('[useRestaurants] 🔄 Updating restaurant with client service:', id, input);

      const restaurant = await clientRestaurantService.updateRestaurant(id, user.uid, input);

      console.log('[useRestaurants] ✅ Restaurant updated successfully:', restaurant);

      // Update local state
      setRestaurants((prev) => prev.map(r => r.id === id ? restaurant : r));
      if (selectedRestaurant?.id === id) {
        setSelectedRestaurant(restaurant);
      }

      return restaurant;
    } catch (err) {
      console.error('[useRestaurants] Update error:', err);
      setError(err instanceof Error ? err.message : "Failed to update restaurant.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, selectedRestaurant]);

  const deleteRestaurant = useCallback(async (id: string) => {
    if (!user) {
      throw new Error('Authentication required');
    }

    setLoading(true);
    setError("");

    try {
      console.log('[useRestaurants] 🗑️ Deleting restaurant with client service:', id);

      await clientRestaurantService.deleteRestaurant(id, user.uid);

      console.log('[useRestaurants] ✅ Restaurant deleted successfully');

      // Remove from local state
      setRestaurants((prev) => prev.filter(r => r.id !== id));

      if (selectedRestaurant?.id === id) {
        setSelectedRestaurant(null);
      }

      return true;
    } catch (err) {
      console.error('[useRestaurants] Delete error:', err);
      setError(err instanceof Error ? err.message : "Failed to delete restaurant.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, selectedRestaurant]);

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
    selectedRestaurant,
    setSelectedRestaurant
  };
}

// Export types for compatibility
export type { Restaurant };
