// Types for Next.js App Router pages and layouts
import { Metadata, ResolvingMetadata } from 'next';
import { ReactNode } from 'react';

// Common type for searchParams
type SearchParams = { [key: string]: string | string[] | undefined };

// Base interface for dynamic route parameters
export interface DynamicRouteParams<T extends Record<string, string>> {
  params: T;
  searchParams: SearchParams;
}

// Layout params
export interface DynamicLayoutParams<T extends Record<string, string>> {
  children: ReactNode;
  params: T;
}

// Metadata generation types
export interface DynamicRouteGenerateMetadata<T extends Record<string, string>> {
  params: T;
  searchParams: SearchParams;
  parent?: ResolvingMetadata;
}

export type GenerateMetadataFn<T extends Record<string, string>> = (
  props: DynamicRouteGenerateMetadata<T>
) => Promise<Metadata> | Metadata;

// Route parameter types for different pages
export interface PageParams {
  [key: string]: string;
  id: string;
}

export interface RestaurantParams {
  [key: string]: string;
  id: string;
}

export interface MenuParams {
  [key: string]: string;
  id: string;
}

export interface PublicRestaurantParams {
  [key: string]: string;
  restaurantId: string;
}

export interface SubscriptionParams {
  [key: string]: string;
  subscriptionId: string;
}
