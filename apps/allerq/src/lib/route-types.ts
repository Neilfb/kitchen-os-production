// Types for Next.js App Router pages and layouts
import { Metadata, ResolvingMetadata } from 'next';
import { ReactNode } from 'react';

// Common type for searchParams
type SearchParams = { [key: string]: string | string[] | undefined };

// Base type for all route parameters
export interface BaseParams {
  [key: string]: string;
}

// Base interface for dynamic route parameters
export interface DynamicRouteParams<T extends BaseParams> {
  params: T;
  searchParams?: SearchParams;
}

// Next.js 15 requires async pages to have Promise-like params
// This type is used for server components marked as async
export interface AsyncParamsProps<T extends BaseParams> {
  params: T | Promise<T>;
  searchParams?: SearchParams;
}

// Analytics route params
export interface AnalyticsParams extends BaseParams {
  id: string;
}

// Restaurant route params
export interface RestaurantParams extends BaseParams {
  id: string;
}

// Menu route params
export interface MenuParams extends BaseParams {
  id: string;
}

// Subscription route params
export interface SubscriptionParams extends BaseParams {
  subscriptionId: string;
}

// Customer route params
export interface CustomerParams extends BaseParams {
  customerId: string;
}

// Public menu route params
export interface PublicMenuParams extends BaseParams {
  restaurantId: string;
}

// For backward compatibility
export type PublicRestaurantParams = PublicMenuParams;

// Settings route params alias (uses same params as restaurant)
export type SettingsParams = RestaurantParams;

// Generic Page Props interface for Next.js App Router Server Components
export interface PageProps<T extends BaseParams> {
  params: T;
  searchParams?: { [key: string]: string | string[] | undefined };
}

// Generic Page Props interface for Next.js App Router Client Components
export interface ClientPageProps<T extends BaseParams> {
  params: T;
  searchParams?: { [key: string]: string | string[] | undefined };
}

// Layout Props (non-async params for layouts)
export interface LayoutProps<T extends BaseParams> {
  children: ReactNode;
  params: T;
}

// Legacy types maintained for backward compatibility
export interface DynamicLayoutParams<T extends Record<string, string>> {
  children: ReactNode;
  params: T;
}

export interface DynamicRouteGenerateMetadata<T extends Record<string, string>> {
  params: T;
  searchParams: SearchParams;
  parent?: ResolvingMetadata;
}

export type GenerateMetadataFn<T extends Record<string, string>> = (
  props: DynamicRouteGenerateMetadata<T>
) => Promise<Metadata> | Metadata;