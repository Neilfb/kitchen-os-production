// Client-side storage utilities for AllerQ data persistence
// Provides localStorage-based persistence for demo mode

interface Restaurant {
  id: string;
  name: string;
  address?: string;
  contact?: string;
  logo?: string;
  website?: string;
  geolocation?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

interface StoredData {
  restaurants: Restaurant[];
  lastSync: string;
  userId?: string;
}

class ClientStorage {
  private readonly STORAGE_KEY = 'allerq_user_data';
  private readonly SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

  // Check if we're in browser environment
  private get isClient(): boolean {
    return typeof window !== 'undefined';
  }

  // Get current user ID from localStorage token
  private getCurrentUserId(): string | null {
    if (!this.isClient) return null;

    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      // Simple JWT decode for demo purposes
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = parts[1];
      const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
      const decodedPayload = atob(paddedPayload);
      const tokenData = JSON.parse(decodedPayload);

      return tokenData.id || null;
    } catch (error) {
      console.warn('[ClientStorage] Failed to get user ID from token:', error);
      return null;
    }
  }

  // Load user data from localStorage
  loadUserData(): StoredData | null {
    if (!this.isClient) return null;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as StoredData;
        console.log(`[ClientStorage] Loaded ${data.restaurants.length} restaurants from localStorage`);
        return data;
      }
    } catch (error) {
      console.warn('[ClientStorage] Failed to load from localStorage:', error);
    }
    return null;
  }

  // Save user data to localStorage
  saveUserData(data: StoredData): void {
    if (!this.isClient) return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      console.log(`[ClientStorage] Saved ${data.restaurants.length} restaurants to localStorage`);
    } catch (error) {
      console.warn('[ClientStorage] Failed to save to localStorage:', error);
    }
  }

  // Get user restaurants from localStorage
  getUserRestaurants(): Restaurant[] {
    const data = this.loadUserData();
    if (!data) return [];

    const userId = this.getCurrentUserId();
    if (!userId) return [];

    return data.restaurants.filter(r => r.user_id === userId);
  }

  // Add restaurant to localStorage
  addRestaurant(restaurant: Restaurant): void {
    const userId = this.getCurrentUserId();
    if (!userId) {
      console.warn('[ClientStorage] Cannot add restaurant: no user ID found');
      return;
    }

    const data = this.loadUserData() || {
      restaurants: [],
      lastSync: new Date().toISOString(),
      userId: userId
    };

    // Ensure restaurant is associated with current user
    const userRestaurant = {
      ...restaurant,
      user_id: userId
    };

    // Check if restaurant already exists
    const existingIndex = data.restaurants.findIndex(r => r.id === restaurant.id);
    if (existingIndex >= 0) {
      data.restaurants[existingIndex] = userRestaurant;
    } else {
      data.restaurants.push(userRestaurant);
    }

    data.lastSync = new Date().toISOString();
    this.saveUserData(data);
  }

  // Update restaurant in localStorage
  updateRestaurant(id: string, updates: Partial<Restaurant>): boolean {
    const data = this.loadUserData();
    if (!data) return false;

    const index = data.restaurants.findIndex(r => r.id === id);
    if (index === -1) return false;

    data.restaurants[index] = {
      ...data.restaurants[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    data.lastSync = new Date().toISOString();
    this.saveUserData(data);
    return true;
  }

  // Delete restaurant from localStorage
  deleteRestaurant(id: string): boolean {
    const data = this.loadUserData();
    if (!data) return false;

    const index = data.restaurants.findIndex(r => r.id === id);
    if (index === -1) return false;

    data.restaurants.splice(index, 1);
    data.lastSync = new Date().toISOString();
    this.saveUserData(data);
    return true;
  }

  // Sync with server (for future implementation)
  async syncWithServer(): Promise<void> {
    if (!this.isClient) return;

    try {
      const localData = this.loadUserData();
      if (!localData) return;

      // Check if sync is needed
      const lastSync = new Date(localData.lastSync);
      const now = new Date();
      if (now.getTime() - lastSync.getTime() < this.SYNC_INTERVAL) {
        return; // No sync needed yet
      }

      // In production, this would sync with the server
      console.log('[ClientStorage] Sync with server would happen here');
      
      // Update last sync time
      localData.lastSync = now.toISOString();
      this.saveUserData(localData);
    } catch (error) {
      console.warn('[ClientStorage] Sync failed:', error);
    }
  }

  // Clear all user data
  clearUserData(): void {
    if (!this.isClient) return;

    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('[ClientStorage] Cleared user data from localStorage');
    } catch (error) {
      console.warn('[ClientStorage] Failed to clear localStorage:', error);
    }
  }

  // Get storage stats
  getStorageStats(): { restaurants: number; lastSync: string | null } {
    const data = this.loadUserData();
    return {
      restaurants: data?.restaurants.length || 0,
      lastSync: data?.lastSync || null
    };
  }

  // Initialize storage with default data if empty
  initializeIfEmpty(): void {
    const data = this.loadUserData();
    if (!data) {
      const initialData: StoredData = {
        restaurants: [],
        lastSync: new Date().toISOString(),
        userId: this.getCurrentUserId()
      };
      this.saveUserData(initialData);
      console.log('[ClientStorage] Initialized empty storage');
    }
  }
}

// Export singleton instance
export const clientStorage = new ClientStorage();

// Export types for use in other files
export type { Restaurant, StoredData };
