/**
 * Restaurant Service - Firebase Firestore Implementation
 * 
 * This service provides all restaurant-related operations using Firebase Firestore.
 * It replaces the previous NoCodeBackend integration with a stable, type-safe solution.
 */

import {
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';

import {
  db,
  COLLECTIONS,
  FirestoreRestaurant,
  convertFirestoreDoc,
  handleFirestoreOperation,
  getTypedCollection,
  getTypedDoc,
  createTimestamp,
  validateRequiredFields,
  logFirestoreOperation,
  FirestoreError
} from '@/lib/firebase/firestore';

// Input types for restaurant operations
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

// Output type for restaurant data
export interface Restaurant extends Omit<FirestoreRestaurant, 'createdAt' | 'updatedAt'> {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

class FirestoreRestaurantService {
  private readonly collectionRef = getTypedCollection(COLLECTIONS.RESTAURANTS);

  /**
   * Create a new restaurant
   */
  async createRestaurant(ownerId: string, data: CreateRestaurantInput): Promise<Restaurant> {
    return handleFirestoreOperation(async () => {
      // Validate required fields
      validateRequiredFields(data, ['name'], 'createRestaurant');
      
      // Validate owner ID
      if (!ownerId || typeof ownerId !== 'string') {
        throw new FirestoreError('Valid owner ID is required', 'invalid-argument', 'createRestaurant');
      }

      const restaurantData: Omit<FirestoreRestaurant, 'id'> = {
        name: data.name.trim(),
        address: data.address?.trim() || '',
        website: data.website?.trim() || '',
        phone: data.phone?.trim() || '',
        email: data.email?.trim() || '',
        logoUrl: data.logoUrl?.trim() || '',
        location: data.location || undefined,
        ownerId,
        isActive: true,
        createdAt: createTimestamp() as Timestamp,
        updatedAt: createTimestamp() as Timestamp
      };

      logFirestoreOperation('CREATE', COLLECTIONS.RESTAURANTS, undefined, restaurantData);

      const docRef = await addDoc(this.collectionRef, restaurantData);
      
      // Get the created document to return with proper types
      const createdDoc = await getDoc(docRef);
      if (!createdDoc.exists()) {
        throw new FirestoreError('Failed to retrieve created restaurant', 'not-found', 'createRestaurant');
      }

      const restaurant = convertFirestoreDoc<FirestoreRestaurant>(createdDoc as any);
      
      return this.convertToRestaurant(restaurant);
    }, 'createRestaurant');
  }

  /**
   * Get all restaurants for a specific owner
   */
  async getRestaurantsByOwner(ownerId: string): Promise<Restaurant[]> {
    return handleFirestoreOperation(async () => {
      if (!ownerId || typeof ownerId !== 'string') {
        throw new FirestoreError('Valid owner ID is required', 'invalid-argument', 'getRestaurantsByOwner');
      }

      logFirestoreOperation('QUERY', COLLECTIONS.RESTAURANTS, undefined, { ownerId });

      const q = query(
        this.collectionRef,
        where('ownerId', '==', ownerId),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      
      const restaurants = querySnapshot.docs.map(doc => {
        const restaurant = convertFirestoreDoc<FirestoreRestaurant>(doc);
        return this.convertToRestaurant(restaurant);
      });

      console.log(`[FirestoreRestaurantService] Found ${restaurants.length} restaurants for owner ${ownerId}`);
      return restaurants;
    }, 'getRestaurantsByOwner');
  }

  /**
   * Get a specific restaurant by ID
   */
  async getRestaurant(restaurantId: string, ownerId: string): Promise<Restaurant | null> {
    return handleFirestoreOperation(async () => {
      if (!restaurantId || !ownerId) {
        throw new FirestoreError('Restaurant ID and owner ID are required', 'invalid-argument', 'getRestaurant');
      }

      logFirestoreOperation('GET', COLLECTIONS.RESTAURANTS, restaurantId);

      const docRef = getTypedDoc(COLLECTIONS.RESTAURANTS, restaurantId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.log(`[FirestoreRestaurantService] Restaurant ${restaurantId} not found`);
        return null;
      }

      const restaurant = convertFirestoreDoc<FirestoreRestaurant>(docSnap as any);
      
      // Verify ownership
      if (restaurant.ownerId !== ownerId) {
        console.warn(`[FirestoreRestaurantService] Access denied: Restaurant ${restaurantId} not owned by ${ownerId}`);
        return null;
      }

      return this.convertToRestaurant(restaurant);
    }, 'getRestaurant');
  }

  /**
   * Update a restaurant
   */
  async updateRestaurant(
    restaurantId: string, 
    ownerId: string, 
    data: UpdateRestaurantInput
  ): Promise<Restaurant> {
    return handleFirestoreOperation(async () => {
      // First verify ownership
      const existing = await this.getRestaurant(restaurantId, ownerId);
      if (!existing) {
        throw new FirestoreError('Restaurant not found or access denied', 'permission-denied', 'updateRestaurant');
      }

      const updateData: Partial<FirestoreRestaurant> = {
        ...data,
        updatedAt: createTimestamp() as Timestamp
      };

      // Clean up string fields
      if (updateData.name) updateData.name = updateData.name.trim();
      if (updateData.address) updateData.address = updateData.address.trim();
      if (updateData.website) updateData.website = updateData.website.trim();
      if (updateData.phone) updateData.phone = updateData.phone.trim();
      if (updateData.email) updateData.email = updateData.email.trim();
      if (updateData.logoUrl) updateData.logoUrl = updateData.logoUrl.trim();

      logFirestoreOperation('UPDATE', COLLECTIONS.RESTAURANTS, restaurantId, updateData);

      const docRef = getTypedDoc(COLLECTIONS.RESTAURANTS, restaurantId);
      await updateDoc(docRef, updateData);

      // Get updated document
      const updatedDoc = await getDoc(docRef);
      if (!updatedDoc.exists()) {
        throw new FirestoreError('Failed to retrieve updated restaurant', 'not-found', 'updateRestaurant');
      }

      const restaurant = convertFirestoreDoc<FirestoreRestaurant>(updatedDoc as any);
      return this.convertToRestaurant(restaurant);
    }, 'updateRestaurant');
  }

  /**
   * Delete a restaurant (soft delete)
   */
  async deleteRestaurant(restaurantId: string, ownerId: string): Promise<void> {
    return handleFirestoreOperation(async () => {
      // First verify ownership
      const existing = await this.getRestaurant(restaurantId, ownerId);
      if (!existing) {
        throw new FirestoreError('Restaurant not found or access denied', 'permission-denied', 'deleteRestaurant');
      }

      logFirestoreOperation('DELETE', COLLECTIONS.RESTAURANTS, restaurantId);

      // Soft delete by setting isActive to false
      const docRef = getTypedDoc(COLLECTIONS.RESTAURANTS, restaurantId);
      await updateDoc(docRef, {
        isActive: false,
        updatedAt: createTimestamp()
      });

      console.log(`[FirestoreRestaurantService] Restaurant ${restaurantId} soft deleted`);
    }, 'deleteRestaurant');
  }

  /**
   * Convert Firestore document to Restaurant type
   */
  private convertToRestaurant(firestoreRestaurant: FirestoreRestaurant & { id: string }): Restaurant {
    return {
      ...firestoreRestaurant,
      createdAt: firestoreRestaurant.createdAt.toDate(),
      updatedAt: firestoreRestaurant.updatedAt.toDate()
    };
  }
}

// Export singleton instance
export const firestoreRestaurantService = new FirestoreRestaurantService();
export type { Restaurant, CreateRestaurantInput, UpdateRestaurantInput };
