/**
 * Safely resolves route parameters that may be a Promise or a direct object
 * This provides backwards compatibility with Next.js <15 while also supporting Next.js 15+
 * 
 * @deprecated In Next.js 15, use `const { id } = await params;` pattern in async components
 * or `const { id } = use(params);` in client components instead
 */
export async function resolveParams<T>(params: Promise<T> | T): Promise<T> {
  if (params instanceof Promise) {
    return await params;
  }
  return params;
}

/**
 * Use this in pages that need to work with synchronous operations but which 
 * receive async params in Next.js 15. Note that this will throw an error if 
 * params are actually async, so only use it when you're sure the params are
 * synchronously available or for backwards compatibility.
 * 
 * @deprecated This should only be used for backwards compatibility
 */
export function getSyncParams<T>(params: Promise<T> | T): T {
  if (params instanceof Promise) {
    throw new Error(
      "Params are a Promise. Use resolveParams instead for async handling."
    );
  }
  return params;
}

/**
 * Use this in client components that need to work with synchronous operations
 * but receive async params in Next.js 15.
 * 
 * Example usage in a client component:
 * ```tsx
 * 'use client';
 * import { use } from 'react';
 * 
 * export default function MyClientComponent({ params }: { params: Promise<{ id: string }> }) {
 *   const { id } = use(params);
 *   // rest of component...
 * }
 * ```
 */
export function useRouteParams<T>(_params: Promise<T>): T {
  // This is just a helper function to document the pattern
  // In actual code, use React's `use` hook directly
  throw new Error("useRouteParams() is not implemented - use the 'use' hook from React instead");
}
