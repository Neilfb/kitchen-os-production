// Firebase + NoCodeBackend Restaurant Service
// Uses Firebase Auth for user management and NoCodeBackend for restaurant data

import { noCodeBackendFetch } from '@/lib/noCodeBackendFetch';

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
  location?: string | null; // JSON string in NoCodeBackend
  created_at?: number; // Timestamp in NoCodeBackend
  updated_at?: number; // Timestamp in NoCodeBackend
  external_id?: string | null;
}

export interface CreateRestaurantData {
  name: string;
  address?: string;
  website?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  location?: string;
}

class FirebaseRestaurantService {
  /**
   * Create a new restaurant associated with Firebase user
   */
  async createRestaurant(userId: string, data: CreateRestaurantData): Promise<Restaurant> {
    try {
      console.log(`[FirebaseRestaurantService] Creating restaurant for user: ${userId}`);
      
      const restaurantData = {
        name: data.name,
        address: data.address || '',
        website: data.website || '',
        phone: data.phone || '',
        email: data.email || '',
        logo_url: data.logo_url || null,
        location: data.location || null,
        owner_id: userId, // Firebase user UID
        created_at: Date.now(),
        updated_at: Date.now()
      };

      const response = await noCodeBackendFetch<Restaurant>('/create/restaurants', {
        method: 'POST',
        body: JSON.stringify(restaurantData)
      });

      console.log(`[FirebaseRestaurantService] ✅ Restaurant created:`, response);
      return response;
      
    } catch (error) {
      console.error('[FirebaseRestaurantService] Create restaurant failed:', error);
      throw error;
    }
  }

  /**
   * Get all restaurants for a Firebase user
   */
  async getRestaurants(userId: string): Promise<Restaurant[]> {
    try {
      console.log(`[FirebaseRestaurantService] Fetching restaurants for user: ${userId}`);
      
      // Search for restaurants by owner_id (Firebase UID)
      const response = await noCodeBackendFetch<Restaurant[]>('/search/restaurants', {
        method: 'POST',
        body: JSON.stringify({
          owner_id: userId
        })
      });

      console.log(`[FirebaseRestaurantService] ✅ Found ${response.length} restaurants for user ${userId}`);
      return response;
      
    } catch (error) {
      console.error('[FirebaseRestaurantService] Get restaurants failed:', error);
      throw error;
    }
  }

  /**
   * Get a specific restaurant by ID (with ownership check)
   */
  async getRestaurant(restaurantId: number, userId: string): Promise<Restaurant | null> {
    try {
      console.log(`[FirebaseRestaurantService] Fetching restaurant ${restaurantId} for user: ${userId}`);
      
      const response = await noCodeBackendFetch<Restaurant>(`/read/restaurants/${restaurantId}`);
      
      // Verify ownership
      if (response.owner_id !== userId) {
        console.warn(`[FirebaseRestaurantService] Access denied: Restaurant ${restaurantId} not owned by user ${userId}`);
        return null;
      }

      console.log(`[FirebaseRestaurantService] ✅ Restaurant found:`, response);
      return response;
      
    } catch (error) {
      console.error('[FirebaseRestaurantService] Get restaurant failed:', error);
      return null;
    }
  }

  /**
   * Update a restaurant (with ownership check)
   */
  async updateRestaurant(restaurantId: number, userId: string, data: Partial<CreateRestaurantData>): Promise<Restaurant> {
    try {
      console.log(`[FirebaseRestaurantService] Updating restaurant ${restaurantId} for user: ${userId}`);
      
      // First verify ownership
      const existing = await this.getRestaurant(restaurantId, userId);
      if (!existing) {
        throw new Error('Restaurant not found or access denied');
      }

      const updateData = {
        ...data,
        updated_at: Date.now()
      };

      const response = await noCodeBackendFetch<Restaurant>(`/update/restaurants/${restaurantId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      console.log(`[FirebaseRestaurantService] ✅ Restaurant updated:`, response);
      return response;
      
    } catch (error) {
      console.error('[FirebaseRestaurantService] Update restaurant failed:', error);
      throw error;
    }
  }

  /**
   * Delete a restaurant (with ownership check)
   */
  async deleteRestaurant(restaurantId: number, userId: string): Promise<void> {
    try {
      console.log(`[FirebaseRestaurantService] Deleting restaurant ${restaurantId} for user: ${userId}`);
      
      // First verify ownership
      const existing = await this.getRestaurant(restaurantId, userId);
      if (!existing) {
        throw new Error('Restaurant not found or access denied');
      }

      await noCodeBackendFetch(`/delete/restaurants/${restaurantId}`, {
        method: 'DELETE'
      });

      console.log(`[FirebaseRestaurantService] ✅ Restaurant deleted: ${restaurantId}`);
      
    } catch (error) {
      console.error('[FirebaseRestaurantService] Delete restaurant failed:', error);
      throw error;
    }
  }
}

export const firebaseRestaurantService = new FirebaseRestaurantService();
