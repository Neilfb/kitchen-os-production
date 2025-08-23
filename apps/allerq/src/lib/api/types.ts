// Common response structure
export interface ApiResponse<T> {
  data: T;
  error?: string;
  status: number;
}

// Restaurant types
export interface Restaurant {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  imageUrl?: string;
  tags?: string[];
}

// Menu types
export interface Menu {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  tags?: string[];
  items?: MenuItem[];
  category?: string;
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  allergens?: string[];
  category?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
}

// Analytics types
export interface Analytics {
  id: string;
  metrics?: {
    views?: number;
    scans?: number;
    clicks?: number;
  };
  dateRange?: {
    from: string;
    to: string;
  };
}

// Customer types
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  subscription?: string;
  createdAt?: string;
  restaurantCount?: number;
  menuCount?: number;
  status?: 'active' | 'inactive';
  plan?: string;
}

// Subscription types
export interface Subscription {
  id: string;
  customerId: string;
  plan?: string;
  status?: 'active' | 'inactive' | 'trialing' | 'canceled';
  startDate?: string;
  endDate?: string;
  price?: number;
}
