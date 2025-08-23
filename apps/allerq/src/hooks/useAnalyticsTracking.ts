// src/hooks/useAnalyticsTracking.ts
// React hook for analytics tracking

import { useCallback } from 'react';
import { analyticsTracker } from '@/lib/analytics-tracker';

interface UseAnalyticsTrackingReturn {
  trackPageView: (restaurantId?: number, menuId?: number, metadata?: Record<string, any>) => Promise<void>;
  trackMenuItemClick: (restaurantId: number, menuId: number, itemId: string, metadata?: Record<string, any>) => Promise<void>;
  trackQRScan: (restaurantId: number, menuId: number, qrCodeId?: string, metadata?: Record<string, any>) => Promise<void>;
  trackAllergenFilter: (restaurantId: number, menuId: number, allergens: string[], metadata?: Record<string, any>) => Promise<void>;
  trackSearch: (restaurantId: number, menuId: number, searchTerm: string, metadata?: Record<string, any>) => Promise<void>;
  trackSessionStart: (restaurantId?: number, menuId?: number, metadata?: Record<string, any>) => Promise<void>;
  trackSessionEnd: (restaurantId?: number, menuId?: number, sessionDuration?: number, metadata?: Record<string, any>) => Promise<void>;
  trackCustomEvent: (eventType: string, restaurantId?: number, menuId?: number, metadata?: Record<string, any>) => Promise<void>;
}

export function useAnalyticsTracking(): UseAnalyticsTrackingReturn {
  const trackPageView = useCallback(async (
    restaurantId?: number, 
    menuId?: number, 
    metadata?: Record<string, any>
  ) => {
    await analyticsTracker.trackPageView(restaurantId, menuId, metadata);
  }, []);

  const trackMenuItemClick = useCallback(async (
    restaurantId: number, 
    menuId: number, 
    itemId: string, 
    metadata?: Record<string, any>
  ) => {
    await analyticsTracker.trackMenuItemClick(restaurantId, menuId, itemId, metadata);
  }, []);

  const trackQRScan = useCallback(async (
    restaurantId: number, 
    menuId: number, 
    qrCodeId?: string, 
    metadata?: Record<string, any>
  ) => {
    await analyticsTracker.trackQRScan(restaurantId, menuId, qrCodeId, metadata);
  }, []);

  const trackAllergenFilter = useCallback(async (
    restaurantId: number, 
    menuId: number, 
    allergens: string[], 
    metadata?: Record<string, any>
  ) => {
    await analyticsTracker.trackAllergenFilter(restaurantId, menuId, allergens, metadata);
  }, []);

  const trackSearch = useCallback(async (
    restaurantId: number, 
    menuId: number, 
    searchTerm: string, 
    metadata?: Record<string, any>
  ) => {
    await analyticsTracker.trackSearch(restaurantId, menuId, searchTerm, metadata);
  }, []);

  const trackSessionStart = useCallback(async (
    restaurantId?: number, 
    menuId?: number, 
    metadata?: Record<string, any>
  ) => {
    await analyticsTracker.trackSessionStart(restaurantId, menuId, metadata);
  }, []);

  const trackSessionEnd = useCallback(async (
    restaurantId?: number, 
    menuId?: number, 
    sessionDuration?: number, 
    metadata?: Record<string, any>
  ) => {
    await analyticsTracker.trackSessionEnd(restaurantId, menuId, sessionDuration, metadata);
  }, []);

  const trackCustomEvent = useCallback(async (
    eventType: string,
    restaurantId?: number, 
    menuId?: number, 
    metadata?: Record<string, any>
  ) => {
    await analyticsTracker.track({
      restaurant_id: restaurantId,
      menu_id: menuId,
      event_type: eventType,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
    });
  }, []);

  return {
    trackPageView,
    trackMenuItemClick,
    trackQRScan,
    trackAllergenFilter,
    trackSearch,
    trackSessionStart,
    trackSessionEnd,
    trackCustomEvent,
  };
}
