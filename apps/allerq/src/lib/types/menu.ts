// Enhanced menu types for AI-powered menu management system

export interface AllergenInfo {
  id: string;
  name: string;
  region: 'EU' | 'US' | 'CA' | 'ASIA';
  mandatory: boolean;
  description?: string;
}

export interface DietaryInfo {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string; // For nested categories
  order: number;
  isCustom: boolean;
  restaurantId?: string; // For restaurant-specific categories
  icon?: string;
}

export interface AITagging {
  confidence: number; // 0-100
  source: 'ai' | 'manual' | 'hybrid';
  processedAt: string;
  modelVersion?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface MenuItemTag {
  type: 'allergen' | 'dietary';
  value: string;
  confidence?: number;
  source: 'ai' | 'manual';
  addedAt: string;
  addedBy?: string;
}

export interface EnhancedMenuItem {
  id: string;
  menuId: string;
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  categoryId?: string;
  category?: string; // Legacy field
  
  // AI-Enhanced Tagging
  allergens: MenuItemTag[];
  dietary: MenuItemTag[];
  aiTagging?: AITagging;
  
  // Organization
  order: number;
  isVisible: boolean;
  isAvailable: boolean;
  
  // Media
  image?: string;
  images?: string[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  
  // Regional compliance
  regionCompliant?: boolean;
  complianceNotes?: string[];
}

export interface EnhancedMenu {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  
  // Categories and Items
  categories: MenuCategory[];
  items: EnhancedMenuItem[];
  
  // Status and Publishing
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  publishedVersion?: number;
  
  // AI Processing
  aiProcessed: boolean;
  aiProcessingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  aiProcessingError?: string;
  lastAiProcessing?: string;
  
  // File Upload
  sourceFile?: {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    uploadedAt: string;
  };
  
  // Regional Settings
  region?: 'EU' | 'US' | 'CA' | 'ASIA';
  allergenRegulations?: AllergenInfo[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  
  // Legacy compatibility
  tags?: string[];
}

export interface MenuCreationMethod {
  type: 'manual' | 'upload' | 'ai_assisted';
  uploadFile?: File;
  aiPrompt?: string;
}

export interface RegionalAllergenConfig {
  region: 'EU' | 'US' | 'CA' | 'ASIA';
  name: string;
  mandatoryAllergens: AllergenInfo[];
  optionalAllergens: AllergenInfo[];
  regulations: {
    name: string;
    description: string;
    url?: string;
  }[];
}

export interface AIProcessingRequest {
  menuId: string;
  restaurantId: string;
  region: 'EU' | 'US' | 'CA' | 'ASIA';
  items: {
    name: string;
    description?: string;
    ingredients?: string;
  }[];
  options?: {
    includeNutritionalInfo?: boolean;
    includePricing?: boolean;
    customPrompt?: string;
  };
}

export interface AIProcessingResponse {
  success: boolean;
  processedItems: {
    name: string;
    allergens: {
      tag: string;
      confidence: number;
      reasoning?: string;
    }[];
    dietary: {
      tag: string;
      confidence: number;
      reasoning?: string;
    }[];
    suggestions?: string[];
  }[];
  warnings?: string[];
  errors?: string[];
  processingTime: number;
  modelUsed: string;
}

// Standard menu categories
export const STANDARD_CATEGORIES: Omit<MenuCategory, 'id' | 'restaurantId'>[] = [
  { name: 'Starters', description: 'Appetizers and small plates', order: 1, isCustom: false, icon: '🥗' },
  { name: 'Mains', description: 'Main courses', order: 2, isCustom: false, icon: '🍽️' },
  { name: 'Sides', description: 'Side dishes', order: 3, isCustom: false, icon: '🥖' },
  { name: 'Desserts', description: 'Sweet treats', order: 4, isCustom: false, icon: '🍰' },
  { name: 'Beverages', description: 'Drinks and beverages', order: 5, isCustom: false, icon: '🥤' },
  { name: 'Lunch', description: 'Lunch menu items', order: 6, isCustom: false, icon: '🌅' },
  { name: 'Dinner', description: 'Dinner menu items', order: 7, isCustom: false, icon: '🌆' },
];

// Regional allergen configurations
export const REGIONAL_ALLERGENS: Record<string, RegionalAllergenConfig> = {
  EU: {
    region: 'EU',
    name: 'European Union (Natasha\'s Law)',
    mandatoryAllergens: [
      { id: 'gluten', name: 'Cereals containing gluten', region: 'EU', mandatory: true },
      { id: 'crustaceans', name: 'Crustaceans', region: 'EU', mandatory: true },
      { id: 'eggs', name: 'Eggs', region: 'EU', mandatory: true },
      { id: 'fish', name: 'Fish', region: 'EU', mandatory: true },
      { id: 'peanuts', name: 'Peanuts', region: 'EU', mandatory: true },
      { id: 'soybeans', name: 'Soybeans', region: 'EU', mandatory: true },
      { id: 'milk', name: 'Milk', region: 'EU', mandatory: true },
      { id: 'nuts', name: 'Tree nuts', region: 'EU', mandatory: true },
      { id: 'celery', name: 'Celery', region: 'EU', mandatory: true },
      { id: 'mustard', name: 'Mustard', region: 'EU', mandatory: true },
      { id: 'sesame', name: 'Sesame seeds', region: 'EU', mandatory: true },
      { id: 'sulphites', name: 'Sulphur dioxide and sulphites', region: 'EU', mandatory: true },
      { id: 'lupin', name: 'Lupin', region: 'EU', mandatory: true },
      { id: 'molluscs', name: 'Molluscs', region: 'EU', mandatory: true },
    ],
    optionalAllergens: [],
    regulations: [
      {
        name: 'Natasha\'s Law',
        description: 'UK food labeling requirements',
        url: 'https://www.food.gov.uk/business-guidance/allergen-guidance-for-food-businesses'
      }
    ]
  },
  US: {
    region: 'US',
    name: 'United States (FDA)',
    mandatoryAllergens: [
      { id: 'milk', name: 'Milk', region: 'US', mandatory: true },
      { id: 'eggs', name: 'Eggs', region: 'US', mandatory: true },
      { id: 'fish', name: 'Fish', region: 'US', mandatory: true },
      { id: 'shellfish', name: 'Shellfish', region: 'US', mandatory: true },
      { id: 'tree_nuts', name: 'Tree nuts', region: 'US', mandatory: true },
      { id: 'peanuts', name: 'Peanuts', region: 'US', mandatory: true },
      { id: 'wheat', name: 'Wheat', region: 'US', mandatory: true },
      { id: 'soybeans', name: 'Soybeans', region: 'US', mandatory: true },
      { id: 'sesame', name: 'Sesame', region: 'US', mandatory: true },
    ],
    optionalAllergens: [],
    regulations: [
      {
        name: 'FDA Food Allergen Labeling',
        description: 'FDA requirements for allergen labeling',
        url: 'https://www.fda.gov/food/food-allergensgluten-free/food-allergen-labeling-and-consumer-protection-act-falcpa'
      }
    ]
  }
};

// Common dietary preferences
export const DIETARY_OPTIONS: DietaryInfo[] = [
  { id: 'vegetarian', name: 'Vegetarian', description: 'No meat or fish', icon: '🥬' },
  { id: 'vegan', name: 'Vegan', description: 'No animal products', icon: '🌱' },
  { id: 'gluten_free', name: 'Gluten-Free', description: 'No gluten-containing ingredients', icon: '🌾' },
  { id: 'dairy_free', name: 'Dairy-Free', description: 'No dairy products', icon: '🥛' },
  { id: 'halal', name: 'Halal', description: 'Prepared according to Islamic law', icon: '☪️' },
  { id: 'kosher', name: 'Kosher', description: 'Prepared according to Jewish law', icon: '✡️' },
  { id: 'keto', name: 'Keto-Friendly', description: 'Low carb, high fat', icon: '🥑' },
  { id: 'low_sodium', name: 'Low Sodium', description: 'Reduced sodium content', icon: '🧂' },
  { id: 'spicy', name: 'Spicy', description: 'Contains spicy ingredients', icon: '🌶️' },
  { id: 'nut_free', name: 'Nut-Free', description: 'No nuts or nut products', icon: '🚫' },
];
