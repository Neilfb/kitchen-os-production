// src/lib/middleware/requireRole.ts

// Legacy AuthContext removed - define UserRole locally
type UserRole = 'admin' | 'manager' | 'staff';
import { cookies, headers } from 'next/headers';

export class AuthError extends Error {
  constructor(message: string, public status: number = 401) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function requireRole(requiredRoles: UserRole | UserRole[]) {
  console.log('🔍 requireRole called with:', requiredRoles);

  // Try to get token from cookies first, then from Authorization header
  const cookiesStore = await cookies();
  const headersStore = await headers();

  let token = cookiesStore.get('token')?.value;
  console.log('🔍 Token from cookies:', token ? 'found' : 'not found');

  // If no token in cookies, check Authorization header
  if (!token) {
    const authHeader = headersStore.get('authorization');
    console.log('🔍 Authorization header:', authHeader ? 'found' : 'not found');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log('🔍 Token from header:', token ? 'extracted' : 'failed to extract');
    }
  }

  if (!token) {
    console.log('❌ No token found');
    throw new AuthError('Authentication required', 401);
  }

  try {
    console.log('🔍 Verifying token...');
    // Verify token and get user data
    const user = await verifyToken(token);
    console.log('✅ Token verified, user:', user);

    if (!user.role) {
      console.log('❌ User has no role');
      throw new AuthError('User role not found', 401);
    }

    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    console.log('🔍 Required roles:', roles);
    console.log('🔍 User role:', user.role);

    if (!roles.includes(user.role)) {
      console.log('❌ User role not authorized');
      throw new AuthError('Insufficient permissions', 403);
    }

    console.log('✅ Role authorization successful');
    return user;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    console.error('❌ Token verification failed:', error);
    throw new AuthError('Invalid token', 401);
  }
}

async function verifyToken(token: string) {
  const API_KEY = process.env.NOCODEBACKEND_SECRET_KEY;

  if (!API_KEY) {
    console.log('🔍 Demo mode - using JWT token verification');
    // Demo mode - decode JWT token
    try {
      // Import the JWT decoding function
      const { decodeJWT } = await import('@/lib/auth');
      const decoded = decodeJWT(token);

      if (!decoded) {
        throw new Error('Invalid JWT token');
      }

      return {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role as UserRole,
        name: decoded.name || decoded.email.split('@')[0]
      };
    } catch (error) {
      console.error('JWT verification failed:', error);
      throw new Error('Invalid JWT token');
    }
  }

  // For production with NoCodeBackend, you'd verify JWT tokens properly
  try {
    // Import the JWT decoding function
    const { decodeJWT } = await import('@/lib/auth');
    const decoded = decodeJWT(token);

    if (!decoded) {
      throw new Error('Invalid JWT token');
    }

    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role as UserRole,
      name: decoded.name || decoded.email.split('@')[0]
    };

  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid token');
  }
}
