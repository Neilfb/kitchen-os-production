/**
 * Server-Side Restaurant Service - Firebase Admin SDK
 * 
 * This service provides restaurant operations for API routes using Firebase Admin SDK.
 * It replaces the removed serverRestaurantService with a clean, conflict-free implementation.
 */

import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      console.error('[ServerRestaurantService] Missing Firebase credentials');
    } else {
      // Handle private key formatting
      if (privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
      }

      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log('[ServerRestaurantService] Firebase Admin initialized');
    }
  } catch (error) {
    console.error('[ServerRestaurantService] Firebase Admin initialization failed:', error);
  }
}

// Type definitions
export interface Restaurant {
  id: string;
  name: string;
  address?: string;
  website?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  location?: {
    lat: number;
    lng: number;
    formatted: string;
    placeId?: string;
  };
  ownerId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateRestaurantInput {
  name?: string;
  address?: string;
  website?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  location?: {
    lat: number;
    lng: number;
    formatted: string;
    placeId?: string;
  };
  isActive?: boolean;
}

// Collection names
export const COLLECTIONS = {
  RESTAURANTS: 'restaurants',
  MENUS: 'menus',
  MENU_ITEMS: 'menuItems',
  USERS: 'users',
  ANALYTICS: 'analytics'
} as const;

class ServerRestaurantService {
  private collectionName = COLLECTIONS.RESTAURANTS;

  private getDb() {
    return getFirestore();
  }

  /**
   * Get a restaurant by ID with ownership verification
   */
  async getRestaurant(restaurantId: string, ownerId: string): Promise<Restaurant | null> {
    try {
      console.log('[ServerRestaurantService] Getting restaurant:', restaurantId, 'for owner:', ownerId);
      
      const db = this.getDb();
      const docRef = db.collection(this.collectionName).doc(restaurantId);
      const doc = await docRef.get();

      if (!doc.exists) {
        console.log('[ServerRestaurantService] Restaurant not found:', restaurantId);
        return null;
      }

      const data = doc.data()!;
      
      // Verify ownership
      if (data.ownerId !== ownerId) {
        console.log('[ServerRestaurantService] Access denied - owner mismatch');
        return null;
      }

      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Restaurant;

    } catch (error) {
      console.error('[ServerRestaurantService] Get restaurant error:', error);
      throw error;
    }
  }

  /**
   * Get all restaurants for an owner
   */
  async getRestaurantsByOwner(ownerId: string): Promise<Restaurant[]> {
    try {
      console.log('[ServerRestaurantService] Getting restaurants for owner:', ownerId);
      
      const db = this.getDb();
      const query = db.collection(this.collectionName)
        .where('ownerId', '==', ownerId)
        .where('isActive', '==', true)
        .orderBy('createdAt', 'desc');

      const snapshot = await query.get();
      
      const restaurants: Restaurant[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        restaurants.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Restaurant);
      });

      console.log(`[ServerRestaurantService] Found ${restaurants.length} restaurants`);
      return restaurants;

    } catch (error) {
      console.error('[ServerRestaurantService] Get restaurants error:', error);
      throw error;
    }
  }

  /**
   * Update a restaurant with ownership verification
   */
  async updateRestaurant(restaurantId: string, ownerId: string, updateData: UpdateRestaurantInput): Promise<Restaurant> {
    try {
      console.log('[ServerRestaurantService] Updating restaurant:', restaurantId);
      
      // First verify ownership
      const existing = await this.getRestaurant(restaurantId, ownerId);
      if (!existing) {
        throw new Error('Restaurant not found or access denied');
      }

      const db = this.getDb();
      const docRef = db.collection(this.collectionName).doc(restaurantId);
      
      const updatePayload = {
        ...updateData,
        updatedAt: Timestamp.now()
      };

      await docRef.update(updatePayload);
      
      // Return updated restaurant
      const updated = await this.getRestaurant(restaurantId, ownerId);
      if (!updated) {
        throw new Error('Failed to retrieve updated restaurant');
      }

      console.log('[ServerRestaurantService] Restaurant updated successfully');
      return updated;

    } catch (error) {
      console.error('[ServerRestaurantService] Update restaurant error:', error);
      throw error;
    }
  }

  /**
   * Create a new restaurant
   */
  async createRestaurant(ownerId: string, restaurantData: Omit<Restaurant, 'id' | 'ownerId' | 'createdAt' | 'updatedAt' | 'isActive'>): Promise<Restaurant> {
    try {
      console.log('[ServerRestaurantService] Creating restaurant for owner:', ownerId);

      const db = this.getDb();
      const now = Timestamp.now();

      const newRestaurant = {
        ...restaurantData,
        ownerId,
        isActive: true,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await db.collection(this.collectionName).add(newRestaurant);

      // Get the created document
      const createdDoc = await docRef.get();
      if (!createdDoc.exists) {
        throw new Error('Failed to retrieve created restaurant');
      }

      const data = createdDoc.data()!;
      const restaurant = {
        id: createdDoc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Restaurant;

      console.log('[ServerRestaurantService] Restaurant created successfully:', restaurant.id);
      return restaurant;

    } catch (error) {
      console.error('[ServerRestaurantService] Create restaurant error:', error);
      throw error;
    }
  }

  /**
   * Delete a restaurant (soft delete) with ownership verification
   */
  async deleteRestaurant(restaurantId: string, ownerId: string): Promise<void> {
    try {
      console.log('[ServerRestaurantService] Deleting restaurant:', restaurantId);

      // First verify ownership
      const existing = await this.getRestaurant(restaurantId, ownerId);
      if (!existing) {
        throw new Error('Restaurant not found or access denied');
      }

      const db = this.getDb();
      const docRef = db.collection(this.collectionName).doc(restaurantId);

      await docRef.update({
        isActive: false,
        updatedAt: Timestamp.now()
      });

      console.log('[ServerRestaurantService] Restaurant soft deleted successfully');

    } catch (error) {
      console.error('[ServerRestaurantService] Delete restaurant error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const serverRestaurantService = new ServerRestaurantService();
