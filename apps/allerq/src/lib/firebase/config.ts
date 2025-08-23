import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration - using direct values to avoid environment variable bundling issues
const firebaseConfig = {
  apiKey: "AIzaSyDHAd03wmwU63L8QMIofAYR2MQ1ZsvFMRE",
  authDomain: "allerq-forge.firebaseapp.com",
  projectId: "allerq-forge",
  storageBucket: "allerq-forge.firebasestorage.app",
  messagingSenderId: "582191632152",
  appId: "1:582191632152:web:24ccf1efc209565ca5586d"
};

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
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
console.log('[Firebase Config] Initializing Firebase Auth...');
export const auth = getAuth(app);

// Initialize Firestore
console.log('[Firebase Config] Initializing Firestore...');
export const db = getFirestore(app);

console.log('[Firebase Config] ✅ Firebase initialized successfully');

// Export the app for other Firebase services if needed
export { app };
export default app;
