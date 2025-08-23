# Kitchen OS - Production Platform

> **Enterprise-grade digital menu platform with AI-powered optimization, QR code generation, and comprehensive analytics.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Neilfb/kitchen-os-production)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 **Quick Deploy**

1. **One-Click Deploy**: Click the deploy button above
2. **Manual Deploy**: See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)

## ✨ **Features**

- 🍽️ **Restaurant Management** - Multi-restaurant support with role-based access
- 🤖 **AI-Powered Optimization** - Performance-based menu recommendations
- 📱 **QR Code System** - Customizable QR generation with analytics
- 📊 **Advanced Analytics** - Real-time dashboard with business intelligence
- 🔍 **Smart Search** - Fuzzy search with allergen filtering
- 🔗 **Integration Platform** - Webhook system for third-party services
- 🌐 **SEO & PWA** - Search optimized with offline capabilities

## 🏗️ **Architecture**

```
kitchen-os-platform/
├── apps/
│   └── allerq/                 # Main Next.js application
├── packages/
│   ├── auth/                   # Firebase authentication
│   ├── database/               # Database services & models
│   ├── ui/                     # Shared UI components
│   └── utils/                  # Utilities & helpers
└── docs/                       # Documentation
```

## 🚀 **Quick Start**

```bash
# Clone and install
git clone https://github.com/Neilfb/kitchen-os-production.git
cd kitchen-os-production
npm install

# Setup environment
cp apps/allerq/.env.example apps/allerq/.env.local
# Add your Firebase config and API keys

# Start development
npm run dev

# Build for production
npm run build
```

## 📖 **Documentation**

- [**Deployment Guide**](./docs/DEPLOYMENT.md) - Complete setup instructions
- [**Platform Overview**](./docs/KITCHEN_OS_PLATFORM_OVERVIEW.md) - Architecture and features

## 📄 **License**

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built with ❤️ by the Kitchen OS team**
