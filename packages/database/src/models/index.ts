export const COLLECTIONS = {
  RESTAURANTS: 'restaurants',
  MENUS: 'menus',
  MENU_ITEMS: 'menu_items',
  JOBS: 'jobs',
  QR_CODES: 'qr_codes',
  ANALYTICS: 'analytics',
  WEBHOOKS: 'webhooks',
  WEBHOOK_DELIVERIES: 'webhook_deliveries',
} as const;

// Restaurant Types
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Restaurant {
  id: string;
  customerId: string;
  name: string;
  description?: string;
  address: Address;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  region: 'US' | 'UK' | 'EU' | 'CA' | 'AU';
  createdAt: any;
  updatedAt: any;
  createdBy: string;
}

// Menu Types
export interface MenuSection {
  id: string;
  name: string;
  description?: string;
  order: number;
  items: string[]; // Array of menu item IDs
}

export interface Menu {
  id: string;
  restaurantId: string;
  customerId: string;
  name: string;
  description?: string;
  sections: MenuSection[];
  published: boolean;
  publishedAt?: any;
  version: number;
  createdAt: any;
  updatedAt: any;
  createdBy: string;
}

export interface MenuItem {
  id: string;
  menuId: string;
  restaurantId: string;
  customerId: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  category: string;
  ingredients: string[];
  allergens: string[];
  dietaryTags: string[];
  available: boolean;
  order: number;
  imageUrl?: string;
  createdAt: any;
  updatedAt: any;
}

// Job Types
export interface ProcessingJob {
  id: string;
  type: 'ocr' | 'ai_parsing';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  input: {
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  };
  result?: {
    ocrText?: string;
    parsedMenu?: any;
    step?: string;
  };
  error?: string;
  restaurantId: string;
  customerId: string;
  createdBy: string;
  createdAt: any;
  updatedAt: any;
  completedAt?: any;
}

// QR Code Types
export interface QRCodeCustomization {
  primaryColor: string;
  backgroundColor: string;
  logoEnabled: boolean;
  brandingEnabled: boolean;
  size?: 'small' | 'medium' | 'large';
}

export interface QRCode {
  id: string;
  restaurantId: string;
  menuId?: string;
  customization: QRCodeCustomization;
  url: string;
  scanCount: number;
  lastScannedAt?: any;
  createdAt: any;
}

// Analytics Types
export interface AnalyticsEvent {
  id: string;
  restaurantId: string;
  menuId?: string;
  itemId?: string;
  qrId?: string;
  eventType: 'scan' | 'view' | 'click';
  timestamp: any;
  metadata: {
    userAgent?: string;
    referrer?: string;
    location?: {
      country?: string;
      region?: string;
      city?: string;
    };
    sessionId?: string;
  };
}
