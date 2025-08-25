// Login page for AllerQ-Forge
"use client";

import dynamic from 'next/dynamic';

// Dynamically import LoginForm to prevent server-side rendering
const LoginForm = dynamic(() => import("@/components/LoginForm"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b border-blue-600"></div>
    </div>
  )
});

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <LoginForm />
    </main>
  );
}
