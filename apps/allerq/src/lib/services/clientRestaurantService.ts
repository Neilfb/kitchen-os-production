/**
 * Client-Side Restaurant Service - Firebase Firestore
 * 
 * This service uses Firebase client SDK for all restaurant operations.
 * No server-side Firebase Admin SDK required.
 */

import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// Types
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

export interface CreateRestaurantInput {
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
}

export interface UpdateRestaurantInput extends Partial<CreateRestaurantInput> {
  isActive?: boolean;
}

class ClientRestaurantService {
  private readonly collectionName = 'restaurants';

  /**
   * Create a new restaurant
   */
  async createRestaurant(ownerId: string, data: CreateRestaurantInput): Promise<Restaurant> {
    try {
      console.log('[ClientRestaurantService] 🚀 Creating restaurant for user:', ownerId);
      console.log('[ClientRestaurantService] 📝 Restaurant data:', data);

      if (!data.name || typeof data.name !== 'string') {
        throw new Error('Restaurant name is required');
      }

      if (!ownerId || typeof ownerId !== 'string') {
        throw new Error('Valid owner ID is required');
      }

      const now = Timestamp.now();

      // Sanitize location data - Firestore doesn't allow undefined values
      let sanitizedLocation = null;
      if (data.location &&
          typeof data.location.lat === 'number' &&
          typeof data.location.lng === 'number' &&
          data.location.formatted) {
        sanitizedLocation = {
          lat: data.location.lat,
          lng: data.location.lng,
          formatted: data.location.formatted,
          placeId: data.location.placeId || null
        };
      }

      const restaurantData = {
        name: data.name.trim(),
        address: data.address?.trim() || '',
        website: data.website?.trim() || '',
        phone: data.phone?.trim() || '',
        email: data.email?.trim() || '',
        logoUrl: data.logoUrl?.trim() || '',
        location: sanitizedLocation,
        ownerId,
        isActive: true,
        createdAt: now,
        updatedAt: now
      };

      console.log('[ClientRestaurantService] 🔥 Writing to Firestore...');
      console.log('[ClientRestaurantService] 📊 Restaurant data to write:', restaurantData);

      const docRef = await addDoc(collection(db, this.collectionName), restaurantData);

      console.log('[ClientRestaurantService] ✅ Document written with ID:', docRef.id);

      // Get the created document
      const createdDoc = await getDoc(docRef);
      if (!createdDoc.exists()) {
        throw new Error('Failed to retrieve created restaurant');
      }

      const restaurant = {
        id: createdDoc.id,
        ...createdDoc.data(),
        createdAt: createdDoc.data().createdAt.toDate(),
        updatedAt: createdDoc.data().updatedAt.toDate()
      } as Restaurant;

      console.log('[ClientRestaurantService] 🎉 Restaurant created successfully:', restaurant.id);
      return restaurant;

    } catch (error) {
      console.error('[ClientRestaurantService] ❌ Create error:', error);
      console.error('[ClientRestaurantService] ❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any)?.code,
        name: (error as any)?.name,
        stack: error instanceof Error ? error.stack : undefined,
        ownerId: ownerId,
        restaurantName: data?.name
      });

      // Provide user-friendly error message
      if ((error as any)?.code === 'permission-denied') {
        throw new Error('Permission denied: Unable to create restaurant. Please check your authentication.');
      } else if ((error as any)?.code === 'unavailable') {
        throw new Error('Firestore is temporarily unavailable. Please try again.');
      } else {
        throw new Error(`Failed to create restaurant: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Get all restaurants for a specific owner
   */
  async getRestaurantsByOwner(ownerId: string): Promise<Restaurant[]> {
    try {
      console.log('[ClientRestaurantService] 📖 Getting restaurants for owner:', ownerId);
      console.log('[ClientRestaurantService] 🔍 Database instance check:', {
        dbExists: !!db,
        dbType: typeof db,
        dbConstructor: db?.constructor?.name
      });

      if (!ownerId || typeof ownerId !== 'string') {
        throw new Error('Valid owner ID is required');
      }

      if (!db) {
        throw new Error('Firestore database instance is not available');
      }

      console.log('[ClientRestaurantService] 🔥 Creating Firestore query...');
      const q = query(
        collection(db, this.collectionName),
        where('ownerId', '==', ownerId),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );

      console.log('[ClientRestaurantService] 📡 Executing Firestore query...');
      const querySnapshot = await getDocs(q);

      console.log('[ClientRestaurantService] 📊 Query results:', {
        docsCount: querySnapshot.docs.length,
        empty: querySnapshot.empty
      });

      const restaurants = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as Restaurant[];

      console.log(`[ClientRestaurantService] ✅ Found ${restaurants.length} restaurants for owner ${ownerId}`);
      return restaurants;

    } catch (error) {
      console.error('[ClientRestaurantService] ❌ Get restaurants error:', error);
      console.error('[ClientRestaurantService] ❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any)?.code,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  /**
   * Get a specific restaurant by ID
   */
  async getRestaurant(restaurantId: string, ownerId: string): Promise<Restaurant | null> {
    try {
      console.log('[ClientRestaurantService] 📖 Getting restaurant:', restaurantId);

      if (!restaurantId || !ownerId) {
        throw new Error('Restaurant ID and owner ID are required');
      }

      const docRef = doc(db, this.collectionName, restaurantId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.log(`[ClientRestaurantService] Restaurant ${restaurantId} not found`);
        return null;
      }

      const restaurant = {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt.toDate(),
        updatedAt: docSnap.data().updatedAt.toDate()
      } as Restaurant;

      // Verify ownership
      if (restaurant.ownerId !== ownerId) {
        console.warn(`[ClientRestaurantService] Access denied: Restaurant ${restaurantId} not owned by ${ownerId}`);
        return null;
      }

      return restaurant;

    } catch (error) {
      console.error('[ClientRestaurantService] ❌ Get restaurant error:', error);
      throw error;
    }
  }

  /**
   * Update a restaurant
   */
  async updateRestaurant(
    restaurantId: string, 
    ownerId: string, 
    data: UpdateRestaurantInput
  ): Promise<Restaurant> {
    try {
      console.log('[ClientRestaurantService] 🔄 Updating restaurant:', restaurantId);

      // First verify ownership
      const existing = await this.getRestaurant(restaurantId, ownerId);
      if (!existing) {
        throw new Error('Restaurant not found or access denied');
      }

      const updateData = {
        ...data,
        updatedAt: Timestamp.now()
      };

      // Clean up string fields
      if (updateData.name) updateData.name = updateData.name.trim();
      if (updateData.address) updateData.address = updateData.address.trim();
      if (updateData.website) updateData.website = updateData.website.trim();
      if (updateData.phone) updateData.phone = updateData.phone.trim();
      if (updateData.email) updateData.email = updateData.email.trim();
      if (updateData.logoUrl) updateData.logoUrl = updateData.logoUrl.trim();

      const docRef = doc(db, this.collectionName, restaurantId);
      await updateDoc(docRef, updateData);

      // Get updated document
      const updatedDoc = await getDoc(docRef);
      if (!updatedDoc.exists()) {
        throw new Error('Failed to retrieve updated restaurant');
      }

      const restaurant = {
        id: updatedDoc.id,
        ...updatedDoc.data(),
        createdAt: updatedDoc.data().createdAt.toDate(),
        updatedAt: updatedDoc.data().updatedAt.toDate()
      } as Restaurant;

      console.log('[ClientRestaurantService] ✅ Restaurant updated successfully:', restaurant.id);
      return restaurant;

    } catch (error) {
      console.error('[ClientRestaurantService] ❌ Update error:', error);
      throw error;
    }
  }

  /**
   * Delete a restaurant (soft delete)
   */
  async deleteRestaurant(restaurantId: string, ownerId: string): Promise<void> {
    try {
      console.log('[ClientRestaurantService] 🗑️ Deleting restaurant:', restaurantId);

      // First verify ownership
      const existing = await this.getRestaurant(restaurantId, ownerId);
      if (!existing) {
        throw new Error('Restaurant not found or access denied');
      }

      // Soft delete by setting isActive to false
      const docRef = doc(db, this.collectionName, restaurantId);
      await updateDoc(docRef, {
        isActive: false,
        updatedAt: Timestamp.now()
      });

      console.log(`[ClientRestaurantService] ✅ Restaurant ${restaurantId} soft deleted`);

    } catch (error) {
      console.error('[ClientRestaurantService] ❌ Delete error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const clientRestaurantService = new ClientRestaurantService();
export type { Restaurant, CreateRestaurantInput, UpdateRestaurantInput };
