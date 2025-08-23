// File upload utilities for restaurant logos and other media

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

/**
 * Process file upload for browser environments (alias for compatibility)
 */
export async function processFileUpload(file: File): Promise<{ base64: string; url: string }> {
  const base64 = await convertToBase64DataUrl(file);
  return {
    base64,
    url: base64
  };
}

/**
 * Process and store a logo file upload
 */
export async function processLogoUpload(file: File, userId: string): Promise<string> {
  console.log(`[FileUpload] Processing logo upload for user ${userId}:`, {
    name: file.name,
    size: file.size,
    type: file.type,
  });

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed for logos');
  }

  // Validate file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('Logo file size must be less than 10MB');
  }

  // Generate unique filename
  const timestamp = Date.now();
  const extension = getFileExtension(file.name);
  const filename = `logo_${userId}_${timestamp}${extension}`;

  try {
    // Always use base64 data URL for browser compatibility
    // This ensures logos persist across Vercel deployments and works in all environments
    return await convertToBase64DataUrl(file);

  } catch (error) {
    console.error('[FileUpload] Error processing logo upload:', error);
    throw new Error('Failed to upload logo file');
  }
}

// Removed storeFileLocally function to eliminate Node.js dependencies in client code
// All file processing now uses browser-compatible base64 conversion

/**
 * Convert file to base64 data URL for database storage (Browser-only)
 * This ensures logos persist across Vercel deployments
 */
async function convertToBase64DataUrl(file: File): Promise<string> {
  try {
    console.log('[FileUpload] Converting file to base64 data URL');

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result as string;

        // Validate size (base64 is ~33% larger than original)
        const maxBase64Size = 15 * 1024 * 1024; // 15MB limit for base64
        if (result.length > maxBase64Size) {
          reject(new Error('Logo file too large for database storage. Please use a smaller image.'));
          return;
        }

        console.log('[FileUpload] Base64 conversion successful, size:', result.length);
        resolve(result);
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });

  } catch (error) {
    console.error('[FileUpload] Error converting to base64:', error);
    throw new Error('Failed to process logo file');
  }
}

/**
 * Store file using cloud storage (placeholder for future implementation)
 */
async function storeFileInCloud(file: File, filename: string): Promise<string> {
  // This would integrate with services like:
  // - AWS S3
  // - Google Cloud Storage
  // - Cloudinary
  // - Vercel Blob Storage

  console.log('[FileUpload] Cloud storage not implemented, falling back to base64');
  return await convertToBase64DataUrl(file);
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return '';
  return filename.substring(lastDot);
}

/**
 * Validate image file type
 */
export function isValidImageType(mimeType: string): boolean {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ];
  return allowedTypes.includes(mimeType.toLowerCase());
}

/**
 * Generate optimized filename for storage
 */
export function generateOptimizedFilename(originalName: string, userId: string, prefix: string = 'file'): string {
  const timestamp = Date.now();
  const extension = getFileExtension(originalName);
  const sanitizedName = originalName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .toLowerCase();
  
  return `${prefix}_${userId}_${timestamp}_${sanitizedName}${extension}`;
}

/**
 * Clean up old uploaded files (for maintenance)
 */
export async function cleanupOldFiles(maxAgeMs: number = 30 * 24 * 60 * 60 * 1000): Promise<void> {
  // This would be implemented for production to clean up unused files
  // For now, it's a placeholder
  console.log('[FileUpload] File cleanup not implemented in demo mode');
}

/**
 * Get file info without uploading
 */
export function getFileInfo(file: File): {
  name: string;
  size: number;
  type: string;
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check file type
  if (!isValidImageType(file.type)) {
    errors.push('Invalid file type. Only images are allowed.');
  }
  
  // Check file size
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    errors.push('File size too large. Maximum size is 10MB.');
  }
  
  // Check filename
  if (!file.name || file.name.trim() === '') {
    errors.push('Invalid filename.');
  }
  
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    isValid: errors.length === 0,
    errors,
  };
}
