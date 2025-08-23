// src/lib/analytics-tracker.ts
// Analytics tracking service - DEPRECATED: Should be replaced with Firebase Analytics

interface AnalyticsEvent {
  restaurant_id?: number;
  menu_id?: number;
  event_type: string;
  timestamp?: number;
  user_agent?: string;
  ip_addresss?: string; // Note: API has typo "ip_addresss" 
  referrer?: string;
  metadata?: string;
  created_at?: number;
}

interface AnalyticsResponse {
  status: string;
  message: string;
  id: number;
}

class AnalyticsTracker {
  private baseUrl: string;
  private instanceId: string;
  private isDemo: boolean;

  constructor() {
    // DEPRECATED: This service should be replaced with Firebase Analytics
    this.baseUrl = 'https://deprecated-service.com';
    this.instanceId = 'deprecated';
    this.isDemo = true; // Always in demo mode since NoCodeBackend is removed
  }

  /**
   * Track an analytics event
   */
  async track(event: Omit<AnalyticsEvent, 'timestamp' | 'created_at' | 'user_agent'>): Promise<void> {
    // Skip tracking in demo mode
    if (this.isDemo) {
      console.log('[Demo Mode] Analytics event would be tracked:', event);
      return;
    }

    try {
      const payload: AnalyticsEvent = {
        ...event,
        timestamp: Date.now(),
        created_at: Date.now(),
        user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        referrer: typeof window !== 'undefined' ? document.referrer : undefined,
      };

      // Send to our API endpoint which will forward to NoCodeBackend
      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to track analytics: ${response.status}`);
      }

      console.log('Analytics event tracked successfully:', event.event_type);
    } catch (error) {
      console.error('Failed to track analytics event:', error);
      // Don't throw error to avoid breaking user experience
    }
  }

  /**
   * Track page view
   */
  async trackPageView(restaurantId?: number, menuId?: number, metadata?: Record<string, any>): Promise<void> {
    await this.track({
      restaurant_id: restaurantId,
      menu_id: menuId,
      event_type: 'page_view',
      metadata: metadata ? JSON.stringify(metadata) : undefined,
    });
  }

  /**
   * Track menu item click
   */
  async trackMenuItemClick(restaurantId: number, menuId: number, itemId: string, metadata?: Record<string, any>): Promise<void> {
    await this.track({
      restaurant_id: restaurantId,
      menu_id: menuId,
      event_type: 'menu_item_click',
      metadata: JSON.stringify({ itemId, ...metadata }),
    });
  }

  /**
   * Track QR code scan
   */
  async trackQRScan(restaurantId: number, menuId: number, qrCodeId?: string, metadata?: Record<string, any>): Promise<void> {
    await this.track({
      restaurant_id: restaurantId,
      menu_id: menuId,
      event_type: 'qr_scan',
      metadata: JSON.stringify({ qrCodeId, ...metadata }),
    });
  }

  /**
   * Track allergen filter usage
   */
  async trackAllergenFilter(restaurantId: number, menuId: number, allergens: string[], metadata?: Record<string, any>): Promise<void> {
    await this.track({
      restaurant_id: restaurantId,
      menu_id: menuId,
      event_type: 'allergen_filter',
      metadata: JSON.stringify({ allergens, ...metadata }),
    });
  }

  /**
   * Track search usage
   */
  async trackSearch(restaurantId: number, menuId: number, searchTerm: string, metadata?: Record<string, any>): Promise<void> {
    await this.track({
      restaurant_id: restaurantId,
      menu_id: menuId,
      event_type: 'search',
      metadata: JSON.stringify({ searchTerm, ...metadata }),
    });
  }

  /**
   * Track user session start
   */
  async trackSessionStart(restaurantId?: number, menuId?: number, metadata?: Record<string, any>): Promise<void> {
    await this.track({
      restaurant_id: restaurantId,
      menu_id: menuId,
      event_type: 'session_start',
      metadata: metadata ? JSON.stringify(metadata) : undefined,
    });
  }

  /**
   * Track user session end
   */
  async trackSessionEnd(restaurantId?: number, menuId?: number, sessionDuration?: number, metadata?: Record<string, any>): Promise<void> {
    await this.track({
      restaurant_id: restaurantId,
      menu_id: menuId,
      event_type: 'session_end',
      metadata: JSON.stringify({ sessionDuration, ...metadata }),
    });
  }
}

// Export singleton instance
export const analyticsTracker = new AnalyticsTracker();

// Export types for use in other files
export type { AnalyticsEvent, AnalyticsResponse };
