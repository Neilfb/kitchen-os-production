// Set up test environment variables
process.env.NEXT_PUBLIC_BASE_URL = 'https://test.aller-q-forge.vercel.app'
process.env.NEXTAUTH_URL = 'https://test.aller-q-forge.vercel.app'
process.env.NEXTAUTH_SECRET = 'test-secret'
// Firebase test configuration
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project'
process.env.FIREBASE_CLIENT_EMAIL = 'test@test-project.iam.gserviceaccount.com'
process.env.FIREBASE_PRIVATE_KEY = 'test-private-key'
// Use Object.defineProperty to set readonly property instead of direct assignment
Object.defineProperty(process.env, 'NODE_ENV', { value: 'test' })
process.env.IS_TEST_ENV = 'true'
