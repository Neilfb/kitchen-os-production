'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

// Stage-1 MVP Role definitions (as per PROJECT_OVERVIEW.md)
export type UserRole = 'superadmin' | 'admin' | 'manager';

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  role?: UserRole;
  getIdToken: () => Promise<string>;
}

interface FirebaseAuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roleOrRoles: UserRole | UserRole[]) => boolean;
  refreshUserProfile: () => Promise<void>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export function useFirebaseAuth() {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
}

interface FirebaseAuthProviderProps {
  children: React.ReactNode;
}

export function FirebaseAuthProvider({ children }: FirebaseAuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from Firestore to get role information
  const fetchUserProfile = async (firebaseUser: User): Promise<AuthUser> => {
    try {
      console.log('[FirebaseAuth] Fetching user profile for:', firebaseUser.uid);

      if (!db) {
        console.warn('[FirebaseAuth] Firestore not available, using default role');
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          emailVerified: firebaseUser.emailVerified,
          role: 'manager',
          getIdToken: () => firebaseUser.getIdToken()
        };
      }

      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      let role: UserRole = 'manager'; // Default role

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('[FirebaseAuth] User profile found:', userData);

        // Map legacy roles to Stage-1 roles
        const userRole = userData.role;
        if (userRole === 'restaurant_admin' || userRole === 'admin') {
          role = 'admin';
        } else if (userRole === 'superadmin') {
          role = 'superadmin';
        } else {
          role = 'manager';
        }
      } else {
        console.log('[FirebaseAuth] No user profile found, using default role');
      }

      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        emailVerified: firebaseUser.emailVerified,
        role,
        getIdToken: () => firebaseUser.getIdToken()
      };
    } catch (error) {
      console.error('[FirebaseAuth] Error fetching user profile:', error);
      // Return user with default role if profile fetch fails
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        emailVerified: firebaseUser.emailVerified,
        role: 'manager',
        getIdToken: () => firebaseUser.getIdToken()
      };
    }
  };

  useEffect(() => {
    // Only set up auth listener if we're on the client side
    if (typeof window === 'undefined') {
      console.log('[FirebaseAuth] Server-side environment, skipping auth setup');
      setLoading(false);
      return;
    }

    // Only set up auth listener if auth is available
    if (!auth) {
      console.log('[FirebaseAuth] Auth not available, setting loading to false');
      setLoading(false);
      return;
    }

    console.log('[FirebaseAuth] Setting up auth state listener');

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[FirebaseAuth] Auth state changed:', {
        hasUser: !!firebaseUser,
        uid: firebaseUser?.uid,
        email: firebaseUser?.email,
        emailVerified: firebaseUser?.emailVerified
      });

      if (firebaseUser) {
        // Fetch user profile with role information
        const userWithProfile = await fetchUserProfile(firebaseUser);
        setUser(userWithProfile);
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => {
      console.log('[FirebaseAuth] Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Firebase Auth not available');
    }

    try {
      console.log('[FirebaseAuth] Starting login for:', email);
      setLoading(true);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('[FirebaseAuth] ✅ Login successful:', userCredential.user.uid);
      
    } catch (error: any) {
      console.error('[FirebaseAuth] Login failed:', error);
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, displayName?: string) => {
    if (!auth) {
      throw new Error('Firebase Auth not available');
    }

    try {
      console.log('[FirebaseAuth] Starting signup for:', email);
      setLoading(true);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name if provided
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
        console.log('[FirebaseAuth] Display name updated:', displayName);
      }
      
      console.log('[FirebaseAuth] ✅ Signup successful:', userCredential.user.uid);
      
    } catch (error: any) {
      console.error('[FirebaseAuth] Signup failed:', error);
      throw new Error(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!auth) {
      throw new Error('Firebase Auth not available');
    }

    try {
      console.log('[FirebaseAuth] Starting logout');
      await signOut(auth);
      console.log('[FirebaseAuth] ✅ Logout successful');
    } catch (error: any) {
      console.error('[FirebaseAuth] Logout failed:', error);
      throw new Error(error.message || 'Logout failed');
    }
  };

  const hasRole = (roleOrRoles: UserRole | UserRole[]): boolean => {
    if (!user || !user.role) return false;
    
    const roles = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];
    return roles.includes(user.role);
  };

  // Refresh user profile (useful after role changes)
  const refreshUserProfile = async (): Promise<void> => {
    if (auth && auth.currentUser) {
      console.log('[FirebaseAuth] Refreshing user profile');
      const userWithProfile = await fetchUserProfile(auth.currentUser);
      setUser(userWithProfile);
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    hasRole,
    refreshUserProfile
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}
