# AllerQ-Forge Service Ownership Registry

## 🎯 Purpose
This document maintains a single source of truth for service ownership to prevent architectural conflicts like the "4 competing restaurant services" issue.

## 📋 Service Registry

### Primary Domain Services

#### 🏪 Restaurant Domain
- **Primary Service**: `ClientRestaurantService`
- **File**: `src/lib/services/clientRestaurantService.ts`
- **Responsibilities**: All restaurant CRUD operations, validation, business logic
- **Authentication**: Firebase Client SDK
- **Storage**: Firestore direct access
- **Status**: ✅ Active
- **Owner**: Core Team

**Deprecated Services** (DO NOT USE):
- ❌ `AdminRestaurantService` - Replaced by ClientRestaurantService
- ❌ `FirebaseRestaurantService` - Legacy NoCodeBackend hybrid
- ❌ `useFirebaseRestaurants` - API-based hook causing 401 errors

#### 🍽️ Menu Domain
- **Primary Service**: `FirebaseMenuService`
- **File**: `src/lib/services/firebaseMenuService.ts`
- **Responsibilities**: Menu CRUD, menu items, AI integration
- **Authentication**: Firebase Admin SDK (server-side)
- **Storage**: Firestore via Admin SDK
- **Status**: ✅ Active
- **Owner**: Core Team

#### 👤 User/Authentication Domain
- **Primary Service**: `FirebaseAuthContext`
- **File**: `src/contexts/FirebaseAuthContext.tsx`
- **Responsibilities**: User authentication, session management
- **Authentication**: Firebase Auth
- **Storage**: Firebase Auth + Firestore user profiles
- **Status**: ✅ Active
- **Owner**: Core Team

**Deprecated Services** (DO NOT USE):
- ❌ `AuthContext` - Legacy custom JWT system
- ❌ `SupabaseAuthContext` - Abandoned Supabase migration

#### 💳 Subscription Domain
- **Primary Service**: `SubscriptionService` (TBD)
- **File**: `src/lib/services/subscriptionService.ts`
- **Responsibilities**: Subscription management, billing
- **Authentication**: Firebase Auth
- **Storage**: Firestore + Stripe integration
- **Status**: 🚧 Planned
- **Owner**: Core Team

### Utility Services

#### 📁 File Upload
- **Service**: `FileUploadService`
- **File**: `src/lib/fileUpload.ts`
- **Responsibilities**: File processing, logo uploads, base64 conversion
- **Authentication**: Firebase Auth
- **Storage**: Base64 in Firestore (current), Cloud Storage (planned)
- **Status**: ✅ Active
- **Owner**: Core Team

#### 🌍 Location Services
- **Service**: `GooglePlacesService`
- **File**: `src/lib/location/googlePlaces.ts`
- **Responsibilities**: Address verification, geocoding
- **Authentication**: Google API Key
- **Storage**: External API only
- **Status**: ✅ Active
- **Owner**: Core Team

#### 🤖 AI Services
- **Service**: `AllergenDetectionService`
- **File**: `src/lib/ai/allergenDetection.ts`
- **Responsibilities**: AI-powered allergen tagging
- **Authentication**: OpenAI API Key
- **Storage**: External API only
- **Status**: ✅ Active
- **Owner**: Core Team

## 🔍 Service Conflict Prevention

### Before Creating New Services

1. **Check This Registry**: Ensure no existing service handles your domain
2. **Run Analysis**: `npm run check-service-conflicts`
3. **Architectural Review**: Required for new domain services
4. **Update Registry**: Add new service to this document

### Service Creation Rules

✅ **Allowed**:
- Extending existing primary services
- Creating utility services for cross-cutting concerns
- Creating integration services for external APIs

❌ **Forbidden**:
- Creating competing services for existing domains
- Bypassing primary services with direct data access
- Creating hybrid services mixing multiple domains

## 📊 Current Architecture Health

### Service Distribution
```
Restaurant Domain: 1 service ✅
Menu Domain: 1 service ✅
User Domain: 1 service ✅
File Upload: 1 service ✅
Location: 1 service ✅
AI: 1 service ✅

Total Conflicts: 0 ✅
```

### Authentication Patterns
```
Client-side: Firebase Auth ✅
Server-side: Firebase Admin SDK ✅
External APIs: API Keys ✅

Consistency: 100% ✅
```

## 🚨 Conflict Resolution History

### Resolved Conflicts

#### Restaurant Services Consolidation (2024-12)
**Problem**: 4 competing restaurant services
- `ClientRestaurantService` ✅ (kept)
- `AdminRestaurantService` ❌ (removed)
- `FirebaseRestaurantService` ❌ (removed)
- `useFirebaseRestaurants` ❌ (removed)

**Impact**: Resolved 401 errors, SSR crashes, data inconsistency

**Resolution**: Migrated all usage to `ClientRestaurantService`

## 📋 Service Health Checklist

### Monthly Review
- [ ] No service conflicts detected
- [ ] All services have clear ownership
- [ ] Authentication patterns are consistent
- [ ] No deprecated services in use
- [ ] Documentation is up to date

### Quarterly Audit
- [ ] Performance review of all services
- [ ] Security audit of authentication patterns
- [ ] Consolidation opportunities identified
- [ ] Service boundaries still appropriate

## 🔄 Migration Procedures

### When Consolidation is Needed

1. **Assessment Phase**
   - Identify all conflicting services
   - Determine primary service to keep
   - Map all usage points

2. **Planning Phase**
   - Create migration timeline
   - Identify breaking changes
   - Plan compatibility layers

3. **Execution Phase**
   - Implement compatibility layer
   - Migrate usage incrementally
   - Maintain comprehensive tests
   - Remove deprecated services

4. **Validation Phase**
   - Verify all functionality preserved
   - Check performance impact
   - Confirm no regressions

## 📞 Escalation Process

### When to Escalate
- Service conflicts detected
- Unclear service boundaries
- Performance issues with services
- Security concerns with authentication

### Escalation Path
1. **Developer** → Identifies issue
2. **Tech Lead** → Reviews and approves solution
3. **Architecture Review** → For complex changes
4. **Implementation** → With proper testing

## 🎯 Success Metrics

### Key Performance Indicators
- **Service Conflicts**: 0 (target)
- **Authentication Consistency**: 100% (target)
- **Service Response Time**: <200ms (target)
- **Error Rate**: <1% (target)

### Monitoring
```bash
# Daily automated check
npm run service-health-check

# Weekly manual review
npm run architecture-audit

# Monthly comprehensive analysis
npm run full-service-analysis
```

---

**Last Updated**: December 2024
**Next Review**: January 2025
**Owner**: Core Development Team
