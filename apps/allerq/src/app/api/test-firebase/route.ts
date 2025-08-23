/**
 * Simple Firebase Test Endpoint
 * 
 * This endpoint tests Firebase Admin SDK initialization and basic connectivity
 */

import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps, cert } from "firebase-admin/app";

export async function GET(request: NextRequest) {
  try {
    console.log('[Test Firebase] Starting Firebase test...');
    
    // Initialize Firebase Admin SDK if not already done
    if (!getApps().length) {
      console.log('[Test Firebase] Initializing Firebase Admin SDK...');
      
      // Handle private key formatting with multiple strategies
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      
      if (privateKey) {
        console.log('[Test Firebase] Raw private key length:', privateKey.length);
        console.log('[Test Firebase] Raw private key start:', privateKey.substring(0, 50));
        
        // Remove outer quotes if present
        if ((privateKey.startsWith('"') && privateKey.endsWith('"')) || 
            (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
          privateKey = privateKey.slice(1, -1);
          console.log('[Test Firebase] Removed outer quotes, new length:', privateKey.length);
        }
        
        // Replace literal \n with actual newlines
        privateKey = privateKey.replace(/\\n/g, '\n');
        console.log('[Test Firebase] After newline replacement, contains actual newlines:', privateKey.includes('\n'));
        
        // Validate the key format
        if (!privateKey.includes('-----BEGIN PRIVATE KEY-----') || !privateKey.includes('-----END PRIVATE KEY-----')) {
          throw new Error('Invalid private key format: missing BEGIN/END markers');
        }
        
        console.log('[Test Firebase] Final private key format check:', {
          hasBegin: privateKey.includes('-----BEGIN PRIVATE KEY-----'),
          hasEnd: privateKey.includes('-----END PRIVATE KEY-----'),
          hasNewlines: privateKey.includes('\n'),
          length: privateKey.length
        });
      }

      const credentials = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      };

      console.log('[Test Firebase] Credentials check:', {
        projectId: !!credentials.projectId,
        clientEmail: !!credentials.clientEmail,
        privateKey: !!credentials.privateKey,
        privateKeyLength: credentials.privateKey?.length,
        projectIdValue: credentials.projectId,
        clientEmailValue: credentials.clientEmail,
      });

      if (!credentials.projectId || !credentials.clientEmail || !credentials.privateKey) {
        throw new Error('Missing required Firebase credentials');
      }

      initializeApp({
        credential: cert(credentials),
      });
      console.log('[Test Firebase] ✅ Firebase Admin initialized successfully');
    } else {
      console.log('[Test Firebase] Firebase Admin already initialized');
    }

    // Test Firestore connectivity
    console.log('[Test Firebase] Testing Firestore connectivity...');
    const db = getFirestore();
    
    // Simple test - try to get a collection reference
    const testCollection = db.collection('_test');
    console.log('[Test Firebase] ✅ Firestore collection reference created');
    
    // Try a simple write operation
    const testDoc = await testCollection.add({
      test: true,
      timestamp: new Date(),
      source: 'test-firebase-endpoint'
    });
    console.log('[Test Firebase] ✅ Test document written with ID:', testDoc.id);
    
    // Try to read it back
    const readDoc = await testDoc.get();
    const readSuccess = readDoc.exists;
    console.log('[Test Firebase] ✅ Test document read success:', readSuccess);
    
    // Clean up
    await testDoc.delete();
    console.log('[Test Firebase] ✅ Test document deleted');
    
    return NextResponse.json({
      success: true,
      message: 'Firebase Admin SDK is working correctly',
      timestamp: new Date().toISOString(),
      tests: {
        initialization: 'success',
        firestoreWrite: 'success',
        firestoreRead: readSuccess ? 'success' : 'failed',
        firestoreDelete: 'success'
      }
    });
    
  } catch (error) {
    console.error('[Test Firebase] ❌ Test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        envVars: {
          hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
          hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
          privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length
        }
      }
    }, { status: 500 });
  }
}
