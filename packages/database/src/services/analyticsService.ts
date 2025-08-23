import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@kitchen-os/auth';
import { AnalyticsEvent, COLLECTIONS } from '../models';

export interface DashboardMetrics {
  totalScans: number;
  totalViews: number;
  totalClicks: number;
  uniqueVisitors: number;
  topMenuItems: Array<{ itemId: string; clicks: number; name?: string }>;
  scansByDay: Array<{ date: string; scans: number; views: number }>;
  deviceBreakdown: Array<{ device: string; count: number }>;
  locationBreakdown: Array<{ country: string; count: number }>;
  peakHours: Array<{ hour: number; count: number }>;
}

export interface QRCodeMetrics {
  qrId: string;
  scans: number;
  uniqueScans: number;
  conversionRate: number;
  lastScan?: Date;
}

export class AnalyticsService {
  /**
   * Record a menu view event
   */
  static async recordMenuView(
    restaurantId: string,
    menuId: string,
    metadata: {
      userAgent?: string;
      referrer?: string;
      location?: {
        country?: string;
        region?: string;
        city?: string;
      };
      sessionId?: string;
    }
  ): Promise<void> {
    try {
      await addDoc(collection(db, COLLECTIONS.ANALYTICS), {
        restaurantId,
        menuId,
        eventType: 'view',
        timestamp: serverTimestamp(),
        metadata,
      });
    } catch (error: any) {
      throw new Error(`Failed to record menu view: ${error.message}`);
    }
  }

  /**
   * Record a menu item click event
   */
  static async recordItemClick(
    restaurantId: string,
    menuId: string,
    itemId: string,
    metadata: {
      userAgent?: string;
      referrer?: string;
      sessionId?: string;
    }
  ): Promise<void> {
    try {
      await addDoc(collection(db, COLLECTIONS.ANALYTICS), {
        restaurantId,
        menuId,
        itemId,
        eventType: 'click',
        timestamp: serverTimestamp(),
        metadata,
      });
    } catch (error: any) {
      throw new Error(`Failed to record item click: ${error.message}`);
    }
  }

  /**
   * Get analytics for a restaurant
   */
  static async getRestaurantAnalytics(
    restaurantId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<AnalyticsEvent[]> {
    try {
      let q = query(
        collection(db, COLLECTIONS.ANALYTICS),
        where('restaurantId', '==', restaurantId),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      let events = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as AnalyticsEvent[];

      // Filter by date range if provided
      if (startDate || endDate) {
        events = events.filter(event => {
          const eventDate = event.timestamp instanceof Timestamp
            ? event.timestamp.toDate()
            : new Date(event.timestamp);
          
          if (startDate && eventDate < startDate) return false;
          if (endDate && eventDate > endDate) return false;
          return true;
        });
      }

      return events;
    } catch (error: any) {
      throw new Error(`Failed to fetch analytics: ${error.message}`);
    }
  }

  /**
   * Get comprehensive dashboard metrics
   */
  static async getDashboardMetrics(
    restaurantId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<DashboardMetrics> {
    try {
      const events = await this.getRestaurantAnalytics(restaurantId, startDate, endDate);
      
      // Calculate totals
      const totalScans = events.filter(e => e.eventType === 'scan').length;
      const totalViews = events.filter(e => e.eventType === 'view').length;
      const totalClicks = events.filter(e => e.eventType === 'click').length;
      
      // Calculate unique visitors (by sessionId)
      const uniqueSessions = new Set(
        events.map(e => e.metadata.sessionId).filter(Boolean)
      );
      const uniqueVisitors = uniqueSessions.size;

      // Top menu items by clicks
      const itemClicks = new Map<string, number>();
      events
        .filter(e => e.eventType === 'click' && e.itemId)
        .forEach(event => {
          const count = itemClicks.get(event.itemId!) || 0;
          itemClicks.set(event.itemId!, count + 1);
        });
      
      const topMenuItems = Array.from(itemClicks.entries())
        .map(([itemId, clicks]) => ({ itemId, clicks }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 10);

      // Scans and views by day
      const dayData = new Map<string, { scans: number; views: number }>();
      events.forEach(event => {
        const date = event.timestamp instanceof Timestamp
          ? event.timestamp.toDate()
          : new Date(event.timestamp);
        const dateStr = date.toISOString().split('T')[0];
        
        const current = dayData.get(dateStr) || { scans: 0, views: 0 };
        if (event.eventType === 'scan') current.scans++;
        if (event.eventType === 'view') current.views++;
        dayData.set(dateStr, current);
      });

      const scansByDay = Array.from(dayData.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Device breakdown
      const deviceCounts = new Map<string, number>();
      events.forEach(event => {
        if (event.metadata.userAgent) {
          const device = this.getDeviceType(event.metadata.userAgent);
          deviceCounts.set(device, (deviceCounts.get(device) || 0) + 1);
        }
      });

      const deviceBreakdown = Array.from(deviceCounts.entries())
        .map(([device, count]) => ({ device, count }))
        .sort((a, b) => b.count - a.count);

      // Location breakdown
      const locationCounts = new Map<string, number>();
      events.forEach(event => {
        if (event.metadata.location?.country) {
          const country = event.metadata.location.country;
          locationCounts.set(country, (locationCounts.get(country) || 0) + 1);
        }
      });

      const locationBreakdown = Array.from(locationCounts.entries())
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Peak hours
      const hourCounts = new Array(24).fill(0);
      events.forEach(event => {
        const date = event.timestamp instanceof Timestamp
          ? event.timestamp.toDate()
          : new Date(event.timestamp);
        const hour = date.getHours();
        hourCounts[hour]++;
      });

      const peakHours = hourCounts.map((count, hour) => ({ hour, count }));

      return {
        totalScans,
        totalViews,
        totalClicks,
        uniqueVisitors,
        topMenuItems,
        scansByDay,
        deviceBreakdown,
        locationBreakdown,
        peakHours,
      };
    } catch (error: any) {
      throw new Error(`Failed to get dashboard metrics: ${error.message}`);
    }
  }

  /**
   * Get QR code performance metrics
   */
  static async getQRCodeMetrics(
    restaurantId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<QRCodeMetrics[]> {
    try {
      const events = await this.getRestaurantAnalytics(restaurantId, startDate, endDate);
      const qrEvents = events.filter(e => e.qrId);
      
      const qrMetrics = new Map<string, {
        scans: number;
        uniqueScans: Set<string>;
        views: number;
        lastScan?: Date;
      }>();

      qrEvents.forEach(event => {
        const qrId = event.qrId!;
        const current = qrMetrics.get(qrId) || {
          scans: 0,
          uniqueScans: new Set(),
          views: 0,
        };

        if (event.eventType === 'scan') {
          current.scans++;
          if (event.metadata.sessionId) {
            current.uniqueScans.add(event.metadata.sessionId);
          }
          const eventDate = event.timestamp instanceof Timestamp
            ? event.timestamp.toDate()
            : new Date(event.timestamp);
          if (!current.lastScan || eventDate > current.lastScan) {
            current.lastScan = eventDate;
          }
        } else if (event.eventType === 'view') {
          current.views++;
        }

        qrMetrics.set(qrId, current);
      });

      return Array.from(qrMetrics.entries()).map(([qrId, data]) => ({
        qrId,
        scans: data.scans,
        uniqueScans: data.uniqueScans.size,
        conversionRate: data.scans > 0 ? (data.views / data.scans) * 100 : 0,
        lastScan: data.lastScan,
      }));
    } catch (error: any) {
      throw new Error(`Failed to get QR code metrics: ${error.message}`);
    }
  }

  /**
   * Helper function to determine device type from user agent
   */
  private static getDeviceType(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'Mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'Tablet';
    } else {
      return 'Desktop';
    }
  }
}
