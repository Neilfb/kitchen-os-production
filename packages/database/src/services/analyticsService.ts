import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

import { db } from '../firebase';
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
  static async recordMenuView(
    restaurantId: string,
    menuId: string,
    metadata: any
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

  static async recordItemClick(
    restaurantId: string,
    menuId: string,
    itemId: string,
    metadata: any
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

  static async getRestaurantAnalytics(
    restaurantId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<AnalyticsEvent[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.ANALYTICS),
        where('restaurantId', '==', restaurantId),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const events = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as AnalyticsEvent[];

      return events;
    } catch (error: any) {
      throw new Error(`Failed to fetch analytics: ${error.message}`);
    }
  }

  static async getDashboardMetrics(
    restaurantId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<DashboardMetrics> {
    try {
      const events = await this.getRestaurantAnalytics(restaurantId, startDate, endDate);

      return {
        totalScans: 0,
        totalViews: events.length,
        totalClicks: 0,
        uniqueVisitors: 0,
        topMenuItems: [],
        scansByDay: [],
        deviceBreakdown: [],
        locationBreakdown: [],
        peakHours: [],
      };
    } catch (error: any) {
      throw new Error(`Failed to get dashboard metrics: ${error.message}`);
    }
  }

  static async getQRCodeMetrics(
    restaurantId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<QRCodeMetrics[]> {
    return [];
  }
}
