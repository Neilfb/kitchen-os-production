/**
 * Server-side Menu Service - Firebase Firestore Implementation
 * 
 * This service provides menu CRUD operations using Firebase Firestore.
 * It's designed for server-side use with Firebase Admin SDK.
 */

import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin SDK if not already initialized
let firebaseInitialized = false;
if (!getApps().length) {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      console.warn('[ServerMenuService] Missing Firebase credentials - service will be unavailable');
      firebaseInitialized = false;
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
      console.log('[ServerMenuService] Firebase Admin initialized');
      firebaseInitialized = true;
    }
  } catch (error) {
    console.error('[ServerMenuService] Firebase Admin initialization failed:', error);
    firebaseInitialized = false;
  }
} else {
  firebaseInitialized = true;
}

export interface Menu {
  id: string;
  name: string;
  description: string;
  restaurantId: string;
  ownerId: string;
  status: 'draft' | 'published' | 'archived';
  region: 'EU' | 'US' | 'CA';
  createdAt: Date;
  updatedAt: Date;
  itemCount?: number;
  categories?: string[];
}

export interface CreateMenuInput {
  name: string;
  description: string;
  restaurantId: string;
  region?: 'EU' | 'US' | 'CA';
  status?: 'draft' | 'published';
}

export interface UpdateMenuInput {
  name?: string;
  description?: string;
  status?: 'draft' | 'published' | 'archived';
  region?: 'EU' | 'US' | 'CA';
}

class ServerMenuService {
  private db: any = null;
  private collection = 'menus';

  constructor() {
    if (firebaseInitialized) {
      this.db = getFirestore();
    }
  }

  private checkFirebaseInitialized() {
    if (!firebaseInitialized || !this.db) {
      throw new Error('Firebase not initialized - service unavailable');
    }
  }

  /**
   * Create a new menu
   */
  async createMenu(ownerId: string, input: CreateMenuInput): Promise<Menu> {
    this.checkFirebaseInitialized();
    console.log('[ServerMenuService] Creating menu:', input);

    // Verify restaurant ownership
    const restaurantDoc = await this.db.collection('restaurants').doc(input.restaurantId).get();
    if (!restaurantDoc.exists) {
      throw new Error('Restaurant not found');
    }

    const restaurant = restaurantDoc.data();
    if (restaurant?.ownerId !== ownerId) {
      throw new Error('Unauthorized: You can only create menus for your own restaurants');
    }

    const now = new Date();
    const menuData = {
      name: input.name,
      description: input.description,
      restaurantId: input.restaurantId,
      ownerId,
      status: input.status || 'draft',
      region: input.region || restaurant?.location?.country === 'US' ? 'US' : 
              restaurant?.location?.country === 'CA' ? 'CA' : 'EU',
      createdAt: now,
      updatedAt: now,
      itemCount: 0,
      categories: []
    };

    const docRef = await this.db.collection(this.collection).add(menuData);
    
    console.log('[ServerMenuService] Menu created with ID:', docRef.id);

    return {
      id: docRef.id,
      ...menuData
    };
  }

  /**
   * Get menu by ID
   */
  async getMenuById(menuId: string, ownerId?: string): Promise<Menu | null> {
    this.checkFirebaseInitialized();
    console.log('[ServerMenuService] Getting menu by ID:', menuId);

    const doc = await this.db.collection(this.collection).doc(menuId).get();
    
    if (!doc.exists) {
      return null;
    }

    const data = doc.data();
    
    // Check ownership if ownerId provided
    if (ownerId && data?.ownerId !== ownerId) {
      throw new Error('Unauthorized: You can only access your own menus');
    }

    return {
      id: doc.id,
      ...data
    } as Menu;
  }

  /**
   * Get all menus for a specific owner
   */
  async getMenusByOwner(ownerId: string): Promise<Menu[]> {
    this.checkFirebaseInitialized();
    console.log('[ServerMenuService] Getting menus for owner:', ownerId);

    const snapshot = await this.db
      .collection(this.collection)
      .where('ownerId', '==', ownerId)
      .orderBy('updatedAt', 'desc')
      .get();

    const menus: Menu[] = [];
    snapshot.forEach(doc => {
      menus.push({
        id: doc.id,
        ...doc.data()
      } as Menu);
    });

    console.log('[ServerMenuService] Found', menus.length, 'menus');
    return menus;
  }

  /**
   * Get all menus for a specific restaurant
   */
  async getMenusByRestaurant(restaurantId: string, ownerId?: string): Promise<Menu[]> {
    console.log('[ServerMenuService] Getting menus for restaurant:', restaurantId);

    let query = this.db
      .collection(this.collection)
      .where('restaurantId', '==', restaurantId);

    // Add owner filter if provided
    if (ownerId) {
      query = query.where('ownerId', '==', ownerId);
    }

    const snapshot = await query.orderBy('updatedAt', 'desc').get();

    const menus: Menu[] = [];
    snapshot.forEach(doc => {
      menus.push({
        id: doc.id,
        ...doc.data()
      } as Menu);
    });

    console.log('[ServerMenuService] Found', menus.length, 'menus for restaurant');
    return menus;
  }

  /**
   * Update menu
   */
  async updateMenu(menuId: string, ownerId: string, input: UpdateMenuInput): Promise<Menu> {
    console.log('[ServerMenuService] Updating menu:', menuId);

    // Verify ownership
    const existingMenu = await this.getMenuById(menuId, ownerId);
    if (!existingMenu) {
      throw new Error('Menu not found or unauthorized');
    }

    const updateData = {
      ...input,
      updatedAt: new Date()
    };

    await this.db.collection(this.collection).doc(menuId).update(updateData);

    return {
      ...existingMenu,
      ...updateData
    };
  }

  /**
   * Delete menu
   */
  async deleteMenu(menuId: string, ownerId: string): Promise<void> {
    console.log('[ServerMenuService] Deleting menu:', menuId);

    // Verify ownership
    const existingMenu = await this.getMenuById(menuId, ownerId);
    if (!existingMenu) {
      throw new Error('Menu not found or unauthorized');
    }

    await this.db.collection(this.collection).doc(menuId).delete();
    console.log('[ServerMenuService] Menu deleted successfully');
  }

  /**
   * Publish menu (make it publicly accessible)
   */
  async publishMenu(menuId: string, ownerId: string): Promise<Menu> {
    return this.updateMenu(menuId, ownerId, { status: 'published' });
  }

  /**
   * Archive menu
   */
  async archiveMenu(menuId: string, ownerId: string): Promise<Menu> {
    return this.updateMenu(menuId, ownerId, { status: 'archived' });
  }
}

// Export singleton instance
export const serverMenuService = new ServerMenuService();
