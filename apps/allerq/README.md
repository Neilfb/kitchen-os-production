# AllerQ-Forge v1.0.0

Professional allergen management SaaS platform built with Next.js App Router, TypeScript, Firebase, and Tailwind CSS.

## Architecture

- **Frontend**: Next.js 15 with App Router
- **Backend**: Firebase Firestore & Authentication
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Important Notes

- This project uses Next.js 15, which has [breaking changes for dynamic route parameters](https://nextjs.org/blog/next-15#streamlined-route-handlers).
- See the [Migration Guide](./MIGRATION-GUIDE.md) for detailed instructions on handling route parameters in Next.js 15.
- **NoCodeBackend has been completely removed** - the app now runs entirely on Firebase.

## Deployment on Vercel

### Environment Variables

This application requires Firebase environment variables to be set in your Vercel project:

1. In your Vercel dashboard, go to your project settings
2. Navigate to the "Environment Variables" section
3. Add the following Firebase variables:
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Your Firebase project ID
   - `FIREBASE_CLIENT_EMAIL`: Firebase service account email
   - `FIREBASE_PRIVATE_KEY`: Firebase service account private key
   - `NEXTAUTH_URL`: Your deployed Vercel app URL
   - `NEXTAUTH_SECRET`: A secure random string for session encryption

Without these variables, the application will show Firebase connection errors.

## Getting Started

1. Install dependencies  
   \`\`\`bash
   npm install
   \`\`\`

2. Set your secrets (already in .gitignore)  
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`

3. Run dev server  
   \`\`\`bash
   npm run dev
   \`\`\`

Forge (VS Code extension) and GitHub Copilot are active in this workspace to provide on-demand “scaffold” prompts and AI-powered code completions as you work.
