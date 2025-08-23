// Authentication utilities for AllerQ
// Provides JWT token handling and user identification

interface DecodedToken {
  id: string;
  email: string;
  name?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

/**
 * Simple JWT decoder for demo purposes
 * In production, use a proper JWT library like jsonwebtoken
 */
export function decodeJWT(token: string): DecodedToken | null {
  try {
    console.log('[Auth] Decoding JWT token...');

    // JWT has 3 parts: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('[Auth] Invalid JWT format - expected 3 parts, got:', parts.length);
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];

    // Add padding if needed for base64 decoding
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);

    // Decode base64
    const decodedPayload = atob(paddedPayload);

    // Parse JSON
    const tokenData = JSON.parse(decodedPayload) as DecodedToken;

    console.log('[Auth] Decoded token data:', {
      id: tokenData.id,
      email: tokenData.email,
      name: tokenData.name,
      role: tokenData.role,
      iat: tokenData.iat,
      exp: tokenData.exp
    });

    // Validate required fields
    if (!tokenData.id || !tokenData.email) {
      console.warn('[Auth] JWT missing required fields - id:', !!tokenData.id, 'email:', !!tokenData.email);
      return null;
    }

    // Check expiration
    if (tokenData.exp && Date.now() >= tokenData.exp * 1000) {
      console.warn('[Auth] JWT token expired - exp:', tokenData.exp, 'now:', Math.floor(Date.now() / 1000));
      return null;
    }

    console.log('[Auth] JWT decoded successfully - user ID:', tokenData.id);
    return tokenData;
  } catch (error) {
    console.warn('[Auth] Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Extract user ID from Authorization header with consistent ID generation
 */
export function getUserIdFromRequest(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return getConsistentUserId(token);
}

/**
 * Get user ID from localStorage token (client-side) with consistent ID generation
 */
export function getUserIdFromStorage(): string | null {
  if (typeof window === 'undefined') {
    return null; // Server-side
  }

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    return getConsistentUserId(token);
  } catch (error) {
    console.warn('[Auth] Failed to get user ID from storage:', error);
    return null;
  }
}

/**
 * Validate if a JWT token is still valid (not expired)
 */
export function isTokenValid(token: string): boolean {
  try {
    const decoded = decodeJWT(token);
    if (!decoded) {
      return false;
    }

    // Check if token has expired
    if (decoded.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp < currentTime) {
        console.warn('[Auth] Token has expired');
        return false;
      }
    }

    // Check if token has required fields
    if (!decoded.id && !decoded.email) {
      console.warn('[Auth] Token missing required fields');
      return false;
    }

    return true;
  } catch (error) {
    console.warn('[Auth] Token validation failed:', error);
    return false;
  }
}

/**
 * Get user data from localStorage (client-side)
 */
export function getUserFromStorage(): DecodedToken | null {
  if (typeof window === 'undefined') {
    return null; // Server-side
  }

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    return decodeJWT(token);
  } catch (error) {
    console.warn('[Auth] Failed to get user from storage:', error);
    return null;
  }
}



/**
 * REMOVED: Demo user ID generation eliminated in architecture redesign
 * All users must have valid NoCodeBackend accounts - no fallbacks allowed
 */
// This function has been removed to enforce single user ID strategy

/**
 * REDESIGNED: Single User ID Strategy - NoCodeBackend Only
 * NO FALLBACKS - Fail fast for invalid users
 */
export function getConsistentUserId(token: string): string | null {
  try {
    const decoded = decodeJWT(token);
    if (!decoded) {
      console.error('[Auth] Failed to decode JWT token');
      return null;
    }

    console.log('[Auth] REDESIGNED: Validating NoCodeBackend user ID:', {
      id: decoded.id,
      email: decoded.email
    });

    // ONLY accept valid NoCodeBackend numeric IDs (1-999999)
    if (decoded.id && /^\d+$/.test(decoded.id)) {
      const numericId = parseInt(decoded.id);
      if (numericId > 0 && numericId < 1000000) {
        console.log('[Auth] ✅ Valid NoCodeBackend user ID:', decoded.id);
        return decoded.id;
      }
    }

    // TEMPORARY: Allow existing demo IDs during transition period
    if (decoded.id && decoded.id.startsWith('user_')) {
      console.warn('[Auth] ⚠️ TEMPORARY: Allowing demo user ID during transition:', decoded.id);
      return decoded.id;
    }

    // FAIL FAST - No fallbacks, no demo modes
    console.error('[Auth] ❌ INVALID USER ID - Only NoCodeBackend numeric IDs accepted');
    console.error('[Auth] Received:', { id: decoded.id, type: typeof decoded.id });
    console.error('[Auth] Expected: Numeric string between 1-999999');

    return null;
  } catch (error) {
    console.error('[Auth] Failed to validate user ID:', error);
    return null;
  }
}

/**
 * Create a demo JWT token for testing
 * In production, this would be done by your auth service
 */
export function createDemoJWT(user: { id: string; email: string; name?: string; role?: string }): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role || 'manager',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };

  // Encode header and payload
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '');

  // For demo purposes, we'll use a simple signature
  // In production, use proper HMAC signing
  const signature = btoa(`demo_signature_${user.id}`).replace(/=/g, '');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Validate and refresh token if needed
 */
export function validateAndRefreshToken(): boolean {
  if (typeof window === 'undefined') {
    return false; // Server-side
  }

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }

    const decoded = decodeJWT(token);
    if (!decoded) {
      // Invalid token, clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }

    // Check if token expires soon (within 1 hour)
    if (decoded.exp && (decoded.exp * 1000 - Date.now()) < 60 * 60 * 1000) {
      console.log('[Auth] Token expires soon, should refresh');
      // In production, you would refresh the token here
    }

    return true;
  } catch (error) {
    console.warn('[Auth] Token validation failed:', error);
    return false;
  }
}
