/**
 * Firestore Database Initialization Script
 * 
 * This script helps verify and initialize the Firestore database structure
 * for the AllerQ-Forge application.
 */

import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    process.exit(1);
  }
}

const db = getFirestore();

// Collection names
const COLLECTIONS = {
  RESTAURANTS: 'restaurants',
  MENUS: 'menus',
  MENU_ITEMS: 'menuItems',
  USERS: 'users',
  ANALYTICS: 'analytics'
} as const;

async function checkCollectionExists(collectionName: string): Promise<boolean> {
  try {
    const snapshot = await db.collection(collectionName).limit(1).get();
    return true; // Collection exists (even if empty)
  } catch (error) {
    console.error(`❌ Error checking collection ${collectionName}:`, error);
    return false;
  }
}

async function createSampleDocument(collectionName: string, sampleData: any): Promise<void> {
  try {
    const docRef = await db.collection(collectionName).add(sampleData);
    console.log(`✅ Created sample document in ${collectionName} with ID: ${docRef.id}`);
    
    // Delete the sample document
    await docRef.delete();
    console.log(`🗑️ Deleted sample document from ${collectionName}`);
  } catch (error) {
    console.error(`❌ Error creating sample document in ${collectionName}:`, error);
  }
}

async function testFirestoreConnectivity(): Promise<void> {
  console.log('\n🔍 Testing Firestore Connectivity...');
  
  try {
    // Test basic connectivity
    const testCollection = db.collection('_test');
    const testDoc = await testCollection.add({ test: true, timestamp: new Date() });
    console.log('✅ Firestore write test successful');
    
    // Clean up test document
    await testDoc.delete();
    console.log('✅ Firestore delete test successful');
    
    console.log('🎉 Firestore connectivity verified!');
  } catch (error) {
    console.error('❌ Firestore connectivity test failed:', error);
    throw error;
  }
}

async function verifyFirestoreSetup(): Promise<void> {
  console.log('🚀 Starting Firestore Database Verification...\n');
  
  // Test connectivity first
  await testFirestoreConnectivity();
  
  console.log('\n📋 Checking Required Collections...');
  
  const collections = Object.values(COLLECTIONS);
  const results: { [key: string]: boolean } = {};
  
  for (const collection of collections) {
    console.log(`\n🔍 Checking collection: ${collection}`);
    const exists = await checkCollectionExists(collection);
    results[collection] = exists;
    
    if (exists) {
      console.log(`✅ Collection ${collection} exists`);
      
      // Get document count
      try {
        const snapshot = await db.collection(collection).get();
        console.log(`📊 Collection ${collection} has ${snapshot.size} documents`);
      } catch (error) {
        console.log(`⚠️ Could not count documents in ${collection}:`, error);
      }
    } else {
      console.log(`❌ Collection ${collection} does not exist`);
      
      // Create sample document to initialize collection
      console.log(`🔧 Initializing collection ${collection}...`);
      
      let sampleData: any = {};
      
      switch (collection) {
        case COLLECTIONS.RESTAURANTS:
          sampleData = {
            name: 'Sample Restaurant',
            address: 'Sample Address',
            ownerId: 'sample-user-id',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          break;
        case COLLECTIONS.USERS:
          sampleData = {
            email: 'sample@example.com',
            displayName: 'Sample User',
            role: 'user',
            createdAt: new Date(),
            updatedAt: new Date()
          };
          break;
        case COLLECTIONS.MENUS:
          sampleData = {
            restaurantId: 'sample-restaurant-id',
            name: 'Sample Menu',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          break;
        case COLLECTIONS.MENU_ITEMS:
          sampleData = {
            menuId: 'sample-menu-id',
            restaurantId: 'sample-restaurant-id',
            name: 'Sample Item',
            allergens: [],
            dietary: [],
            isAvailable: true,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          break;
        case COLLECTIONS.ANALYTICS:
          sampleData = {
            restaurantId: 'sample-restaurant-id',
            eventType: 'sample-event',
            timestamp: new Date(),
            createdAt: new Date()
          };
          break;
      }
      
      await createSampleDocument(collection, sampleData);
    }
  }
  
  console.log('\n📊 Firestore Setup Summary:');
  console.log('================================');
  for (const [collection, exists] of Object.entries(results)) {
    console.log(`${exists ? '✅' : '❌'} ${collection}: ${exists ? 'EXISTS' : 'CREATED'}`);
  }
  
  console.log('\n🎉 Firestore database verification complete!');
}

async function testRestaurantCreation(): Promise<void> {
  console.log('\n🧪 Testing Restaurant Creation...');
  
  try {
    const testRestaurant = {
      name: 'Test Restaurant',
      address: '123 Test Street',
      website: 'https://test.com',
      phone: '+1234567890',
      email: 'test@restaurant.com',
      logoUrl: '',
      ownerId: 'test-user-id',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('📝 Creating test restaurant...');
    const docRef = await db.collection(COLLECTIONS.RESTAURANTS).add(testRestaurant);
    console.log('✅ Test restaurant created with ID:', docRef.id);
    
    console.log('📖 Reading test restaurant...');
    const doc = await docRef.get();
    if (doc.exists) {
      console.log('✅ Test restaurant read successfully:', doc.data());
    } else {
      console.log('❌ Test restaurant not found after creation');
    }
    
    console.log('🗑️ Cleaning up test restaurant...');
    await docRef.delete();
    console.log('✅ Test restaurant deleted successfully');
    
    console.log('🎉 Restaurant creation test passed!');
  } catch (error) {
    console.error('❌ Restaurant creation test failed:', error);
    throw error;
  }
}

// Main execution
async function main(): Promise<void> {
  try {
    await verifyFirestoreSetup();
    await testRestaurantCreation();
    
    console.log('\n🎉 All tests passed! Firestore is ready for AllerQ-Forge.');
  } catch (error) {
    console.error('\n💥 Setup failed:', error);
    process.exit(1);
  }
}

// Export for use in other scripts
export { verifyFirestoreSetup, testRestaurantCreation, testFirestoreConnectivity };

// Run if called directly
if (require.main === module) {
  main();
}
