# 🐛 AllerQ-Forge Debugging & Troubleshooting Guide
*Last Updated: December 27, 2024*

## 🚨 CRITICAL ISSUES & SOLUTIONS

### **Authentication Context Errors**
```
Error: "useAuth must be inside AuthProvider"
```

**Root Cause**: Component using wrong authentication context
**Solution**:
```typescript
// ❌ Wrong - Old context
import { useAuth } from "@/contexts/AuthContext";

// ✅ Correct - Firebase context
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
```

**Files to Check**:
- All components in `src/components/menu/`
- All pages in `src/app/restaurants/`
- Any component using authentication

### **401 API Authentication Errors**
```
Error: "HTTP 401: Authentication required"
```

**Root Cause**: Token verification or ownership verification failing
**Current Workaround**: Restaurant ownership verification temporarily disabled

**Debug Steps**:
```typescript
// 1. Check token generation
const token = await user.getIdToken();
console.log('[Debug] Token:', token);

// 2. Check API headers
console.log('[Debug] Headers:', {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
});

// 3. Check API response
const response = await fetch(url, { headers });
console.log('[Debug] Status:', response.status);
console.log('[Debug] Response:', await response.text());
```

**Temporary Fix Location**:
```
src/app/api/restaurants/[restaurantId]/menus/[menuId]/items/route.ts
Lines 40-50 and 99-108 - Ownership verification commented out
```

### **Build Failures on Vercel**
```
Error: "Module not found: Can't resolve 'fs'"
```

**Root Cause**: Server-side Node.js modules used in client-side code
**Solution**: Use browser-compatible alternatives

```typescript
// ❌ Wrong - Server-side only
import fs from 'fs';
import { Buffer } from 'buffer';

// ✅ Correct - Browser-compatible
const reader = new FileReader();
reader.readAsDataURL(file);
```

## 🔧 DEBUGGING WORKFLOWS

### **Authentication Debugging**
```typescript
// Add to component for debugging auth state
const { user, loading } = useFirebaseAuth();

useEffect(() => {
  console.log('[Auth Debug] User:', user);
  console.log('[Auth Debug] Loading:', loading);
  console.log('[Auth Debug] User ID:', user?.uid);
  
  if (user) {
    user.getIdToken().then(token => {
      console.log('[Auth Debug] Token:', token);
    });
  }
}, [user, loading]);
```

### **API Call Debugging**
```typescript
// Debug API calls step by step
const debugApiCall = async (url: string, options: RequestInit) => {
  console.log('[API Debug] URL:', url);
  console.log('[API Debug] Options:', options);
  
  try {
    const response = await fetch(url, options);
    console.log('[API Debug] Status:', response.status);
    console.log('[API Debug] Headers:', response.headers);
    
    const data = await response.json();
    console.log('[API Debug] Data:', data);
    
    return { response, data };
  } catch (error) {
    console.error('[API Debug] Error:', error);
    throw error;
  }
};
```

### **Firebase Service Debugging**
```typescript
// Debug Firebase operations
const debugFirebaseOperation = async (operation: string, collection: string) => {
  console.log(`[Firebase Debug] ${operation} on ${collection}`);
  
  try {
    const result = await firebaseOperation();
    console.log(`[Firebase Debug] ${operation} success:`, result);
    return result;
  } catch (error) {
    console.error(`[Firebase Debug] ${operation} error:`, error);
    throw error;
  }
};
```

## 🔍 COMMON ISSUES & SOLUTIONS

### **Menu Items Not Loading**
**Symptoms**: Empty state or loading spinner indefinitely
**Debug Steps**:
1. Check authentication state
2. Verify API endpoint response
3. Check Firebase collection structure
4. Verify user permissions

```typescript
// Debug menu items loading
const debugMenuItems = async () => {
  const { user } = useFirebaseAuth();
  if (!user) {
    console.log('[Debug] No user authenticated');
    return;
  }
  
  const token = await user.getIdToken();
  const response = await fetch(`/api/restaurants/${restaurantId}/menus/${menuId}/items`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  console.log('[Debug] Menu items response:', response.status);
  console.log('[Debug] Menu items data:', await response.json());
};
```

### **Restaurant Creation Failing**
**Symptoms**: Form submission errors or data not persisting
**Debug Steps**:
1. Check form validation
2. Verify file upload processing
3. Check Firebase Admin SDK configuration
4. Verify collection permissions

```typescript
// Debug restaurant creation
const debugRestaurantCreation = async (formData: FormData) => {
  console.log('[Debug] Form data:', Object.fromEntries(formData));
  
  const response = await fetch('/api/restaurants', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  
  console.log('[Debug] Creation response:', response.status);
  console.log('[Debug] Creation data:', await response.json());
};
```

### **Navigation Issues**
**Symptoms**: 404 errors or incorrect routing
**Debug Steps**:
1. Check file structure in `src/app/`
2. Verify dynamic route parameters
3. Check Link components and navigation

```typescript
// Debug navigation
const debugNavigation = () => {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  
  console.log('[Debug] Router:', router);
  console.log('[Debug] Params:', params);
  console.log('[Debug] Pathname:', pathname);
};
```

## 🛠️ DEVELOPMENT TOOLS

### **Browser DevTools Setup**
```javascript
// Add to browser console for debugging
window.debugAllerQ = {
  auth: () => console.log('Auth state:', window.firebase?.auth?.currentUser),
  api: (url) => fetch(url).then(r => r.json()).then(console.log),
  storage: () => console.log('LocalStorage:', localStorage),
  firebase: () => console.log('Firebase config:', window.firebase?.config)
};
```

### **Logging Configuration**
```typescript
// Enhanced logging for development
const logger = {
  auth: (message: string, data?: any) => console.log(`[AUTH] ${message}`, data),
  api: (message: string, data?: any) => console.log(`[API] ${message}`, data),
  firebase: (message: string, data?: any) => console.log(`[FIREBASE] ${message}`, data),
  error: (message: string, error?: any) => console.error(`[ERROR] ${message}`, error)
};
```

### **Environment Debugging**
```typescript
// Check environment configuration
const debugEnvironment = () => {
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Firebase Project:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  console.log('API Keys configured:', {
    firebase: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    places: !!process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY,
    admin: !!process.env.FIREBASE_PRIVATE_KEY
  });
};
```

## 🔄 RECOVERY PROCEDURES

### **Authentication Recovery**
```typescript
// Force authentication refresh
const refreshAuth = async () => {
  const { user } = useFirebaseAuth();
  if (user) {
    await user.getIdToken(true); // Force refresh
    window.location.reload();
  }
};
```

### **Data Recovery**
```typescript
// Recover from API failures
const recoverFromApiFailure = async (endpoint: string) => {
  try {
    // Retry with fresh token
    const user = auth.currentUser;
    const token = await user?.getIdToken(true);
    
    const response = await fetch(endpoint, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    return await response.json();
  } catch (error) {
    console.error('Recovery failed:', error);
    // Fallback to cached data or redirect to safe state
  }
};
```

### **State Recovery**
```typescript
// Reset component state
const resetComponentState = () => {
  setLoading(false);
  setError(null);
  setData([]);
  // Trigger re-fetch
  fetchData();
};
```

## 📊 MONITORING & ALERTS

### **Production Monitoring**
```typescript
// Add to production builds
const monitorApiCalls = (url: string, status: number, duration: number) => {
  if (status >= 400) {
    console.error(`[MONITOR] API Error: ${url} - ${status}`);
    // Send to monitoring service
  }
  
  if (duration > 5000) {
    console.warn(`[MONITOR] Slow API: ${url} - ${duration}ms`);
    // Send to monitoring service
  }
};
```

### **Error Tracking**
```typescript
// Global error handler
window.addEventListener('error', (event) => {
  console.error('[GLOBAL ERROR]', event.error);
  // Send to error tracking service
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[UNHANDLED REJECTION]', event.reason);
  // Send to error tracking service
});
```

## 🎯 QUICK FIXES CHECKLIST

### **When Menu Items Won't Load**
- [ ] Check user authentication state
- [ ] Verify API endpoint exists and responds
- [ ] Check browser console for errors
- [ ] Verify Firebase Admin SDK configuration
- [ ] Check restaurant ownership verification (currently disabled)

### **When Authentication Fails**
- [ ] Check Firebase configuration
- [ ] Verify environment variables
- [ ] Check token expiration
- [ ] Verify user permissions
- [ ] Check authentication context usage

### **When Build Fails**
- [ ] Check for Node.js imports in client code
- [ ] Verify all dependencies are installed
- [ ] Check TypeScript errors
- [ ] Verify environment variables in Vercel

### **When API Returns 500**
- [ ] Check server logs in Vercel
- [ ] Verify Firebase Admin SDK setup
- [ ] Check database permissions
- [ ] Verify request format and headers

---

*This debugging guide provides systematic approaches to identify and resolve common issues in the AllerQ-Forge application.*
