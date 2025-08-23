// Utility functions for handling Next.js App Router params

/**
 * Ensures that params are available synchronously
 * This is required for Next.js 15 async components
 */
export function ensureParams<T>(
  paramOrPromise: T | Promise<T>
): T {
  // If the param is already synchronously available, return it
  if (!(paramOrPromise instanceof Promise)) {
    return paramOrPromise;
  }
  
  // We should never actually reach this in practice because Next.js
  // provides the params synchronously, but TypeScript doesn't know this
  throw new Error("Params are not available synchronously");
}
