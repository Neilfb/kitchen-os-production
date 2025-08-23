# Deployment Guide

This guide covers deploying Kitchen OS - AllerQ Platform to production.

## 🚀 **Quick Deploy (Recommended)**

### **Option 1: One-Click Vercel Deploy**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Neilfb/kitchen-os-web)

1. Click the deploy button above
2. Connect your GitHub account
3. Fork the repository
4. Configure environment variables (see below)
5. Deploy!

### **Option 2: Manual Vercel Deploy**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Follow the prompts to configure your project
```

## 🔧 **Environment Configuration**

### **Required Environment Variables**

Copy `apps/allerq/.env.example` to `apps/allerq/.env.local` and configure:

```bash
# Firebase Configuration (Required)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Application URL (Required)
NEXT_PUBLIC_APP_URL=https://your-domain.com

# OpenAI API Key (Required for AI features)
OPENAI_API_KEY=sk-your_openai_key

# Google Cloud Vision API (Required for OCR)
GOOGLE_CLOUD_VISION_API_KEY=your_google_vision_key
```

### **Optional Environment Variables**

```bash
# Analytics
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Webhook Security
WEBHOOK_SECRET=your_webhook_secret
```

## 🔥 **Firebase Setup**

### **1. Create Firebase Project**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable the following services:
   - **Authentication** (Email/Password, Google)
   - **Firestore Database** (Production mode)
   - **Storage** (for image uploads)
   - **Functions** (for backend logic)

### **2. Configure Authentication**

```bash
# In Firebase Console > Authentication > Sign-in method
# Enable:
- Email/Password
- Google (optional)
```

### **3. Setup Firestore Security Rules**

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Restaurant owners can access their restaurants
    match /restaurants/{restaurantId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.owners;
    }
    
    // Public menu access
    match /menus/{menuId} {
      allow read: if resource.data.published == true;
      allow write: if request.auth != null && 
        request.auth.uid in get(/databases/$(database)/documents/restaurants/$(resource.data.restaurantId)).data.owners;
    }
    
    // Analytics (write-only for public, read for owners)
    match /analytics/{analyticsId} {
      allow create: if true; // Allow public analytics creation
      allow read: if request.auth != null;
    }
  }
}
```

### **4. Deploy Firebase Functions**

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Select:
# - Functions
# - Firestore
# - Storage

# Deploy functions
cd functions
npm install
npm run deploy
```

## 🌐 **Custom Domain Setup**

### **Vercel Custom Domain**

1. In Vercel Dashboard > Project > Settings > Domains
2. Add your custom domain
3. Configure DNS records as shown
4. Update `NEXT_PUBLIC_APP_URL` environment variable

### **Firebase Custom Domain (Optional)**

For Firebase Hosting (if using):

```bash
# Add custom domain in Firebase Console > Hosting
firebase hosting:channel:deploy production --only hosting
```

## 📊 **Database Initialization**

### **Create Initial Collections**

Run this script to initialize your Firestore database:

```javascript
// Initialize collections with proper indexes
const collections = [
  'restaurants',
  'menus', 
  'menu_items',
  'qr_codes',
  'analytics',
  'webhooks',
  'webhook_deliveries'
];

// Create composite indexes in Firebase Console > Firestore > Indexes
// Required indexes:
// - restaurants: customerId, createdAt
// - menus: restaurantId, published, createdAt
// - analytics: restaurantId, timestamp
// - qr_codes: restaurantId, createdAt
```

## 🔒 **Security Configuration**

### **API Keys Security**

1. **Restrict Firebase API Key**:
   - Go to Google Cloud Console > APIs & Services > Credentials
   - Edit your API key
   - Add HTTP referrers restrictions

2. **OpenAI API Key**:
   - Keep server-side only (not in NEXT_PUBLIC_ variables)
   - Set usage limits in OpenAI dashboard

3. **Environment Variables**:
   - Never commit `.env.local` files
   - Use Vercel environment variables for production

### **CORS Configuration**

```javascript
// In Firebase Functions
const cors = require('cors')({
  origin: [
    'https://your-domain.com',
    'https://your-domain.vercel.app'
  ]
});
```

## 📈 **Performance Optimization**

### **Vercel Configuration**

Create `vercel.json`:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "apps/allerq/src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options", 
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### **Next.js Configuration**

Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['firebasestorage.googleapis.com'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: true,
  },
}

module.exports = nextConfig
```

## 🧪 **Testing Deployment**

### **Pre-deployment Checklist**

- [ ] All environment variables configured
- [ ] Firebase services enabled and configured
- [ ] Security rules deployed
- [ ] Functions deployed and working
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Performance tests passing

### **Post-deployment Testing**

```bash
# Test key functionality
curl https://your-domain.com/api/health
curl https://your-domain.com/menu/demo

# Test authentication
# Test QR code generation
# Test analytics tracking
# Test webhook delivery
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Build Failures**:
   ```bash
   # Clear cache and rebuild
   rm -rf .next node_modules
   npm install
   npm run build
   ```

2. **Environment Variable Issues**:
   - Ensure all required variables are set
   - Check for typos in variable names
   - Verify Firebase config is correct

3. **Firebase Connection Issues**:
   - Check Firebase project ID
   - Verify API keys are correct
   - Ensure Firestore is in production mode

4. **Function Deployment Issues**:
   ```bash
   # Redeploy functions
   cd functions
   firebase deploy --only functions
   ```

## 📞 **Support**

If you encounter issues during deployment:

1. Check the [troubleshooting section](#troubleshooting)
2. Review Vercel deployment logs
3. Check Firebase Console for errors
4. Open an issue on GitHub

---

**Your Kitchen OS platform is now ready for production! 🎉**
