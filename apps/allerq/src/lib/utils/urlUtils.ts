/**
 * URL utility functions for handling website URLs
 */

/**
 * Ensures a URL has a protocol (https://) prefix
 * @param url - The URL to normalize
 * @returns The URL with https:// prefix if needed
 */
export function normalizeWebsiteUrl(url: string): string {
  if (!url || url.trim() === '') {
    return '';
  }

  const trimmedUrl = url.trim();
  
  // If already has protocol, return as-is
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    return trimmedUrl;
  }
  
  // Add https:// prefix
  return `https://${trimmedUrl}`;
}

/**
 * Validates if a URL is properly formatted
 * @param url - The URL to validate
 * @returns true if valid, false otherwise
 */
export function isValidWebsiteUrl(url: string): boolean {
  if (!url || url.trim() === '') {
    return true; // Empty URLs are valid (optional field)
  }

  try {
    const normalizedUrl = normalizeWebsiteUrl(url);
    const urlObj = new URL(normalizedUrl);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Formats a URL for display (removes protocol for cleaner appearance)
 * @param url - The URL to format
 * @returns The URL without protocol for display
 */
export function formatUrlForDisplay(url: string): string {
  if (!url || url.trim() === '') {
    return '';
  }

  return url.replace(/^https?:\/\//, '');
}

/**
 * Creates a website input change handler that auto-adds https://
 * @param setValue - Function to set the value
 * @returns Change handler function
 */
export function createWebsiteInputHandler(setValue: (value: string) => void) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // If user is typing and hasn't finished, don't auto-add protocol yet
    if (value && !value.includes('.') && !value.startsWith('http')) {
      setValue(value);
      return;
    }
    
    // If it looks like a complete domain, normalize it
    if (value && value.includes('.') && !value.startsWith('http')) {
      setValue(normalizeWebsiteUrl(value));
    } else {
      setValue(value);
    }
  };
}

/**
 * Creates a website input blur handler that ensures proper formatting
 * @param setValue - Function to set the value
 * @returns Blur handler function
 */
export function createWebsiteBlurHandler(setValue: (value: string) => void) {
  return (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value && value.trim() !== '') {
      setValue(normalizeWebsiteUrl(value));
    }
  };
}
