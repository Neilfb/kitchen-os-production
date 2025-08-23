# 🔧 AllerQ-Forge Technical Implementation Guide
*Last Updated: December 27, 2024*

## 🏗️ ARCHITECTURE DEEP DIVE

### **Authentication Flow**
```typescript
// Firebase Auth Context Pattern
const { user, loading } = useFirebaseAuth();

// Token Retrieval for API Calls
const token = await user.getIdToken();

// API Authentication Header
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### **Data Flow Architecture**
```
User Action → Component → Firebase Auth → API Route → Firebase Admin → Firestore
                ↓
         UI Update ← Response ← JSON ← Service Layer ← Database
```

### **Service Layer Pattern**
```typescript
// Restaurant Service Example
class AdminRestaurantService {
  private get collection() {
    return getAdminDb().collection(COLLECTIONS.RESTAURANTS);
  }
  
  async createRestaurant(userId: string, data: CreateRestaurantInput) {
    // Implementation with proper error handling
  }
}
```

## 📁 FILE STRUCTURE & RESPONSIBILITIES

### **Core Application Structure**
```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   └── restaurants/          # Restaurant API endpoints
│   ├── restaurants/              # Restaurant management pages
│   ├── signin/                   # Authentication pages
│   └── layout.tsx               # Root layout with providers
├── components/                   # Reusable UI components
│   ├── ui/                      # shadcn/ui base components
│   ├── restaurant/              # Restaurant-specific components
│   └── menu/                    # Menu management components
├── contexts/                     # React contexts
│   └── FirebaseAuthContext.tsx  # Authentication provider
├── lib/                         # Utility libraries
│   ├── services/                # Data service layer
│   ├── firebase/                # Firebase configuration
│   └── types/                   # TypeScript definitions
└── docs/                        # Documentation
```

### **Key Component Hierarchy**
```
RootLayout (FirebaseAuthProvider)
├── RestaurantsLayout
│   ├── RestaurantList
│   ├── RestaurantCreation
│   └── MenuManagement
│       ├── MenuList
│       ├── MenuCreation
│       └── MenuItemManagement
│           ├── MenuItemsList
│           ├── MenuItemCreation
│           └── MenuItemEditor
```

## 🔐 AUTHENTICATION IMPLEMENTATION

### **Firebase Auth Setup**
```typescript
// src/contexts/FirebaseAuthContext.tsx
export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <FirebaseAuthContext.Provider value={{ user, loading }}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}
```

### **API Authentication Pattern**
```typescript
// API Route Authentication
async function verifyFirebaseToken(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.substring(7);
    const decodedToken = await getAuth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error('[Auth] Token verification failed:', error);
    return null;
  }
}
```

### **Client-Side Auth Usage**
```typescript
// Component Authentication Pattern
const { user, loading: authLoading } = useFirebaseAuth();

// Redirect if not authenticated
useEffect(() => {
  if (!authLoading && !user) {
    router.push("/signin");
  }
}, [user, authLoading, router]);

// API calls with authentication
const token = await user.getIdToken();
const response = await fetch('/api/endpoint', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## 🗄️ DATABASE SCHEMA & OPERATIONS

### **Firestore Collections Structure**
```typescript
// Collections
COLLECTIONS = {
  RESTAURANTS: 'restaurants',
  MENUS: 'menus',
  MENU_ITEMS: 'menuItems',
  USERS: 'users',
  ANALYTICS: 'analytics'
}

// Restaurant Document
interface Restaurant {
  id: string;
  name: string;
  address: string;
  website?: string;
  logoUrl?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

// Menu Document
interface Menu {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  status: 'draft' | 'published';
  region: 'EU' | 'US' | 'CA' | 'ASIA';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Menu Item Document
interface MenuItem {
  id: string;
  menuId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  allergens: string[];
  dietaryPreferences: string[];
  available: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### **Service Layer Implementation**
```typescript
// Firebase Menu Service Pattern
class FirebaseMenuService {
  private get menusCollection() {
    return getAdminDb().collection(COLLECTIONS.MENUS);
  }

  async createMenu(userId: string, input: CreateMenuInput): Promise<EnhancedMenu> {
    const now = new Date().toISOString();
    const menuData = {
      ...input,
      createdBy: userId,
      updatedBy: userId,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await this.menusCollection.add(menuData);
    // Return enhanced menu object
  }
}
```

## 🎨 UI COMPONENT PATTERNS

### **Form Component Pattern**
```typescript
// Menu Item Creation Form
export default function CreateMenuItemPage() {
  const { user, loading: authLoading } = useFirebaseAuth();
  const [formData, setFormData] = useState<MenuItemFormData>({
    name: "",
    description: "",
    price: "",
    allergens: [],
    dietaryPreferences: [],
    available: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const token = await user.getIdToken();
    const response = await fetch(`/api/restaurants/${restaurantId}/menus/${menuId}/items`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
  };
}
```

### **Data Loading Pattern**
```typescript
// Menu Items List Component
export default function MenuItemsClientWrapper({ restaurantId, menuId }) {
  const { user, loading: authLoading } = useFirebaseAuth();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      fetchMenuItems();
    } else if (!authLoading && !user) {
      setError('Please sign in to view menu items');
      setLoading(false);
    }
  }, [user, authLoading, menuId]);

  const fetchMenuItems = async () => {
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/restaurants/${restaurantId}/menus/${menuId}/items`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      // Handle response
    } catch (error) {
      setError('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };
}
```

## 🔧 API ENDPOINT PATTERNS

### **Standard API Route Structure**
```typescript
// GET /api/restaurants/[restaurantId]/menus/[menuId]/items
export async function GET(
  req: NextRequest,
  { params }: { params: { restaurantId: string; menuId: string } }
) {
  try {
    // 1. Verify Firebase authentication
    const userId = await verifyFirebaseToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // 2. Verify resource ownership (currently disabled for debugging)
    // const restaurant = await adminRestaurantService.getRestaurant(params.restaurantId, userId);

    // 3. Fetch and return data
    const menu = await firebaseMenuService.getMenu(params.menuId, userId);
    return NextResponse.json({
      success: true,
      items: menu.items || [],
    });

  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

### **Error Handling Pattern**
```typescript
// Consistent error handling across API routes
try {
  // API logic
} catch (error) {
  console.error(`[${endpoint}] Error:`, error);
  return NextResponse.json(
    { error: "Failed to process request" },
    { status: 500 }
  );
}
```

## 🚀 DEPLOYMENT & ENVIRONMENT

### **Vercel Configuration**
```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

### **Environment Variable Management**
```bash
# Development (.env.local)
NEXT_PUBLIC_FIREBASE_API_KEY=development_key
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Production (Vercel Dashboard)
# All environment variables configured in Vercel project settings
# Automatic deployment on git push to main branch
```

### **Build Process**
```bash
# Local build testing
npm run build
npm run start

# Production deployment
git push origin main
# Vercel automatically builds and deploys
```

## 🐛 DEBUGGING STRATEGIES

### **Authentication Issues**
```typescript
// Debug authentication state
console.log('[Auth] User:', user);
console.log('[Auth] Loading:', authLoading);
console.log('[Auth] Token:', await user?.getIdToken());
```

### **API Issues**
```typescript
// Debug API calls
console.log('[API] Request URL:', url);
console.log('[API] Request headers:', headers);
console.log('[API] Response status:', response.status);
console.log('[API] Response data:', await response.json());
```

### **Firebase Issues**
```typescript
// Debug Firebase operations
console.log('[Firebase] Collection:', collection.path);
console.log('[Firebase] Query:', query);
console.log('[Firebase] Results:', snapshot.docs.length);
```

## 📋 TESTING CHECKLIST

### **Authentication Testing**
- [ ] User registration works
- [ ] User login works
- [ ] Token persistence across page reloads
- [ ] Logout clears authentication state
- [ ] Protected routes redirect unauthenticated users

### **Restaurant Management Testing**
- [ ] Restaurant creation with logo upload
- [ ] Restaurant listing and editing
- [ ] Address validation with Google APIs
- [ ] Restaurant deletion

### **Menu Management Testing**
- [ ] Menu creation workflow
- [ ] Menu listing and editing
- [ ] Menu item CRUD operations
- [ ] Allergen and dietary preference handling

### **API Testing**
- [ ] All endpoints return proper status codes
- [ ] Authentication is enforced
- [ ] Data validation works
- [ ] Error handling is consistent

---

*This technical implementation guide provides detailed patterns and examples for continuing development of the AllerQ-Forge project.*
