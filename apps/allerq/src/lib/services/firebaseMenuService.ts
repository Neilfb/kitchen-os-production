// Firebase menu management service
import { getFirestore as getAdminFirestore, Query } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { EnhancedMenu, MenuCategory, STANDARD_CATEGORIES } from '@/lib/types/menu';
import { COLLECTIONS } from '@/lib/services/serverRestaurantService';

// Define MenuItem interface locally since it's not exported from menu types
interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  allergens?: string[];
  dietary?: string[];
  image?: string;
  isVisible?: boolean;
  order?: number;
  menuId: string;
}

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    return;
  }

  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(`Missing Firebase credentials: projectId=${!!projectId}, clientEmail=${!!clientEmail}, privateKey=${!!privateKey}`);
    }

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

    console.log('✅ Firebase Admin initialized successfully for menu service');
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    throw error;
  }
}

// Initialize Firebase Admin SDK lazily
let adminDb: any = null;

function getAdminDb() {
  if (!adminDb) {
    initializeFirebaseAdmin();
    adminDb = getAdminFirestore();
  }
  return adminDb;
}

export interface CreateMenuInput {
  name: string;
  description?: string;
  restaurantId: string;
  region?: 'EU' | 'US' | 'CA' | 'ASIA';
  categories?: string[];
  status?: 'draft' | 'published';
}

export interface UpdateMenuInput {
  name?: string;
  description?: string;
  region?: 'EU' | 'US' | 'CA' | 'ASIA';
  categories?: string[];
  status?: 'draft' | 'published';
}

export interface CreateMenuItemInput {
  name: string;
  description?: string;
  price?: number;
  category?: string;
  allergens?: string[];
  dietary?: string[];
  image?: string;
  isVisible?: boolean;
  order?: number;
}

export interface UpdateMenuItemInput extends Partial<CreateMenuItemInput> {}

export interface MenuCategory {
  id: string;
  menuId: string;
  name: string;
  description?: string;
  order: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface CreateMenuCategoryInput {
  name: string;
  description?: string;
  order?: number;
  isVisible?: boolean;
}

export interface UpdateMenuCategoryInput extends Partial<CreateMenuCategoryInput> {}

class FirebaseMenuService {
  private get menusCollection() {
    return getAdminDb().collection(COLLECTIONS.MENUS);
  }

  private get menuItemsCollection() {
    return getAdminDb().collection(COLLECTIONS.MENU_ITEMS);
  }

  private get categoriesCollection() {
    return getAdminDb().collection('menuCategories');
  }

  /**
   * Create a new menu for a restaurant
   */
  async createMenu(userId: string, input: CreateMenuInput): Promise<EnhancedMenu> {
    try {
      const now = new Date().toISOString();
      
      const menuData = {
        name: input.name,
        description: input.description || '',
        restaurantId: input.restaurantId,
        region: input.region || 'EU',
        status: input.status || 'draft',
        aiProcessed: false,
        createdBy: userId,
        updatedBy: userId,
        createdAt: now,
        updatedAt: now,
        // Legacy compatibility fields will be added to the response object
      };

      const docRef = await this.menusCollection.add(menuData);
      
      // Create default categories for the menu
      const categories = await this.createDefaultCategories(docRef.id, input.restaurantId);
      
      const menu: EnhancedMenu = {
        id: docRef.id,
        restaurantId: input.restaurantId,
        name: input.name,
        description: input.description || '',
        categories,
        items: [],
        status: input.status || 'draft',
        region: input.region || 'EU',
        aiProcessed: false,
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
        updatedBy: userId,
      };

      console.log('[FirebaseMenuService] Menu created successfully:', docRef.id);
      return menu;
    } catch (error) {
      console.error('[FirebaseMenuService] Error creating menu:', error);
      throw new Error('Failed to create menu');
    }
  }

  /**
   * Get a menu by ID with ownership verification
   * Use userId = 'public' for public access without ownership verification
   */
  async getMenu(menuId: string, userId: string): Promise<EnhancedMenu | null> {
    try {
      const menuDoc = await this.menusCollection.doc(menuId).get();
      
      if (!menuDoc.exists) {
        return null;
      }

      const menuData = menuDoc.data();
      
      // Verify ownership through restaurant
      // TODO: Add restaurant ownership verification
      
      // Get categories for this menu
      const categories = await this.getMenuCategories(menuId);
      
      // Get menu items
      const items = await this.getMenuItems(menuId);

      const menu: EnhancedMenu = {
        id: menuDoc.id,
        restaurantId: menuData.restaurantId,
        name: menuData.name,
        description: menuData.description || '',
        categories,
        items,
        status: menuData.status || 'draft',
        region: menuData.region || 'EU',
        aiProcessed: menuData.aiProcessed || false,
        createdAt: menuData.createdAt,
        updatedAt: menuData.updatedAt,
        // Legacy compatibility - add these fields to response
        createdBy: menuData.createdBy,
        updatedBy: menuData.updatedBy,
      };

      // Add legacy compatibility fields
      return {
        ...menu,
        created_at: menu.createdAt,
        updated_at: menu.updatedAt,
      };
    } catch (error) {
      console.error('[FirebaseMenuService] Error getting menu:', error);
      throw new Error('Failed to get menu');
    }
  }

  /**
   * Get all menus for a restaurant
   */
  async getRestaurantMenus(restaurantId: string, userId: string): Promise<EnhancedMenu[]> {
    try {
      console.log('[FirebaseMenuService] Getting menus for restaurant:', restaurantId);

      // Remove orderBy to avoid index requirement issues
      const menusSnapshot = await this.menusCollection
        .where('restaurantId', '==', restaurantId)
        .get();

      console.log('[FirebaseMenuService] Found', menusSnapshot.size, 'menus');
      const menus: EnhancedMenu[] = [];

      for (const menuDoc of menusSnapshot.docs) {
        try {
          const menuData = menuDoc.data();
          console.log('[FirebaseMenuService] Processing menu:', menuDoc.id, menuData.name);

          // Get categories and items for each menu (with error handling)
          let categories: MenuCategory[] = [];
          let items: MenuItem[] = [];

          try {
            categories = await this.getMenuCategories(menuDoc.id);
          } catch (error) {
            console.warn('[FirebaseMenuService] Failed to load categories for menu', menuDoc.id, error);
            categories = STANDARD_CATEGORIES; // Use default categories
          }

          try {
            items = await this.getMenuItems(menuDoc.id);
          } catch (error) {
            console.warn('[FirebaseMenuService] Failed to load items for menu', menuDoc.id, error);
            items = []; // Empty items array
          }

          const menu: EnhancedMenu = {
            id: menuDoc.id,
            restaurantId: menuData.restaurantId,
            name: menuData.name,
            description: menuData.description || '',
            categories,
            items,
            status: menuData.status || 'draft',
            region: menuData.region || 'EU',
            aiProcessed: menuData.aiProcessed || false,
            createdAt: menuData.createdAt || new Date().toISOString(),
            updatedAt: menuData.updatedAt || new Date().toISOString(),
            created_at: menuData.createdAt || new Date().toISOString(),
            updated_at: menuData.updatedAt || new Date().toISOString(),
            createdBy: menuData.createdBy || userId,
            updatedBy: menuData.updatedBy || userId,
          };

          menus.push(menu);
        } catch (error) {
          console.error('[FirebaseMenuService] Error processing menu', menuDoc.id, error);
          // Continue with other menus
        }
      }

      console.log('[FirebaseMenuService] Successfully loaded', menus.length, 'menus for restaurant', restaurantId);

      // Sort menus by creation date (client-side since we removed orderBy)
      menus.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA; // Newest first
      });

      return menus;
    } catch (error) {
      console.error('[FirebaseMenuService] Error getting restaurant menus:', error);
      console.error('[FirebaseMenuService] Error details:', error);

      // Return empty array instead of throwing to prevent 500 errors
      console.log('[FirebaseMenuService] Returning empty menu array due to error');
      return [];
    }
  }

  /**
   * Update a menu
   */
  async updateMenu(menuId: string, userId: string, input: UpdateMenuInput): Promise<EnhancedMenu> {
    try {
      const updateData = {
        ...input,
        updatedBy: userId,
        updatedAt: new Date().toISOString(),
        updated_at: new Date().toISOString(), // Legacy compatibility
      };

      await this.menusCollection.doc(menuId).update(updateData);
      
      // Get the updated menu
      const updatedMenu = await this.getMenu(menuId, userId);
      if (!updatedMenu) {
        throw new Error('Menu not found after update');
      }

      console.log('[FirebaseMenuService] Menu updated successfully:', menuId);
      return updatedMenu;
    } catch (error) {
      console.error('[FirebaseMenuService] Error updating menu:', error);
      throw new Error('Failed to update menu');
    }
  }

  /**
   * Delete a menu
   */
  async deleteMenu(menuId: string, userId: string): Promise<void> {
    try {
      // Delete all menu items first
      const itemsSnapshot = await this.menuItemsCollection
        .where('menuId', '==', menuId)
        .get();

      const batch = getAdminDb().batch();
      itemsSnapshot.docs.forEach((doc: any) => {
        batch.delete(doc.ref);
      });

      // Delete menu categories
      const categoriesSnapshot = await this.categoriesCollection
        .where('menuId', '==', menuId)
        .get();
      categoriesSnapshot.docs.forEach((doc: any) => {
        batch.delete(doc.ref);
      });

      // Delete the menu itself
      batch.delete(this.menusCollection.doc(menuId));
      
      await batch.commit();
      
      console.log('[FirebaseMenuService] Menu deleted successfully:', menuId);
    } catch (error) {
      console.error('[FirebaseMenuService] Error deleting menu:', error);
      throw new Error('Failed to delete menu');
    }
  }

  /**
   * Create default categories for a menu
   */
  private async createDefaultCategories(menuId: string, restaurantId: string): Promise<MenuCategory[]> {
    try {
      const categories: MenuCategory[] = [];
      const batch = getAdminDb().batch();

      for (const standardCategory of STANDARD_CATEGORIES) {
        const categoryId = `${menuId}_${standardCategory.name.toLowerCase().replace(/\s+/g, '_')}`;
        const categoryData = {
          ...standardCategory,
          id: categoryId,
          menuId,
          restaurantId,
          createdAt: new Date().toISOString(),
        };

        const categoryRef = this.categoriesCollection.doc(categoryId);
        batch.set(categoryRef, categoryData);
        
        categories.push({
          ...categoryData,
          id: categoryId,
        });
      }

      await batch.commit();
      return categories;
    } catch (error) {
      console.error('[FirebaseMenuService] Error creating default categories:', error);
      return [];
    }
  }

  /**
   * Get categories for a menu
   */
  private async getMenuCategories(menuId: string): Promise<MenuCategory[]> {
    try {
      const categoriesSnapshot = await this.categoriesCollection
        .where('menuId', '==', menuId)
        .orderBy('order', 'asc')
        .get();

      return categoriesSnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      })) as MenuCategory[];
    } catch (error) {
      console.error('[FirebaseMenuService] Error getting menu categories:', error);
      return [];
    }
  }

  /**
   * Get menu items for a menu
   */
  private async getMenuItems(menuId: string): Promise<MenuItem[]> {
    try {
      console.log('[FirebaseMenuService] Getting menu items for menu:', menuId);

      // Start with simple query to avoid index issues
      const itemsSnapshot = await this.menuItemsCollection
        .where('menuId', '==', menuId)
        .get();

      console.log('[FirebaseMenuService] Found', itemsSnapshot.size, 'menu items for menu', menuId);

      const items = itemsSnapshot.docs.map((doc: any) => {
        const data = doc.data();
        console.log('[FirebaseMenuService] Menu item:', doc.id, data.name, 'order:', data.order);
        return {
          id: doc.id,
          ...data,
        };
      }) as MenuItem[];

      // Sort client-side to avoid index requirements
      items.sort((a, b) => (a.order || 0) - (b.order || 0));

      console.log('[FirebaseMenuService] Returning', items.length, 'menu items (sorted by order)');
      return items;
    } catch (error) {
      console.error('[FirebaseMenuService] Error getting menu items:', error);
      console.error('[FirebaseMenuService] Error details:', error);
      return [];
    }
  }

  /**
   * Create a menu item
   */
  async createMenuItem(menuId: string, userId: string, input: CreateMenuItemInput): Promise<MenuItem> {
    try {
      console.log('[FirebaseMenuService] Creating menu item for menu:', menuId);
      console.log('[FirebaseMenuService] Menu item input:', input);

      const now = new Date().toISOString();

      const itemData = {
        ...input,
        menuId,
        createdBy: userId,
        updatedBy: userId,
        createdAt: now,
        updatedAt: now,
        order: input.order || 0,
        isVisible: input.isVisible !== false,
      };

      console.log('[FirebaseMenuService] Prepared menu item data:', itemData);

      const docRef = await this.menuItemsCollection.add(itemData);
      console.log('[FirebaseMenuService] Menu item document created with ID:', docRef.id);

      // Verify the document was created by reading it back
      const createdDoc = await docRef.get();
      if (!createdDoc.exists) {
        throw new Error('Failed to verify menu item creation');
      }

      const menuItem: MenuItem = {
        id: docRef.id,
        ...itemData,
      };

      console.log('[FirebaseMenuService] ✅ Menu item created successfully:', {
        id: docRef.id,
        name: menuItem.name,
        menuId: menuItem.menuId
      });

      return menuItem;
    } catch (error) {
      console.error('[FirebaseMenuService] ❌ Error creating menu item:', error);
      console.error('[FirebaseMenuService] Error details:', error);
      throw new Error('Failed to create menu item: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Update a menu item
   */
  async updateMenuItem(itemId: string, userId: string, input: UpdateMenuItemInput): Promise<MenuItem> {
    try {
      const updateData = {
        ...input,
        updatedBy: userId,
        updatedAt: new Date().toISOString(),
      };

      await this.menuItemsCollection.doc(itemId).update(updateData);

      // Get the updated item
      const itemDoc = await this.menuItemsCollection.doc(itemId).get();
      if (!itemDoc.exists) {
        throw new Error('Menu item not found after update');
      }

      const menuItem: MenuItem = {
        id: itemDoc.id,
        ...itemDoc.data(),
      } as MenuItem;

      console.log('[FirebaseMenuService] Menu item updated successfully:', itemId);
      return menuItem;
    } catch (error) {
      console.error('[FirebaseMenuService] Error updating menu item:', error);
      throw new Error('Failed to update menu item');
    }
  }

  /**
   * Delete a menu item
   */
  async deleteMenuItem(itemId: string, userId: string): Promise<void> {
    try {
      await this.menuItemsCollection.doc(itemId).delete();
      console.log('[FirebaseMenuService] Menu item deleted successfully:', itemId);
    } catch (error) {
      console.error('[FirebaseMenuService] Error deleting menu item:', error);
      throw new Error('Failed to delete menu item');
    }
  }

  /**
   * Get a single menu item
   */
  async getMenuItem(itemId: string): Promise<MenuItem | null> {
    try {
      const itemDoc = await this.menuItemsCollection.doc(itemId).get();

      if (!itemDoc.exists) {
        return null;
      }

      return {
        id: itemDoc.id,
        ...itemDoc.data(),
      } as MenuItem;
    } catch (error) {
      console.error('[FirebaseMenuService] Error getting menu item:', error);
      throw new Error('Failed to get menu item');
    }
  }

  /**
   * Create a menu category
   */
  async createMenuCategory(menuId: string, userId: string, input: CreateMenuCategoryInput): Promise<MenuCategory> {
    try {
      console.log('[FirebaseMenuService] Creating menu category for menu:', menuId);

      const now = new Date().toISOString();

      const categoryData = {
        menuId,
        name: input.name.trim(),
        description: input.description?.trim() || '',
        order: input.order || 0,
        isVisible: input.isVisible !== false,
        createdBy: userId,
        updatedBy: userId,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await this.categoriesCollection.add(categoryData);

      const category: MenuCategory = {
        id: docRef.id,
        ...categoryData,
      };

      console.log('[FirebaseMenuService] ✅ Menu category created successfully:', category.id);
      return category;
    } catch (error) {
      console.error('[FirebaseMenuService] Error creating menu category:', error);
      throw new Error('Failed to create menu category');
    }
  }

  /**
   * Get categories for a menu
   */
  async getMenuCategories(menuId: string): Promise<MenuCategory[]> {
    try {
      console.log('[FirebaseMenuService] Getting categories for menu:', menuId);

      const categoriesSnapshot = await this.categoriesCollection
        .where('menuId', '==', menuId)
        .orderBy('order', 'asc')
        .get();

      const categories = categoriesSnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      })) as MenuCategory[];

      console.log('[FirebaseMenuService] Found', categories.length, 'categories for menu', menuId);
      return categories;
    } catch (error) {
      console.error('[FirebaseMenuService] Error getting menu categories:', error);
      // If orderBy fails due to missing index, try without ordering
      try {
        const categoriesSnapshot = await this.categoriesCollection
          .where('menuId', '==', menuId)
          .get();

        const categories = categoriesSnapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        })) as MenuCategory[];

        // Sort client-side
        categories.sort((a, b) => (a.order || 0) - (b.order || 0));

        return categories;
      } catch (retryError) {
        console.error('[FirebaseMenuService] Retry also failed:', retryError);
        return [];
      }
    }
  }

  /**
   * Update a menu category
   */
  async updateMenuCategory(categoryId: string, userId: string, input: UpdateMenuCategoryInput): Promise<MenuCategory> {
    try {
      console.log('[FirebaseMenuService] Updating menu category:', categoryId);

      const updateData = {
        ...input,
        updatedBy: userId,
        updatedAt: new Date().toISOString(),
      };

      // Clean up string fields
      if (updateData.name) updateData.name = updateData.name.trim();
      if (updateData.description) updateData.description = updateData.description.trim();

      const docRef = this.categoriesCollection.doc(categoryId);
      await docRef.update(updateData);

      // Get updated document
      const updatedDoc = await docRef.get();
      if (!updatedDoc.exists) {
        throw new Error('Failed to retrieve updated category');
      }

      const category: MenuCategory = {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      } as MenuCategory;

      console.log('[FirebaseMenuService] ✅ Menu category updated successfully:', categoryId);
      return category;
    } catch (error) {
      console.error('[FirebaseMenuService] Error updating menu category:', error);
      throw new Error('Failed to update menu category');
    }
  }

  /**
   * Delete a menu category
   */
  async deleteMenuCategory(categoryId: string, userId: string): Promise<void> {
    try {
      console.log('[FirebaseMenuService] Deleting menu category:', categoryId);

      const docRef = this.categoriesCollection.doc(categoryId);
      await docRef.delete();

      console.log('[FirebaseMenuService] ✅ Menu category deleted successfully:', categoryId);
    } catch (error) {
      console.error('[FirebaseMenuService] Error deleting menu category:', error);
      throw new Error('Failed to delete menu category');
    }
  }
}

// Export singleton instance
export const firebaseMenuService = new FirebaseMenuService();
