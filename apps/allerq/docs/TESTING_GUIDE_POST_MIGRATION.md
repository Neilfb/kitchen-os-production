# Testing Guide - Post NoCodeBackend Migration

## 🧪 Testing Strategy

**Last Updated**: December 27, 2024  
**Architecture**: Firebase-based testing approach  
**Status**: Ready for comprehensive testing

## 🎯 Testing Priorities

### **Critical User Flows** (Priority 1)
These flows must work perfectly as they represent core user journeys:

1. **Authentication Flow**
2. **Restaurant Management**
3. **Menu Management**
4. **Subscription Setup**

### **API Endpoints** (Priority 2)
Verify all migrated endpoints work with Firebase authentication.

### **Service Integration** (Priority 3)
Ensure services work together without conflicts.

## 🔐 Authentication Flow Testing

### **Manual Testing Steps**

#### **Sign Up Flow**
1. Navigate to `/auth/signup`
2. Fill form: Name, Email, Password, Confirm Password
3. Check terms and conditions
4. Click "Create Account"
5. **Expected**: Redirect to welcome page with user authenticated

#### **Sign In Flow**
1. Navigate to `/auth/login`
2. Enter email and password
3. Click "Sign In"
4. **Expected**: Redirect to dashboard with user authenticated

#### **Sign Out Flow**
1. From any authenticated page
2. Click user menu → "Sign Out"
3. **Expected**: Redirect to homepage, user logged out

### **Automated Testing**
```typescript
// Example test structure
describe('Authentication Flow', () => {
  test('should sign up new user', async () => {
    // Test Firebase Auth signup
  });
  
  test('should sign in existing user', async () => {
    // Test Firebase Auth signin
  });
  
  test('should sign out user', async () => {
    // Test Firebase Auth signout
  });
});
```

## 🏢 Restaurant Management Testing

### **Manual Testing Steps**

#### **Create Restaurant**
1. Sign in to application
2. Navigate to `/restaurants/new`
3. Fill restaurant form:
   - Name: "Test Restaurant"
   - Address: Valid street address
   - Website: Optional URL
   - Logo: Upload image file
4. Click "Create Restaurant"
5. **Expected**: Restaurant created, redirect to dashboard

#### **Edit Restaurant**
1. From dashboard, click "Edit Restaurant"
2. Modify restaurant details
3. Click "Save Changes"
4. **Expected**: Changes saved, updated in dashboard

#### **Logo Upload**
1. In restaurant edit form
2. Click logo upload area
3. Select image file
4. **Expected**: Logo uploaded and displayed

### **API Testing**
```bash
# Test restaurant creation
curl -X POST http://localhost:3000/api/restaurants \
  -H "Authorization: Bearer <firebase-token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Restaurant","address":"123 Test St"}'

# Expected: 200 OK with restaurant data
```

## 🍽️ Menu Management Testing

### **Manual Testing Steps**

#### **Create Menu**
1. From restaurant dashboard
2. Click "Manage Menus"
3. Click "Create New Menu"
4. Fill menu details:
   - Name: "Test Menu"
   - Description: Optional
5. Click "Create Menu"
6. **Expected**: Menu created, redirect to menu items

#### **Add Menu Items**
1. In menu management page
2. Click "Add Item"
3. Fill item details:
   - Name: "Test Dish"
   - Description: "Test description"
   - Price: "12.99"
   - Category: "Mains"
   - Allergens: Select applicable
4. Click "Save Item"
5. **Expected**: Item added to menu

#### **Edit Menu Items**
1. Click edit button on existing item
2. Modify item details
3. Click "Save Changes"
4. **Expected**: Item updated in menu

### **Public Menu Testing**
1. Navigate to `/r/[restaurantId]/menu/[menuId]`
2. **Expected**: Public menu displays without authentication
3. Test allergen filtering
4. Test search functionality

## 💳 Subscription Setup Testing

### **Manual Testing Steps**

#### **Access Subscription Setup**
1. Complete restaurant creation
2. Navigate to subscription setup
3. **Expected**: Subscription options displayed

#### **Select Plan**
1. Choose subscription plan
2. Click "Continue"
3. **Expected**: Payment setup or confirmation

## 🔌 API Endpoint Testing

### **Health Check**
```bash
curl http://localhost:3000/api/health
# Expected: Firebase connectivity status
```

### **Authentication Endpoints**
```bash
# Sign up
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","displayName":"Test User"}'

# Sign in
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### **Protected Endpoints**
```bash
# Get restaurants (requires auth)
curl http://localhost:3000/api/restaurants \
  -H "Authorization: Bearer <firebase-token>"

# Create restaurant (requires auth)
curl -X POST http://localhost:3000/api/restaurants \
  -H "Authorization: Bearer <firebase-token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"API Test Restaurant","address":"123 API St"}'
```

## 🧩 Service Integration Testing

### **Authentication + Restaurant Creation**
1. Sign up new user
2. Immediately create restaurant
3. **Expected**: Restaurant associated with correct user

### **Restaurant + Menu Integration**
1. Create restaurant
2. Create menu for restaurant
3. Add items to menu
4. **Expected**: Menu properly linked to restaurant

### **Cross-Service Data Consistency**
1. Create restaurant via API
2. View restaurant in dashboard
3. **Expected**: Data consistent across services

## 🚨 Error Scenario Testing

### **Authentication Errors**
- Invalid credentials
- Expired tokens
- Missing authentication

### **Data Validation Errors**
- Invalid restaurant data
- Missing required fields
- Invalid file uploads

### **Network Errors**
- Firebase connectivity issues
- API timeout scenarios
- Offline behavior

## 📊 Performance Testing

### **Load Testing**
- Multiple concurrent users
- Large menu creation
- Bulk operations

### **Response Time Testing**
- API endpoint response times
- Page load performance
- Database query optimization

## 🔧 Testing Tools & Setup

### **Development Testing**
```bash
# Start development server
npm run dev

# Run in separate terminal for API testing
# Use browser for manual testing
```

### **Automated Testing Setup**
```bash
# Install testing dependencies (if not already installed)
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Run tests
npm test
```

### **Firebase Testing Setup**
```typescript
// Mock Firebase for testing
jest.mock('firebase/auth');
jest.mock('firebase/firestore');
```

## ✅ Testing Checklist

### **Pre-Production Checklist**
- [ ] All authentication flows work
- [ ] Restaurant CRUD operations functional
- [ ] Menu management complete workflow
- [ ] Public menu access works
- [ ] API endpoints respond correctly
- [ ] Error handling works properly
- [ ] Performance is acceptable
- [ ] Mobile responsiveness verified

### **Post-Deployment Checklist**
- [ ] Production Firebase connection works
- [ ] Environment variables configured
- [ ] SSL certificates valid
- [ ] CDN/static assets loading
- [ ] Analytics tracking functional

## 🐛 Known Issues to Test

### **Stubbed Endpoints**
These endpoints return stub responses - verify they don't break user flows:
- Customer management APIs
- Menu category operations
- Super admin analytics
- File upload functionality

### **Environment Dependencies**
- Firebase credentials in production
- Google Places API key
- OpenAI API key (for AI features)

---

**Testing Framework Ready** ✅  
**Comprehensive testing approach for Firebase-based architecture**
