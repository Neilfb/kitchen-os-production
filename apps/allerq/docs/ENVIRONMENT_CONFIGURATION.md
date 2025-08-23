# Environment Configuration Guide

## Firebase Backend Configuration

### Current Implementation
AllerQ-Forge uses **Firebase Firestore** for data persistence, providing:
- ✅ Reliable cloud database storage
- ✅ Real-time data synchronization
- ✅ Scalable architecture
- ✅ Secure authentication

## Required Environment Variables

### Production Environment (Vercel)
```bash
# Firebase Configuration (CRITICAL)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_service_account_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key

# Google Places API (Optional - has fallback)
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://aller-q-forge.vercel.app
```

### Development Environment (.env.local)
```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_service_account_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key

# Google Places API
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Demo Mode Override (for testing)
DEMO_MODE=false
```

## Configuration Steps

### 1. Firebase Setup
1. Create or access your Firebase project
2. Generate a service account key
3. Set Firebase environment variables in Vercel
4. Configure Firestore security rules

### 2. Vercel Environment Configuration
1. Go to Vercel dashboard → AllerQ-Forge project
2. Navigate to Settings → Environment Variables
3. Add the required variables above
4. Redeploy the application

### 3. Verification
After configuration, check:
- Visit `/api/debug/environment` to verify configuration
- `demoMode` should be `false`
- Restaurant creation should persist across browser sessions

## Data Migration (If Needed)

If users have existing data in localStorage that needs to be preserved:

### Export Existing Data
```javascript
// Run in browser console
const data = localStorage.getItem('allerq-demo-data');
console.log('Existing data:', data);
// Copy this data for manual migration
```

### Manual Data Recovery
1. Export data from localStorage before configuration
2. After backend is configured, manually recreate restaurants
3. Contact users who experienced data loss for manual recovery

## Monitoring and Prevention

### Health Checks
- Monitor `/api/debug/environment` endpoint
- Set up alerts for demo mode activation
- Regular verification of environment variables

### User Communication
- Notify affected users about data loss incident
- Provide instructions for data recovery
- Implement backup/export functionality

## Technical Implementation Details

### Demo Mode Detection Logic
```typescript
const DEMO_MODE = process.env.DEMO_MODE === 'true' || !process.env.NOCODEBACKEND_SECRET_KEY;
```

### Data Flow
- **Demo Mode**: localStorage only → Data loss risk
- **Production Mode**: NoCodeBackend API → Persistent storage

### Fallback Strategy
- Always maintain localStorage as cache
- Sync with backend when available
- Graceful degradation to demo mode if backend fails

## Immediate Actions Required

1. **CRITICAL**: Set `NOCODEBACKEND_SECRET_KEY` in Vercel
2. **HIGH**: Redeploy application
3. **MEDIUM**: Notify affected users
4. **LOW**: Implement data export functionality

## Contact Information

- NoCodeBackend Support: [support contact]
- Vercel Configuration: [admin contact]
- User Communication: [customer service contact]
