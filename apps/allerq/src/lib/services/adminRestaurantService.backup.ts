/**
 * Restaurant Service - Firebase Admin SDK Implementation
 * 
 * This service provides all restaurant-related operations using Firebase Admin SDK
 * for server-side operations. This fixes the "client is offline" issue.
 */

import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Ultra-robust Firebase Admin SDK initialization
function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    console.log('🔧 Firebase Admin already initialized');
    return;
  }

  try {
    console.log('🔧 Starting Firebase Admin initialization...');

    // Get environment variables with fallbacks
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    console.log('🔧 Environment variables check:', {
      hasProjectId: !!projectId,
      hasClientEmail: !!clientEmail,
      hasPrivateKey: !!privateKey,
      projectIdValue: projectId,
      clientEmailValue: clientEmail,
      privateKeyLength: privateKey?.length
    });

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(`Missing Firebase credentials: projectId=${!!projectId}, clientEmail=${!!clientEmail}, privateKey=${!!privateKey}`);
    }

    // Ultra-robust private key processing
    console.log('🔧 Processing private key...');
    console.log('🔧 Raw private key (first 100 chars):', privateKey.substring(0, 100));

    // Strategy 1: Remove outer quotes (any type)
    const quoteChars = ['"', "'", '`'];
    for (const quote of quoteChars) {
      if (privateKey.startsWith(quote) && privateKey.endsWith(quote)) {
        privateKey = privateKey.slice(1, -1);
        console.log('🔧 Removed outer quotes, new length:', privateKey.length);
        break;
      }
    }

    // Strategy 2: Handle escaped newlines
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
      console.log('🔧 Replaced \\n with actual newlines');
    }

    // Strategy 3: Handle missing newlines in base64 content
    if (!privateKey.includes('\n') && privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      // Split the key into header, content, and footer
      const beginMarker = '-----BEGIN PRIVATE KEY-----';
      const endMarker = '-----END PRIVATE KEY-----';

      if (privateKey.includes(beginMarker) && privateKey.includes(endMarker)) {
        const startIndex = privateKey.indexOf(beginMarker) + beginMarker.length;
        const endIndex = privateKey.indexOf(endMarker);
        const content = privateKey.substring(startIndex, endIndex);

        // Add newlines every 64 characters in the base64 content
        const formattedContent = content.replace(/(.{64})/g, '$1\n');
        privateKey = `${beginMarker}\n${formattedContent}\n${endMarker}\n`;
        console.log('🔧 Added newlines to base64 content');
      }
    }

    // Strategy 4: Ensure proper header/footer formatting
    if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----\n')) {
      privateKey = privateKey.replace('-----BEGIN PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----\n');
    }
    if (!privateKey.endsWith('\n-----END PRIVATE KEY-----\n')) {
      privateKey = privateKey.replace('-----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----\n');
    }

    // Final validation
    const hasBegin = privateKey.includes('-----BEGIN PRIVATE KEY-----');
    const hasEnd = privateKey.includes('-----END PRIVATE KEY-----');
    const hasNewlines = privateKey.includes('\n');

    console.log('🔧 Final private key validation:', {
      hasBegin,
      hasEnd,
      hasNewlines,
      length: privateKey.length,
      startsCorrectly: privateKey.startsWith('-----BEGIN PRIVATE KEY-----'),
      endsCorrectly: privateKey.endsWith('-----END PRIVATE KEY-----\n')
    });

    if (!hasBegin || !hasEnd) {
      throw new Error('Invalid private key format: missing BEGIN/END markers');
    }

    // Initialize Firebase Admin
    const credentials = {
      projectId,
      clientEmail,
      privateKey,
    };

    console.log('🔧 Initializing Firebase Admin with processed credentials...');
    initializeApp({
      credential: cert(credentials),
    });

    console.log('✅ Firebase Admin initialized successfully!');

  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    console.error('❌ Full error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown',
      envCheck: {
        hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
        privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length,
        privateKeyStart: process.env.FIREBASE_PRIVATE_KEY?.substring(0, 50)
      }
    });
    throw error; // Re-throw to prevent silent failures
  }
}

// Initialize Firebase Admin SDK lazily
let adminDb: any = null;

function getAdminDb() {
  if (!adminDb) {
    initializeFirebaseAdmin();
    adminDb = getFirestore();
  }
  return adminDb;
}

// Collection names
export const COLLECTIONS = {
  RESTAURANTS: 'restaurants',
  MENUS: 'menus',
  MENU_ITEMS: 'menuItems',
  USERS: 'users',
  ANALYTICS: 'analytics'
} as const;

// Type definitions
export interface AdminRestaurant {
  id?: string;
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
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
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

export interface Restaurant extends Omit<AdminRestaurant, 'createdAt' | 'updatedAt'> {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

class AdminRestaurantService {
  private get collection() {
    return getAdminDb().collection(COLLECTIONS.RESTAURANTS);
  }

  /**
   * Create a new restaurant
   */
  async createRestaurant(ownerId: string, data: CreateRestaurantInput): Promise<Restaurant> {
    try {
      console.log('[AdminRestaurantService] 🚀 Starting restaurant creation for user:', ownerId);
      console.log('[AdminRestaurantService] 📝 Input data:', data);

      // Validate required fields
      if (!data.name || typeof data.name !== 'string') {
        console.error('[AdminRestaurantService] ❌ Validation failed: Restaurant name is required');
        throw new Error('Restaurant name is required');
      }

      if (!ownerId || typeof ownerId !== 'string') {
        console.error('[AdminRestaurantService] ❌ Validation failed: Valid owner ID is required');
        throw new Error('Valid owner ID is required');
      }

      console.log('[AdminRestaurantService] ✅ Validation passed');

      const now = Timestamp.now();
      const restaurantData: Omit<AdminRestaurant, 'id'> = {
        name: data.name.trim(),
        address: data.address?.trim() || '',
        website: data.website?.trim() || '',
        phone: data.phone?.trim() || '',
        email: data.email?.trim() || '',
        logoUrl: data.logoUrl?.trim() || '',
        location: data.location || undefined,
        ownerId,
        isActive: true,
        createdAt: now,
        updatedAt: now
      };

      console.log('[AdminRestaurantService] 📊 Prepared restaurant data:', {
        ...restaurantData,
        createdAt: 'Timestamp',
        updatedAt: 'Timestamp'
      });

      console.log('[AdminRestaurantService] 🔥 Attempting to write to Firestore collection:', COLLECTIONS.RESTAURANTS);

      const docRef = await this.collection.add(restaurantData);
      console.log('[AdminRestaurantService] ✅ Document written successfully with ID:', docRef.id);

      // Get the created document
      console.log('[AdminRestaurantService] 📖 Retrieving created document...');
      const createdDoc = await docRef.get();

      if (!createdDoc.exists) {
        console.error('[AdminRestaurantService] ❌ Failed to retrieve created document');
        throw new Error('Failed to retrieve created restaurant');
      }

      console.log('[AdminRestaurantService] ✅ Document retrieved successfully');

      const restaurant = {
        id: createdDoc.id,
        ...createdDoc.data()
      } as AdminRestaurant & { id: string };

      console.log('[AdminRestaurantService] 🎉 Restaurant created successfully:', {
        id: restaurant.id,
        name: restaurant.name,
        ownerId: restaurant.ownerId
      });

      const convertedRestaurant = this.convertToRestaurant(restaurant);
      console.log('[AdminRestaurantService] 🔄 Restaurant converted for return:', {
        id: convertedRestaurant.id,
        name: convertedRestaurant.name,
        createdAt: convertedRestaurant.createdAt
      });

      return convertedRestaurant;
    } catch (error) {
      console.error('[AdminRestaurantService] 💥 Create error details:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        ownerId: ownerId,
        dataName: data?.name
      });
      throw error;
    }
  }

  /**
   * Get all restaurants for a specific owner
   */
  async getRestaurantsByOwner(ownerId: string): Promise<Restaurant[]> {
    try {
      console.log('[AdminRestaurantService] Getting restaurants for owner:', ownerId);
      
      if (!ownerId || typeof ownerId !== 'string') {
        throw new Error('Valid owner ID is required');
      }

      const query = this.collection
        .where('ownerId', '==', ownerId)
        .where('isActive', '==', true)
        .orderBy('createdAt', 'desc');

      const querySnapshot = await query.get();
      
      const restaurants = querySnapshot.docs.map(doc => {
        const restaurant = {
          id: doc.id,
          ...doc.data()
        } as AdminRestaurant & { id: string };
        return this.convertToRestaurant(restaurant);
      });

      console.log(`[AdminRestaurantService] Found ${restaurants.length} restaurants for owner ${ownerId}`);
      return restaurants;
    } catch (error) {
      console.error('[AdminRestaurantService] Get restaurants error:', error);
      throw error;
    }
  }

  /**
   * Get a specific restaurant by ID
   * Use ownerId = 'public' for public access without ownership verification
   */
  async getRestaurant(restaurantId: string, ownerId: string): Promise<Restaurant | null> {
    try {
      console.log('[AdminRestaurantService] Getting restaurant:', restaurantId, 'for owner:', ownerId);

      if (!restaurantId) {
        throw new Error('Restaurant ID is required');
      }

      if (!ownerId) {
        throw new Error('Owner ID is required');
      }

      const docRef = this.collection.doc(restaurantId);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        console.log(`[AdminRestaurantService] Restaurant ${restaurantId} not found`);
        return null;
      }

      const restaurant = {
        id: docSnap.id,
        ...docSnap.data()
      } as AdminRestaurant & { id: string };
      
      // Verify ownership (skip for public access)
      if (ownerId !== 'public' && restaurant.ownerId !== ownerId) {
        console.warn(`[AdminRestaurantService] Access denied: Restaurant ${restaurantId} not owned by ${ownerId}`);
        return null;
      }

      return this.convertToRestaurant(restaurant);
    } catch (error) {
      console.error('[AdminRestaurantService] Get restaurant error:', error);
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
      console.log('[AdminRestaurantService] Updating restaurant:', restaurantId);
      
      // First verify ownership
      const existing = await this.getRestaurant(restaurantId, ownerId);
      if (!existing) {
        throw new Error('Restaurant not found or access denied');
      }

      const updateData: Partial<AdminRestaurant> = {
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

      const docRef = this.collection.doc(restaurantId);
      await docRef.update(updateData);

      // Get updated document
      const updatedDoc = await docRef.get();
      if (!updatedDoc.exists) {
        throw new Error('Failed to retrieve updated restaurant');
      }

      const restaurant = {
        id: updatedDoc.id,
        ...updatedDoc.data()
      } as AdminRestaurant & { id: string };
      
      console.log('[AdminRestaurantService] Restaurant updated successfully:', restaurant.id);
      return this.convertToRestaurant(restaurant);
    } catch (error) {
      console.error('[AdminRestaurantService] Update error:', error);
      throw error;
    }
  }

  /**
   * Delete a restaurant (soft delete)
   */
  async deleteRestaurant(restaurantId: string, ownerId: string): Promise<void> {
    try {
      console.log('[AdminRestaurantService] Deleting restaurant:', restaurantId);
      
      // First verify ownership
      const existing = await this.getRestaurant(restaurantId, ownerId);
      if (!existing) {
        throw new Error('Restaurant not found or access denied');
      }

      // Soft delete by setting isActive to false
      const docRef = this.collection.doc(restaurantId);
      await docRef.update({
        isActive: false,
        updatedAt: Timestamp.now()
      });

      console.log(`[AdminRestaurantService] Restaurant ${restaurantId} soft deleted`);
    } catch (error) {
      console.error('[AdminRestaurantService] Delete error:', error);
      throw error;
    }
  }

  /**
   * Convert Admin Restaurant to Restaurant type
   */
  private convertToRestaurant(adminRestaurant: AdminRestaurant & { id: string }): Restaurant {
    return {
      ...adminRestaurant,
      createdAt: adminRestaurant.createdAt.toDate(),
      updatedAt: adminRestaurant.updatedAt.toDate()
    };
  }
}

// Export singleton instance
export const adminRestaurantService = new AdminRestaurantService();
export type { Restaurant, CreateRestaurantInput, UpdateRestaurantInput };
