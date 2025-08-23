// Route parameter utilities for Next.js 15 compatibility
import { use } from 'react';

/**
 * Safely resolves route parameters for async server components.
 * 
 * @example
 * // In a server component:
 * export default async function PageComponent({ params }: { params: Promise<{ id: string }> }) {
 *   const { id } = await params;
 *   // Use the resolved parameter
 * }
 */
export async function resolveParams<T>(params: Promise<T> | T): Promise<T> {
  // Handle both Promise and direct object for backward compatibility
  return params instanceof Promise ? await params : params;
}

/**
 * Use this in client components to unwrap Promise-based route parameters.
 * 
 * @example
 * // In a client component:
 * 'use client';
 * import { useParams } from "@/lib/route-utils";
 * 
 * export default function ClientComponent({ params }: { params: Promise<{ id: string }> }) {
 *   const { id } = useParams(params);
 *   // Use the parameter synchronously
 * }
 */
export function useParams<T>(params: Promise<T>): T {
  return use(params);
}

/**
 * Type-safe wrapper for Next.js 15 dynamic route parameters in async server components
 * 
 * @example
 * type Params = ServerRouteParams<{ id: string }>;
 * 
 * export default async function Page({ params }: { params: Params }) {
 *   const { id } = await params;
 *   // ...
 * }
 */
export type ServerRouteParams<T extends Record<string, string>> = Promise<T>;

/**
 * Type-safe wrapper for Next.js 15 dynamic route parameters in client components
 * 
 * @example
 * type Params = ClientRouteParams<{ id: string }>;
 * 
 * export default function ClientComponent({ params }: { params: Params }) {
 *   const { id } = useParams(params);
 *   // ...
 * }
 */
export type ClientRouteParams<T extends Record<string, string>> = Promise<T>;
