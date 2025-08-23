# AllerQ-Forge Architectural Principles

## 🛡️ Core Principles

### 1. **Single Service Per Data Domain (SSPD)**
**Rule**: Each data domain (restaurants, menus, users, etc.) must have exactly ONE primary service responsible for all CRUD operations.

**Rationale**: Prevents the "4 competing restaurant services" issue that caused authentication conflicts and data inconsistency.

**Implementation**:
- ✅ **DO**: Use `clientRestaurantService` for all restaurant operations
- ❌ **DON'T**: Create `adminRestaurantService`, `firebaseRestaurantService`, `useFirebaseRestaurants` simultaneously

### 2. **Service Ownership Documentation**
**Rule**: Every service must have clear ownership documentation and responsibility boundaries.

**Required Documentation**:
```typescript
/**
 * PRIMARY SERVICE for Restaurant domain
 * 
 * Responsibilities:
 * - All restaurant CRUD operations
 * - Restaurant data validation
 * - Restaurant-related business logic
 * 
 * Authentication: Firebase Client SDK
 * Storage: Firestore direct access
 * 
 * @owner Core Team
 * @domain restaurant
 * @primary true
 */
export class ClientRestaurantService {
  // Implementation
}
```

### 3. **Mandatory Architectural Review**
**Rule**: Any new data access pattern requires architectural review before implementation.

**Review Triggers**:
- Creating new service classes
- Adding new data access hooks
- Implementing new API endpoints for existing domains
- Changing authentication patterns

### 4. **Service Consolidation Protocol**
**Rule**: When conflicts are detected, immediate consolidation is required.

**Process**:
1. **Identify**: Run service conflict analysis
2. **Assess**: Determine primary service to keep
3. **Migrate**: Move all usage to primary service
4. **Remove**: Delete conflicting services
5. **Test**: Verify no functionality is lost

## 🔍 Detection & Prevention

### Automated Checks
```bash
# Run before every commit
npm run check-service-conflicts

# Run in CI/CD pipeline
npm run lint:architecture
```

### ESLint Integration
```javascript
// .eslintrc.js
{
  "rules": {
    "./eslint-rules/no-service-conflicts": ["error", {
      "maxServicesPerDomain": 1
    }]
  }
}
```

## 📋 Development Workflow

### Before Adding New Features

1. **Check Existing Services**
   ```bash
   npm run analyze-services
   ```

2. **Review Service Map**
   - Check `docs/SERVICE_OWNERSHIP.md`
   - Verify no conflicts exist

3. **Architectural Decision**
   - Extend existing service? ✅
   - Create new service? ⚠️ Requires review
   - Create competing service? ❌ Forbidden

### Service Creation Checklist

- [ ] No existing service handles this domain
- [ ] Clear responsibility boundaries defined
- [ ] Documentation includes ownership and scope
- [ ] Authentication pattern is consistent
- [ ] Integration tests cover all operations
- [ ] Service registered in ownership documentation

## 🚨 Conflict Resolution

### When Conflicts Are Detected

**Immediate Actions**:
1. Stop development on conflicting features
2. Run full service analysis
3. Create consolidation plan
4. Execute migration with tests
5. Remove deprecated services

**Example Resolution**:
```typescript
// BEFORE: Multiple restaurant services
import { useFirebaseRestaurants } from '@/hooks/useFirebaseRestaurants'; // ❌
import { adminRestaurantService } from '@/lib/services/adminRestaurantService'; // ❌
import { clientRestaurantService } from '@/lib/services/clientRestaurantService'; // ✅

// AFTER: Single restaurant service
import { clientRestaurantService } from '@/lib/services/clientRestaurantService'; // ✅
```

## 📚 Service Categories

### Allowed Service Types

1. **Primary Domain Services**
   - One per data domain
   - Handles all CRUD operations
   - Example: `clientRestaurantService`

2. **Utility Services**
   - Cross-cutting concerns
   - No domain-specific data
   - Example: `fileUploadService`, `emailService`

3. **Integration Services**
   - External API wrappers
   - No local data storage
   - Example: `googlePlacesService`, `stripeService`

### Forbidden Patterns

❌ **Multiple Primary Services**: Never create competing services for same domain
❌ **Hybrid Services**: Don't mix multiple data sources in one service
❌ **Implicit Services**: All data access must go through documented services

## 🎯 Success Metrics

### Architecture Health Indicators

- **Service Conflicts**: 0 (monitored by CI)
- **Authentication Patterns**: 1 per application layer
- **Data Access Points**: 1 per domain
- **API Consistency**: 100% (all endpoints use same auth)

### Monitoring

```bash
# Weekly architecture review
npm run architecture-health-check

# Generates report:
# - Service conflicts: 0 ✅
# - Authentication consistency: 100% ✅
# - Data access patterns: Unified ✅
```

## 🔄 Migration Guidelines

### Consolidating Existing Services

1. **Identify Primary Service**
   - Most feature-complete
   - Best authentication integration
   - Cleanest architecture

2. **Migration Strategy**
   - Create compatibility layer
   - Migrate usage incrementally
   - Maintain tests throughout
   - Remove deprecated services

3. **Validation**
   - All functionality preserved
   - Performance maintained
   - No authentication regressions

## 📖 Learning from Past Issues

### Case Study: Restaurant Services Conflict

**Problem**: 4 competing restaurant services caused:
- 401 authentication errors
- Server-side rendering crashes
- Data inconsistency
- Development confusion

**Root Cause**: No architectural oversight for service creation

**Solution**: 
- Consolidated to single `clientRestaurantService`
- Implemented detection tools
- Established review process

**Prevention**: These architectural principles and automated checks

---

**Remember**: Architecture is about preventing problems, not just solving them. These principles exist to avoid the pain of debugging production conflicts caused by architectural fragmentation.
