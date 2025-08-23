# AllerQ-Forge Technical Implementation Guide

## 🏗️ Architecture Deep Dive

### Application Structure
```
src/
├── app/                    # Next.js 15 App Router
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   ├── restaurants/       # Restaurant management
│   └── dashboard/         # Main dashboard
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and services
└── types/                 # TypeScript type definitions
```

### Key Design Patterns

#### 1. API Route Handlers (Next.js 15)
```typescript
// src/app/api/restaurants/route.ts
export async function GET(req: NextRequest) {
  // Handle GET requests
}

export async function POST(req: NextRequest) {
  // Handle POST requests
}
```

#### 2. Custom Hooks for Data Management
```typescript
// src/hooks/useRestaurants.ts
export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  
  const fetchRestaurants = useCallback(async () => {
    // Fetch logic with error handling
  }, []);
  
  return { restaurants, fetchRestaurants, createRestaurant, updateRestaurant };
}
```

#### 3. Service Layer Pattern
```typescript
// src/lib/location/googlePlaces.ts
class GooglePlacesService {
  private apiKey: string;
  
  async verifyAddress(address: string): Promise<LocationVerification> {
    // Hybrid API approach: Geocoding → Places → Manual fallback
  }
}
```

---

## 🔧 Critical Implementation Details

### Authentication Flow
**Technology**: NextAuth.js with JWT strategy

**Key Files**:
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth configuration
- `src/middleware.ts` - Route protection
- `src/lib/auth.ts` - Authentication utilities

**Implementation**:
```typescript
// JWT-based authentication with persistent sessions
const authOptions: NextAuthOptions = {
  providers: [CredentialsProvider],
  session: { strategy: "jwt" },
  callbacks: {
    jwt: async ({ token, user }) => {
      // Custom JWT handling
    }
  }
};
```

### Address Verification System
**Technology**: Google Geocoding API + Places API hybrid

**Key Files**:
- `src/lib/location/googlePlaces.ts` - Core verification logic
- `src/components/AddressVerification.tsx` - UI component
- `src/app/api/location/verify/route.ts` - API endpoint

**Implementation Strategy**:
1. **Primary**: Google Geocoding API (most accurate for addresses)
2. **Fallback**: Google Places API (good for businesses)
3. **Final**: Manual parsing with confidence scoring

**Performance Optimizations**:
- 5-second timeout protection
- Fast similarity algorithm (O(n+m) complexity)
- String length limits (100 chars max)
- Optimized address completeness calculation

### Restaurant Data Management
**Technology**: NoCodeBackend API with local state management

**Key Files**:
- `src/hooks/useRestaurants.ts` - Data management hook
- `src/app/api/restaurants/` - CRUD API endpoints
- `src/components/RestaurantCard.tsx` - Display component

**Data Flow**:
```
User Action → API Route → NoCodeBackend → Local State → UI Update
```

**Cache Invalidation**:
- Automatic refresh after CRUD operations
- Manual refresh capability
- Optimistic updates for better UX

---

## 🎨 UI/UX Implementation

### Component Architecture
**Technology**: shadcn/ui + Tailwind CSS

**Design System**:
- Consistent color palette
- Responsive breakpoints
- Accessible components
- Dark/light mode support

**Key Components**:
- `AddressVerification` - Real-time address validation
- `RestaurantCard` - Restaurant display with actions
- `FileUpload` - Logo upload with preview
- `LoadingSpinner` - Consistent loading states

### Form Handling
**Pattern**: Controlled components with validation

```typescript
const [formData, setFormData] = useState({
  name: "",
  address: "",
  contact: "",
  website: ""
});

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  // Validation and submission logic
};
```

### Error Handling
**Strategy**: Graceful degradation with user feedback

```typescript
try {
  const result = await apiCall();
  // Success handling
} catch (error) {
  console.error('Operation failed:', error);
  setError('User-friendly error message');
}
```

---

## 🔌 API Integration Patterns

### NoCodeBackend Integration
**Base URL**: `https://api.nocodebackend.com`
**Instance**: `48346_allerq`

**Authentication**:
```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

**CRUD Patterns**:
- CREATE: `POST /create/{table}`
- READ: `GET /read/{table}`
- UPDATE: `PUT /update/{table}/{id}`
- DELETE: `DELETE /delete/{table}/{id}`

### Google APIs Integration
**Required APIs**:
- Google Places API (enabled ✅)
- Google Geocoding API (enabled ✅)

**Rate Limiting**:
- Places API: $17 per 1000 requests
- Geocoding API: $5 per 1000 requests
- Recommended: Cache results for 24 hours

**Error Handling**:
```typescript
if (data.status === 'REQUEST_DENIED') {
  // Handle permission issues
} else if (data.status === 'OVER_QUERY_LIMIT') {
  // Handle rate limiting
}
```

---

## 🧪 Testing Strategy

### Testing Stack
- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: API route testing
- **E2E Tests**: Playwright (planned)

### Test Coverage Goals
- **Critical Paths**: 90%+ coverage
- **API Routes**: 100% coverage
- **Components**: 80%+ coverage
- **Utilities**: 95%+ coverage

### Testing Patterns
```typescript
// Component testing
describe('RestaurantCard', () => {
  it('displays restaurant information correctly', () => {
    render(<RestaurantCard restaurant={mockRestaurant} />);
    expect(screen.getByText(mockRestaurant.name)).toBeInTheDocument();
  });
});

// API testing
describe('/api/restaurants', () => {
  it('creates restaurant successfully', async () => {
    const response = await POST(mockRequest);
    expect(response.status).toBe(201);
  });
});
```

---

## 🚀 Deployment and DevOps

### Vercel Configuration
**Build Settings**:
- Framework: Next.js
- Node.js Version: 18.x
- Build Command: `npm run build`
- Output Directory: `.next`

**Environment Variables**:
```env
# Production
NEXTAUTH_URL=https://aller-q-forge.vercel.app
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
GOOGLE_PLACES_API_KEY=${GOOGLE_PLACES_API_KEY}
```

### CI/CD Pipeline
**Automatic Deployment**:
1. Push to `main` branch
2. Vercel builds and deploys
3. Preview deployments for PRs
4. Automatic rollback on failure

**Manual Deployment**:
```bash
# Using Vercel CLI
vercel --prod

# Or through Vercel dashboard
```

### Performance Monitoring
**Metrics to Track**:
- Core Web Vitals (LCP, FID, CLS)
- API response times
- Error rates
- User engagement

**Tools**:
- Vercel Analytics
- Google PageSpeed Insights
- Browser DevTools

---

## 🔒 Security Considerations

### Authentication Security
- JWT tokens with expiration
- Secure HTTP-only cookies
- CSRF protection
- Rate limiting on auth endpoints

### API Security
- Input validation and sanitization
- SQL injection prevention (NoCodeBackend handles)
- XSS protection
- CORS configuration

### Data Protection
- Environment variable security
- API key rotation
- User data isolation
- GDPR compliance considerations

---

## 📈 Performance Optimization

### Current Optimizations
- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image component
- **API Caching**: Strategic caching for static data
- **Bundle Analysis**: Regular bundle size monitoring

### Future Optimizations
- **CDN Integration**: Static asset delivery
- **Database Indexing**: Query optimization
- **Caching Strategy**: Redis for session storage
- **Lazy Loading**: Component-level lazy loading

---

## 🔄 Development Workflow

### Git Workflow
```bash
# Feature development
git checkout -b feature/menu-management
git commit -m "feat: add menu CRUD operations"
git push origin feature/menu-management
# Create PR for review
```

### Code Review Checklist
- [ ] TypeScript types are properly defined
- [ ] Error handling is implemented
- [ ] Tests are written and passing
- [ ] Performance impact is considered
- [ ] Security implications are reviewed
- [ ] Documentation is updated

### Release Process
1. **Development**: Feature branches
2. **Testing**: Staging environment (Vercel previews)
3. **Review**: Code review and approval
4. **Deployment**: Merge to main → automatic deployment
5. **Monitoring**: Post-deployment health checks

---

*This guide provides the technical foundation for continuing AllerQ-Forge development. Refer to the main handover document for project overview and priorities.*
