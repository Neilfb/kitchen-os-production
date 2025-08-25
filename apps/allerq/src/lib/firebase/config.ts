import { initializeApp, getApps } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Firebase configuration - using direct values to avoid environment variable bundling issues
const firebaseConfig = {
  apiKey: "AIzaSyDHAd03wmwU63L8QMIofAYR2MQ1ZsvFMRE",
  authDomain: "allerq-forge.firebaseapp.com",
  projectId: "allerq-forge",
  storageBucket: "allerq-forge.firebasestorage.app",
  messagingSenderId: "582191632152",
  appId: "1:582191632152:web:24ccf1efc209565ca5586d"
};

// Only initialize Firebase in the browser
let auth: Auth | null = null;
let db: Firestore | null = null;

if (typeof window !== 'undefined') {
  // Client-side initialization
  console.log('[Firebase Config] Client-side initialization');
  
  console.log('[Firebase Config] Configuration loaded:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    hasApiKey: !!firebaseConfig.apiKey,
    apiKeyPrefix: firebaseConfig.apiKey.substring(0, 10)
  });

  // Validate configuration before initialization
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error('Firebase configuration is invalid');
  }

  // Initialize Firebase
  console.log('[Firebase Config] Initializing Firebase app...');
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

  // Initialize Firebase Auth
  console.log('[Firebase Config] Initializing Firebase Auth...');
  auth = getAuth(app);

  // Initialize Firestore
  console.log('[Firebase Config] Initializing Firestore...');
  db = getFirestore(app);

  console.log('[Firebase Config] ✅ Firebase initialized successfully');
} else {
  // Server-side fallback (for build time)
  console.log('[Firebase Config] Server-side environment - skipping initialization');
  auth = null;
  db = null;
}

// Export with null checks for server-side compatibility
export { auth, db };

// Default export for compatibility
export default { auth, db };
