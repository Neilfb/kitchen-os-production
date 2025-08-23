// Unified Restaurant Types for Firebase + NoCodeBackend

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

export interface RestaurantInput {
  name: string;
  address?: string;
  website?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  location?: string;
}

// Legacy interface for backward compatibility
export interface LegacyRestaurant {
  id: string; // Legacy string ID
  name: string;
  address?: string;
  contact?: string;
  logo?: string;
  geolocation?: string;
  cuisine?: string;
  status?: 'active' | 'inactive' | 'pending';
  createdAt?: string;
  updatedAt?: string;
}

// Conversion utilities
export function convertToLegacyRestaurant(restaurant: Restaurant): LegacyRestaurant {
  return {
    id: restaurant.id.toString(),
    name: restaurant.name,
    address: restaurant.address,
    contact: restaurant.phone,
    logo: restaurant.logo_url || undefined,
    geolocation: restaurant.location,
    status: 'active',
    createdAt: restaurant.created_at ? new Date(restaurant.created_at).toISOString() : undefined,
    updatedAt: restaurant.updated_at ? new Date(restaurant.updated_at).toISOString() : undefined
  };
}

export function convertFromLegacyRestaurant(legacy: LegacyRestaurant): RestaurantInput {
  return {
    name: legacy.name,
    address: legacy.address,
    phone: legacy.contact,
    logo_url: legacy.logo,
    location: legacy.geolocation
  };
}
