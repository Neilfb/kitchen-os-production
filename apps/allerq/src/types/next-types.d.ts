// Type definitions to fix Next.js 15 issues with app router typing
import { ReactNode } from 'react';

// Augmenting the Next.js namespace to make params work with dynamic routes
declare module 'next' {
  export interface PageProps {
    params: Record<string, string> | Promise<Record<string, string>>;
    searchParams?: Record<string, string | string[]>;
  }
  
  export interface LayoutProps {
    children: ReactNode;
    params: Record<string, string> | Promise<Record<string, string>>;
  }
}
