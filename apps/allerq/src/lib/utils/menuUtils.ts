// Utility functions for menu management
import { MenuCategory, STANDARD_CATEGORIES } from '@/lib/types/menu';

/**
 * Generate consistent category IDs for a menu
 */
export function generateMenuCategories(menuId: string, restaurantId: string): MenuCategory[] {
  return STANDARD_CATEGORIES.map((cat, index) => ({
    id: `${menuId}-cat-${cat.name.toLowerCase().replace(/\s+/g, '-')}-${index}`,
    name: cat.name,
    description: cat.description,
    order: cat.order,
    isCustom: cat.isCustom,
    icon: cat.icon,
    restaurantId: restaurantId,
  }));
}

/**
 * Determine region based on restaurant location data
 */
export function determineRegionFromRestaurant(restaurant: any): 'EU' | 'US' | 'CA' | 'ASIA' {
  if (restaurant.verification?.address?.addressComponents?.country) {
    const country = restaurant.verification.address.addressComponents.country;
    if (country === 'United States') return 'US';
    if (country === 'Canada') return 'CA';
    if (['China', 'Japan', 'South Korea', 'India', 'Thailand', 'Singapore'].includes(country)) return 'ASIA';
    return 'EU';
  }
  return 'EU'; // Default to EU
}

/**
 * Validate menu creation input
 */
export function validateMenuCreationInput(input: any): { valid: boolean; error?: string } {
  if (!input.name || typeof input.name !== 'string' || input.name.trim() === '') {
    return { valid: false, error: "Menu name is required" };
  }

  if (!['manual', 'upload', 'ai_assisted'].includes(input.creationMethod)) {
    return { valid: false, error: "Invalid creation method" };
  }

  return { valid: true };
}

/**
 * Validate uploaded file for menu processing
 */
export function validateMenuFile(file: File): { valid: boolean; error?: string } {
  // Validate file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: "File size must be less than 10MB" };
  }

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Please upload a PDF, Word document, or text file" };
  }

  return { valid: true };
}

/**
 * Generate source file metadata for uploaded files
 */
export function generateSourceFileMetadata(file: File, restaurantId: string) {
  return {
    filename: `menu_${restaurantId}_${Date.now()}_${file.name}`,
    originalName: file.name,
    mimeType: file.type,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  };
}
