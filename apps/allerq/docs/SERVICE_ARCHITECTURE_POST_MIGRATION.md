# Service Architecture - Post NoCodeBackend Migration

## 🏗️ Current Service Architecture

**Last Updated**: December 27, 2024  
**Status**: Production Ready  
**Architecture**: Firebase-based with clear service separation

## 📊 Service Overview

### **Authentication Services**
- **Primary**: `FirebaseAuthContext` - Unified authentication across application
- **Location**: `src/contexts/FirebaseAuthContext.tsx`
- **Usage**: All components use `useFirebaseAuth()` hook
- **Features**: Sign up, sign in, sign out, token management, session persistence

### **Restaurant Services**

#### **Server-Side (API Routes)**
- **Service**: `serverRestaurantService`
- **Location**: `src/lib/services/serverRestaurantService.ts`
- **Purpose**: Firebase Admin SDK operations for API routes
- **Methods**: `getRestaurant()`, `updateRestaurant()`, `createRestaurant()`
- **Authentication**: Firebase Admin token verification

#### **Client-Side (React Components)**
- **Service**: `clientRestaurantService`
- **Location**: `src/lib/services/clientRestaurantService.ts`
- **Purpose**: Client-side Firebase operations
- **Methods**: `createRestaurant()`, `getRestaurantsByOwner()`, `updateRestaurant()`
- **Authentication**: Firebase client SDK with user tokens

### **Menu Services**
- **Service**: `firebaseMenuService`
- **Location**: `src/lib/services/firebaseMenuService.ts`
- **Purpose**: Menu and menu item operations
- **Methods**: `createMenu()`, `getMenus()`, `createMenuItem()`, `updateMenuItem()`
- **Collections**: `menus`, `menuItems`

## 🎯 Service Responsibilities

### **Domain Separation**
Each service handles a specific domain with clear boundaries:

1. **Authentication Domain**
   - User registration and login
   - Session management
   - Token handling
   - Role-based access

2. **Restaurant Domain**
   - Restaurant CRUD operations
   - Owner verification
   - Logo management
   - Team management

3. **Menu Domain**
   - Menu CRUD operations
   - Menu item management
   - Category organization
   - Public menu access

4. **QR Code Domain**
   - QR code generation
   - QR code management
   - Restaurant/menu linking

## 🔧 Service Patterns

### **Server Service Pattern**
```typescript
// For API routes - uses Firebase Admin SDK
class ServerRestaurantService {
  private async getDb() {
    return getFirestore();
  }
  
  async getRestaurant(id: string, userId: string) {
    // Firebase Admin operations
  }
}
```

### **Client Service Pattern**
```typescript
// For React components - uses Firebase client SDK
class ClientRestaurantService {
  async createRestaurant(data: RestaurantData, userId: string) {
    // Firebase client operations
  }
}
```

### **Hook Pattern**
```typescript
// Specialized hooks for specific use cases
export function useRestaurants() {
  const { user } = useFirebaseAuth();
  // Hook-specific logic
}
```

## 📁 File Organization

### **Services Directory Structure**
```
src/lib/services/
├── serverRestaurantService.ts    # API route operations
├── clientRestaurantService.ts    # Client-side operations
├── firebaseMenuService.ts        # Menu operations
└── *.backup.ts                   # Legacy services (removed)
```

### **Hooks Directory Structure**
```
src/hooks/
├── useRestaurants.ts             # Restaurant data management
├── useMenus.ts                   # Menu data management
├── useMenuItems.ts               # Menu item operations
├── useQrCodes.ts                 # QR code management
├── useCategories.ts              # Menu categories
├── useDishSearch.ts              # Menu item search
├── useTeam.ts                    # Team management
├── useAnalytics.ts               # Analytics tracking
├── useBilling.ts                 # Subscription management
├── useCustomers.ts               # Customer management
└── *.backup.ts                   # Legacy hooks (removed)
```

## 🔐 Authentication Flow

### **Client-Side Authentication**
1. User signs up/in through Firebase Auth
2. Firebase returns ID token
3. Token stored in Firebase Auth context
4. Components access user via `useFirebaseAuth()`

### **Server-Side Authentication**
1. Client sends requests with `Authorization: Bearer <token>`
2. API routes verify token with Firebase Admin SDK
3. Extract user ID from verified token
4. Use user ID for data access control

## 🚦 Service Usage Guidelines

### **When to Use Server Services**
- API route implementations
- Server-side data validation
- Admin operations
- Bulk operations

### **When to Use Client Services**
- React component data operations
- Real-time data subscriptions
- User-initiated actions
- Form submissions

### **When to Use Hooks**
- Component state management
- Data fetching and caching
- Specialized business logic
- Cross-component data sharing

## 🔍 Service Conflict Analysis

### **Current Status** (Post-Migration)
The service conflict analyzer reports 5 domains with multiple services, but these are **architectural patterns, not conflicts**:

1. **Restaurant Domain (7 services)**: Server + Client services + specialized hooks ✅
2. **Menu Domain (6 services)**: Menu service + specialized hooks for different operations ✅
3. **QR Domain (2 services)**: QR management + customization hooks ✅
4. **Analytics Domain (2 services)**: Tracking vs reporting separation ✅
5. **Unknown Domain (3 services)**: Billing, customers, address verification ✅

### **Why These Are Not Conflicts**
- **Server vs Client**: Different execution environments require different services
- **Specialized Hooks**: Each hook serves a specific use case (search, categories, etc.)
- **Class vs Export**: Analyzer detects both class definition and exported instance

## 🧪 Testing Service Architecture

### **Unit Testing**
- Test each service method independently
- Mock Firebase dependencies
- Verify error handling

### **Integration Testing**
- Test service interactions
- Verify authentication flow
- Test data persistence

### **End-to-End Testing**
- Test complete user workflows
- Verify cross-service communication
- Test error scenarios

## 🚀 Future Service Development

### **Adding New Services**
1. Follow established patterns (Server/Client separation)
2. Use Firebase SDK consistently
3. Implement proper error handling
4. Add comprehensive logging
5. Update this documentation

### **Service Naming Convention**
- **Server Services**: `server[Domain]Service.ts`
- **Client Services**: `client[Domain]Service.ts`
- **Specialized Services**: `firebase[Domain]Service.ts`
- **Hooks**: `use[Domain].ts` or `use[SpecificFunction].ts`

### **Best Practices**
- Single responsibility per service
- Clear domain boundaries
- Consistent error handling
- Comprehensive logging
- Type safety with TypeScript
- Proper authentication checks

---

**Service Architecture is Clean and Production Ready** ✅  
**Clear separation of concerns with no actual conflicts**
