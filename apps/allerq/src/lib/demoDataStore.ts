// Demo data store for development mode
// Maintains state between API calls when NoCodeBackend is not available

import { LocationVerification } from './location/googlePlaces';

interface AddressData {
  raw: string;                    // User-entered address
  formatted?: string;             // API-standardized address
  components?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

interface LocationData {
  coordinates?: { lat: number; lng: number };
  accuracy?: number;               // Meters
  source?: 'gps' | 'geocoded' | 'manual';
}

interface VerificationData {
  address?: LocationVerification;
  lastVerified?: string;
  status: 'verified' | 'pending' | 'failed' | 'manual_review' | 'unverified';
  trustScore?: number;             // 0-100
}

interface Restaurant {
  id: string;
  name: string;
  address?: string;               // Legacy field - kept for backward compatibility
  contact?: string;
  logo?: string;
  website?: string;
  geolocation?: string;           // Legacy field - kept for backward compatibility
  created_at?: string;
  updated_at?: string;
  user_id?: string;

  // Enhanced location data
  addressData?: AddressData;
  location?: LocationData;
  verification?: VerificationData;
}

interface Menu {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

interface MenuItem {
  id: string;
  menu_id: string;
  name: string;
  description?: string;
  price?: number;
  allergens?: string[];
  created_at?: string;
  updated_at?: string;
}

// Persistent demo data store with localStorage fallback
class DemoDataStore {
  private restaurants: Restaurant[] = [];
  private menus: Menu[] = [];
  private menuItems: MenuItem[] = [];
  private initialized = false;
  private readonly STORAGE_KEY = 'allerq_demo_data';

  constructor() {
    this.loadFromStorage();
    this.initializeDefaultData();
  }

  private loadFromStorage() {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.restaurants = data.restaurants || [];
        this.menus = data.menus || [];
        this.menuItems = data.menuItems || [];
        console.log(`[DemoStore] Loaded from localStorage: ${this.restaurants.length} restaurants`);

        // Warn about demo mode data persistence
        if (this.restaurants.length > 0) {
          console.warn(`[CRITICAL] Demo Mode: ${this.restaurants.length} restaurants loaded from localStorage only!`);
          console.warn(`[CRITICAL] Data is NOT persisted to backend database and may be lost!`);
        }
      }
    } catch (error) {
      console.warn('[DemoStore] Failed to load from localStorage:', error);
    }
  }

  private saveToStorage() {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    try {
      const data = {
        restaurants: this.restaurants,
        menus: this.menus,
        menuItems: this.menuItems,
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      console.log(`[DemoStore] Saved to localStorage: ${this.restaurants.length} restaurants`);
    } catch (error) {
      console.warn('[DemoStore] Failed to save to localStorage:', error);
    }
  }

  private initializeDefaultData() {
    if (this.initialized) return;

    // Only add default restaurants if none exist
    if (this.restaurants.length === 0) {
      this.restaurants = [
        {
          id: "rest-001",
          name: "Riverside Bistro",
          address: "123 River St, Portland, OR",
          contact: "+1 (555) 123-4567",
          logo: "https://placehold.co/200x200?text=RB",
          geolocation: "45.523064,-122.676483",
          created_at: new Date('2024-01-01').toISOString(),
          updated_at: new Date('2024-01-01').toISOString(),
        },
        {
          id: "rest-002",
          name: "Mountain View Grill",
          address: "456 Summit Ave, Denver, CO",
          contact: "+1 (555) 987-6543",
          logo: "https://placehold.co/200x200?text=MVG",
          geolocation: "39.739235,-104.990250",
          created_at: new Date('2024-01-02').toISOString(),
          updated_at: new Date('2024-01-02').toISOString(),
        }
      ];
      this.saveToStorage();
    }

    this.initialized = true;
  }

  // Restaurant methods
  getRestaurants(userId?: string): Restaurant[] {
    console.log(`[DemoStore] getRestaurants called with userId: ${userId || 'undefined'}`);
    console.log(`[DemoStore] Total restaurants in store: ${this.restaurants.length}`);

    if (userId) {
      // Return only user-specific restaurants (strict filtering)
      const userRestaurants = this.restaurants.filter(r => r.user_id === userId);
      console.log(`[DemoStore] Found ${userRestaurants.length} restaurants for user ${userId}`);
      console.log(`[DemoStore] User restaurants:`, userRestaurants.map(r => ({ id: r.id, name: r.name, user_id: r.user_id })));
      return userRestaurants;
    }

    // If no userId provided, return all restaurants (for admin/debugging)
    console.log(`[DemoStore] No userId provided, returning all ${this.restaurants.length} restaurants`);
    return [...this.restaurants];
  }

  getRestaurant(id: string): Restaurant | null {
    return this.restaurants.find(r => r.id === id) || null;
  }

  createRestaurant(data: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>, userId?: string): Restaurant {
    const restaurant: Restaurant = {
      ...data,
      id: `rest-${Date.now().toString().slice(-6)}`,
      user_id: userId, // Associate with user
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.restaurants.push(restaurant);
    this.saveToStorage(); // Persist to localStorage
    console.log(`[DemoStore] Created restaurant: ${restaurant.name} (${restaurant.id}) for user: ${userId || 'anonymous'}`);
    console.log(`[DemoStore] Total restaurants: ${this.restaurants.length}`);

    return restaurant;
  }

  updateRestaurant(id: string, data: Partial<Restaurant>): Restaurant | null {
    const index = this.restaurants.findIndex(r => r.id === id);
    if (index === -1) return null;

    this.restaurants[index] = {
      ...this.restaurants[index],
      ...data,
      updated_at: new Date().toISOString(),
    };

    this.saveToStorage(); // Persist to localStorage
    return this.restaurants[index];
  }

  deleteRestaurant(id: string): boolean {
    const index = this.restaurants.findIndex(r => r.id === id);
    if (index === -1) return false;

    this.restaurants.splice(index, 1);
    this.saveToStorage(); // Persist to localStorage
    return true;
  }

  // Menu methods
  getMenus(restaurantId?: string): Menu[] {
    if (restaurantId) {
      return this.menus.filter(m => m.restaurant_id === restaurantId);
    }
    return [...this.menus];
  }

  getMenu(id: string): Menu | null {
    return this.menus.find(m => m.id === id) || null;
  }

  createMenu(data: Omit<Menu, 'id' | 'created_at' | 'updated_at'>): Menu {
    const menu: Menu = {
      ...data,
      id: `menu-${Date.now().toString().slice(-6)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    this.menus.push(menu);
    return menu;
  }

  // Menu item methods
  getMenuItems(menuId?: string): MenuItem[] {
    if (menuId) {
      return this.menuItems.filter(item => item.menu_id === menuId);
    }
    return [...this.menuItems];
  }

  createMenuItem(data: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>): MenuItem {
    const menuItem: MenuItem = {
      ...data,
      id: `item-${Date.now().toString().slice(-6)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    this.menuItems.push(menuItem);
    return menuItem;
  }

  // Utility methods
  reset() {
    this.restaurants = [];
    this.menus = [];
    this.menuItems = [];
    this.initialized = false;
    this.saveToStorage(); // Clear localStorage
    this.initializeDefaultData();
  }

  // Force reload from storage (useful for debugging)
  reloadFromStorage() {
    this.initialized = false;
    this.loadFromStorage();
    this.initializeDefaultData();
  }

  getStats() {
    return {
      restaurants: this.restaurants.length,
      menus: this.menus.length,
      menuItems: this.menuItems.length,
    };
  }
}

// Export singleton instance
export const demoStore = new DemoDataStore();
