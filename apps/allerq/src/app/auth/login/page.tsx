// Login page for AllerQ-Forge
"use client";

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <p>Authentication is currently being set up...</p>
        <p className="text-sm text-gray-600 mt-4">
          Please check back soon or contact support.
        </p>
        <div className="mt-6">
          <a 
            href="/en" 
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 inline-block text-center"
          >
            Back to Home
          </a>
        </div>
      </div>
    </main>
  );
}
