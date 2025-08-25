/**
 * Firebase Firestore Configuration and Utilities
 * 
 * This module provides a clean, type-safe interface for all Firestore operations
 * in the AllerQ-Forge application. It replaces the previous NoCodeBackend integration
 * with a stable, Firebase-native solution.
 */

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  FirestoreError
} from 'firebase/firestore';
import { db } from './config';

// Export db for compatibility
export { db };

// Collection names
export const COLLECTIONS = {
  RESTAURANTS: 'restaurants',
  MENUS: 'menus',
  MENU_ITEMS: 'menuItems',
  USERS: 'users',
  ANALYTICS: 'analytics'
} as const;

// Type definitions for Firestore documents
export interface FirestoreRestaurant {
  id?: string; // Firestore document ID
  name: string;
  address?: string;
  website?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  location?: {
    lat: number;
    lng: number;
    formatted: string;
    placeId?: string;
  };
  ownerId: string; // Firebase Auth UID
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

export interface FirestoreMenu {
  id?: string;
  restaurantId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreMenuItem {
  id?: string;
  menuId: string;
  restaurantId: string;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  allergens: string[];
  dietary: string[];
  isAvailable: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreUser {
  id?: string; // Firebase Auth UID
  email: string;
  displayName?: string;
  role: 'user' | 'admin' | 'superadmin';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
}

// Utility functions for Firestore operations
export class FirestoreError extends Error {
  constructor(
    message: string,
    public code: string,
    public operation: string
  ) {
    super(message);
    this.name = 'FirestoreError';
  }
}

// Convert Firestore document to typed object
export function convertFirestoreDoc<T extends DocumentData>(
  doc: QueryDocumentSnapshot<DocumentData>
): T & { id: string } {
  return {
    id: doc.id,
    ...doc.data()
  } as T & { id: string };
}

// Error handling wrapper for Firestore operations
export async function handleFirestoreOperation<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  try {
    console.log(`[Firestore] Starting ${operationName}`);
    const result = await operation();
    console.log(`[Firestore] ✅ ${operationName} completed successfully`);
    return result;
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error(`[Firestore] ❌ ${operationName} failed:`, {
      code: firestoreError.code,
      message: firestoreError.message,
      operation: operationName
    });
    
    throw new FirestoreError(
      `${operationName} failed: ${firestoreError.message}`,
      firestoreError.code || 'unknown',
      operationName
    );
  }
}

// Get collection reference with type safety
export function getTypedCollection(collectionName: string) {
  if (!db) {
    throw new Error('Firestore not available');
  }
  return collection(db, collectionName);
}

// Get document reference with type safety
export function getTypedDoc(collectionName: string, docId: string) {
  if (!db) {
    throw new Error('Firestore not available');
  }
  return doc(db, collectionName, docId);
}

// Create server timestamp
export function createTimestamp() {
  return serverTimestamp();
}

// Validate required fields for documents
export function validateRequiredFields<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[],
  operationName: string
): void {
  const missingFields = requiredFields.filter(field => 
    data[field] === undefined || data[field] === null || data[field] === ''
  );
  
  if (missingFields.length > 0) {
    throw new FirestoreError(
      `Missing required fields: ${missingFields.join(', ')}`,
      'invalid-argument',
      operationName
    );
  }
}

// Log Firestore operation for debugging
export function logFirestoreOperation(
  operation: string,
  collection: string,
  docId?: string,
  data?: any
): void {
  console.log(`[Firestore] ${operation}`, {
    collection,
    docId,
    dataKeys: data ? Object.keys(data) : undefined,
    timestamp: new Date().toISOString()
  });
}

// Export common Firestore functions for convenience
export {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
};
