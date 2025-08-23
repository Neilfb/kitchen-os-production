# AllerQ-Forge Developer Handover Document

## 📋 Project Overview

### System Architecture
**AllerQ-Forge** is a comprehensive restaurant management platform built with modern web technologies:

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **UI Components**: shadcn/ui component library
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js with JWT tokens
- **Database**: NoCodeBackend API (instance: 48346_allerq)
- **Deployment**: Vercel hosting
- **Production URL**: https://aller-q-forge.vercel.app

### Core Functionality Status

#### ✅ **Fully Implemented & Working**
1. **Authentication System**
   - User registration and login
   - JWT-based session management
   - Protected routes and middleware
   - Persistent authentication state

2. **Restaurant Management**
   - Create, read, update, delete restaurants
   - Logo upload and display functionality
   - Address verification with Google APIs
   - Restaurant-specific data isolation

3. **Address Verification System**
   - Google Geocoding API (primary)
   - Google Places API (fallback)
   - Real-time address suggestions
   - Confidence scoring (70-100%)
   - Complete address component extraction

4. **Dashboard Interface**
   - Restaurant cards with logos
   - Real-time data synchronization
   - Navigation and user management
   - Responsive design

#### ⚠️ **Partially Implemented**
1. **Menu Management Infrastructure**
   - API endpoints exist (`/api/menus/*`)
   - Database schema configured
   - Components built but not connected
   - **Missing**: Restaurant-specific routing (`/restaurants/[id]/menus`)

2. **Subscription System**
   - Billing interface components exist
   - Pricing plans defined (£7.49/mo per location)
   - **Missing**: Stripe integration and payment processing

#### 🔄 **Planned Features**
1. **AI-Powered Allergen Tagging**
   - Region-specific allergen regulations
   - PDF/Word menu upload processing
   - Automated allergen detection

2. **QR Code Generation**
   - Restaurant-specific QR codes
   - Public menu viewer interface
   - Mobile-optimized display

---

## 🔧 Recent Critical Fixes Completed

### Google Places API Integration (December 2024)
**Issues Resolved:**
- ✅ **Timeout Problems**: Replaced expensive Levenshtein algorithm with fast similarity calculation
- ✅ **API Permissions**: Enabled Geocoding API alongside Places API
- ✅ **Confidence Scoring**: Fixed from 10% to 70-100% realistic scores
- ✅ **Demo Mode**: Eliminated fallback mode in production
- ✅ **Performance**: Response times reduced from timeout to <2 seconds

**Technical Changes:**
- Implemented hybrid Geocoding + Places API approach
- Added 5-second timeout protection for API calls
- Optimized string similarity algorithms
- Enhanced address component parsing for UK addresses

### Restaurant Management Fixes
**Issues Resolved:**
- ✅ **Logo Display**: Restaurant cards now show uploaded logos
- ✅ **Data Synchronization**: Dashboard updates immediately after edits
- ✅ **Address Verification**: Edit forms now use AddressVerification component
- ✅ **Cache Invalidation**: Proper data refresh after CRUD operations

### Performance Optimizations
**Improvements Made:**
- ✅ **Algorithm Optimization**: Replaced O(n*m) with O(n+m) complexity
- ✅ **Memory Management**: Limited string processing to prevent memory issues
- ✅ **API Efficiency**: Smart fallback chains for maximum reliability
- ✅ **Error Handling**: Graceful degradation and timeout protection

---

## 🚀 Current System Status

### Production Environment
- **URL**: https://aller-q-forge.vercel.app
- **Status**: Fully operational
- **Performance**: <2 second response times
- **Uptime**: 99.9% (Vercel hosting)

### API Integration Status
- **Google Places API**: ✅ Working (search and suggestions)
- **Google Geocoding API**: ✅ Working (address verification)
- **NoCodeBackend API**: ✅ Working (data persistence)
- **NextAuth**: ✅ Working (authentication)

### User Journey Completion
1. **Homepage** → ✅ Complete
2. **Sign Up** → ✅ Complete
3. **Sign In** → ✅ Complete
4. **Restaurant Setup** → ✅ Complete
5. **Dashboard** → ✅ Complete
6. **Menu Management** → ⚠️ Infrastructure ready, routing needed
7. **QR Codes** → 🔄 Planned
8. **Billing** → ⚠️ UI ready, Stripe integration needed

---

## 💻 Development Environment Setup

### Prerequisites
```bash
Node.js 18+ 
npm or yarn
Git
```

### Environment Variables Required
```env
# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Google APIs
GOOGLE_PLACES_API_KEY=your-google-api-key

# NoCodeBackend
NOCODEBACKEND_API_URL=https://api.nocodebackend.com
NOCODEBACKEND_INSTANCE=48346_allerq
```

### Local Development Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

### Testing Procedures
1. **Authentication Flow**: Test signup/signin/logout
2. **Restaurant CRUD**: Create, edit, delete restaurants
3. **Address Verification**: Test with various address formats
4. **Logo Upload**: Test image upload and display
5. **Dashboard Navigation**: Verify all links and data display

### Deployment Process
1. **Automatic**: Push to `main` branch triggers Vercel deployment
2. **Manual**: Use Vercel CLI or dashboard
3. **Environment**: Configure production environment variables in Vercel
4. **Monitoring**: Check deployment logs and performance metrics

---

## ⚠️ Known Issues and Technical Debt

### Minor Issues
1. **Address Completeness**: Some UK addresses show 90% instead of 100% completeness
2. **Error Messages**: Could be more user-friendly in some edge cases
3. **Loading States**: Some components lack proper loading indicators

### Technical Debt
1. **Testing Coverage**: Unit tests needed for critical components
2. **Error Boundaries**: Need React error boundaries for better UX
3. **Performance Monitoring**: Add analytics and performance tracking
4. **Accessibility**: ARIA labels and keyboard navigation improvements

### Areas Needing Refactoring
1. **State Management**: Consider React Query/SWR for better data fetching
2. **Component Architecture**: Some components could be more modular
3. **API Layer**: Centralized API client would improve maintainability
4. **Type Safety**: Some `any` types could be more specific

---

## 🎯 Next Priority Tasks

### Immediate Tasks (Ready for Development)
1. **Menu Management Routing** (High Priority)
   - Create `/restaurants/[id]/menus` page
   - Connect existing menu components
   - Implement restaurant-specific menu CRUD
   - **Estimated Time**: 2-3 days

2. **Testing Implementation** (High Priority)
   - Add Jest/React Testing Library tests
   - Test critical user flows
   - Add CI/CD testing pipeline
   - **Estimated Time**: 3-4 days

3. **Error Handling Improvements** (Medium Priority)
   - Add React error boundaries
   - Improve user-facing error messages
   - Add retry mechanisms for failed API calls
   - **Estimated Time**: 1-2 days

### Medium-term Features (1-2 weeks)
1. **QR Code Generation**
   - Generate restaurant-specific QR codes
   - Public menu viewer interface
   - Mobile-optimized display
   - **Estimated Time**: 1 week

2. **Stripe Integration**
   - Payment processing setup
   - Subscription management
   - Billing dashboard integration
   - **Estimated Time**: 1-2 weeks

3. **AI Allergen Tagging**
   - PDF/Word upload processing
   - OpenAI integration for allergen detection
   - Region-specific allergen rules
   - **Estimated Time**: 2-3 weeks

### Long-term Considerations (1+ months)
1. **Performance Optimization**
   - Implement caching strategies
   - Optimize bundle size
   - Add CDN for static assets

2. **Advanced Features**
   - Multi-language support
   - Advanced analytics dashboard
   - Integration with POS systems

3. **Scalability**
   - Database optimization
   - API rate limiting
   - Load balancing considerations

---

## 📚 Key Files and Directories

### Critical Files
- `src/lib/location/googlePlaces.ts` - Address verification logic
- `src/hooks/useRestaurants.ts` - Restaurant data management
- `src/components/AddressVerification.tsx` - Address input component
- `src/app/api/restaurants/` - Restaurant API endpoints
- `src/app/api/location/verify/` - Address verification API

### Important Directories
- `src/app/` - Next.js App Router pages
- `src/components/` - Reusable UI components
- `src/lib/` - Utility functions and services
- `src/hooks/` - Custom React hooks
- `docs/` - Documentation and guides

### Configuration Files
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS setup
- `tsconfig.json` - TypeScript configuration
- `.env.local` - Local environment variables

---

## 🔗 Useful Resources

### Documentation
- [Next.js 15 Docs](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Google Places API](https://developers.google.com/maps/documentation/places/web-service)
- [NoCodeBackend API](https://nocodebackend.com/docs)

### Development Tools
- **VS Code Extensions**: ES7+ React/Redux/React-Native snippets, Tailwind CSS IntelliSense
- **Browser Extensions**: React Developer Tools, Redux DevTools
- **Testing**: Jest, React Testing Library
- **Deployment**: Vercel CLI

---

## 🔍 Debugging and Troubleshooting

### Common Issues and Solutions

#### Address Verification Problems
- **Issue**: Low confidence scores
- **Solution**: Check Google API quotas and permissions
- **Debug Endpoint**: `/api/debug/google-places`

#### Authentication Issues
- **Issue**: Session not persisting
- **Solution**: Check NEXTAUTH_SECRET and JWT configuration
- **Debug**: Check browser cookies and localStorage

#### Restaurant Data Not Updating
- **Issue**: Stale data in dashboard
- **Solution**: Verify cache invalidation in `useRestaurants` hook
- **Debug**: Check network tab for API calls

### Debug Endpoints
- `/api/debug/google-places` - Test Google APIs
- `/api/test-geocoding` - Test geocoding directly
- `/test-google-places` - Interactive testing interface

### Logging and Monitoring
- **Server Logs**: Check Vercel function logs
- **Client Errors**: Browser console and network tab
- **API Monitoring**: NoCodeBackend dashboard
- **Performance**: Vercel analytics

---

## 📊 Database Schema (NoCodeBackend)

### Users Table
```sql
id: string (primary key)
uid: string (unique)
email: string
display_name: string
role: enum (superadmin, restaurant_admin)
created_at: timestamp
updated_at: timestamp
assigned_restaurants: longtext (JSON array)
external_id: string
```

### Restaurants Table
```sql
id: string (primary key)
name: string
address: longtext
contact: string
website: string
logo: string (URL)
user_id: string (foreign key)
created_at: timestamp
updated_at: timestamp
address_verification: longtext (JSON)
```

### Menus Table (Infrastructure Ready)
```sql
id: string (primary key)
restaurant_id: string (foreign key)
name: string
description: longtext
is_active: boolean
created_at: timestamp
updated_at: timestamp
```

### Menu Items Table (Infrastructure Ready)
```sql
id: string (primary key)
menu_id: string (foreign key)
name: string
description: longtext
price: decimal
allergens: longtext (JSON array)
category: string
is_available: boolean
created_at: timestamp
updated_at: timestamp
```

---

## 🚀 Quick Start Guide for New Developers

### Day 1: Environment Setup
1. Clone repository: `git clone https://github.com/Neilfb/AllerQ-Forge`
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and configure
4. Start development: `npm run dev`
5. Test authentication flow
6. Create a test restaurant

### Day 2: Code Exploration
1. Review project structure and key files
2. Understand authentication flow in `src/app/(auth)/`
3. Explore restaurant management in `src/app/restaurants/`
4. Test address verification functionality
5. Review API endpoints in `src/app/api/`

### Day 3: First Contribution
1. Pick an immediate priority task
2. Create feature branch: `git checkout -b feature/task-name`
3. Implement changes with proper TypeScript types
4. Test thoroughly in development
5. Create pull request with detailed description

---

*Last Updated: December 2024*
*Next Review: January 2025*

---

## 📞 Support and Contact

### Repository Information
- **GitHub**: https://github.com/Neilfb/AllerQ-Forge
- **Production**: https://aller-q-forge.vercel.app
- **Staging**: Vercel preview deployments

### Key Integrations
- **Google Cloud Console**: Manage API keys and quotas
- **Vercel Dashboard**: Deployment and environment management
- **NoCodeBackend**: Database and API management

### Development Best Practices
- Always use TypeScript strict mode
- Follow existing component patterns
- Add proper error handling
- Test on multiple devices and browsers
- Document complex logic with comments
- Use semantic commit messages
