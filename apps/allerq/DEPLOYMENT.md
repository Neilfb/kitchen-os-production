# AllerQ-Forge Deployment Guide

## Testing Environment Deployment (Completed)
Testing deployment was completed on Sun May 25 20:17:30 BST 2025.

### Key Components Tested:
- Menu Items API endpoints:
  - GET /api/menus/[id]/items
  - POST /api/menus/[id]/items
  - POST /api/menus/[id]/items/reorder
  - POST /api/menus/[id]/items/bulk
- Menu Item Reordering Component

### Testing Results:
Please see the deployment log for detailed test results: `deployment-log.txt`

## Production Deployment Instructions

### 1. Pre-Deployment Checklist
- [ ] All API tests pass in the test environment
- [ ] Menu items can be added successfully
- [ ] Menu items can be reordered
- [ ] Bulk actions for menu items work correctly

### 2. Creating Production Build
```bash
# Install dependencies
npm ci

# Create production build
npm run build
```

### 3. Deployment Steps
```bash
# Deploy to production server - adjust as needed for your environment
# For Vercel deployment:
vercel --prod

# For custom server:
npm run start
```

### 4. Environment Variables
Ensure these environment variables are set in your production environment:

- NODE_ENV=production
- NOCODEBACKEND_SECRET_KEY=<your-actual-key>
- NOCODEBACKEND_BASE_URL=https://api.nocodebackend.com/api
- DEMO_MODE=false

### 5. Post-Deployment Verification
- [ ] Verify API endpoints are working in production
- [ ] Test menu item creation in production
- [ ] Test menu item reordering in production
- [ ] Monitor error logs for 24 hours

## Rollback Plan
If issues are encountered after deployment:
1. Revert to previous version using your deployment platform's rollback feature
2. For Vercel: `vercel rollback`
3. For custom server: Redeploy the previous build

## Support
For any deployment issues, please contact the development team.
