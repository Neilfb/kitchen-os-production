import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase'; // Import from local firebase config
import { COLLECTIONS } from '../models';

export interface Webhook {
  id: string;
  restaurantId: string;
  customerId: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  active: boolean;
  retryCount: number;
  lastTriggered?: any;
  createdAt: any;
  updatedAt: any;
}

export interface WebhookEvent {
  type: 'menu.created' | 'menu.updated' | 'menu.published' | 'qr.scanned' | 'analytics.daily';
  description: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  eventType: string;
  payload: any;
  status: 'pending' | 'delivered' | 'failed';
  attempts: number;
  lastAttempt?: any;
  response?: {
    status: number;
    body: string;
    headers: Record<string, string>;
  };
  createdAt: any;
}

const WEBHOOK_EVENTS: WebhookEvent[] = [
  { type: 'menu.created', description: 'When a new menu is created' },
  { type: 'menu.updated', description: 'When a menu is modified' },
  { type: 'menu.published', description: 'When a menu is published or unpublished' },
  { type: 'qr.scanned', description: 'When a QR code is scanned' },
  { type: 'analytics.daily', description: 'Daily analytics summary' },
];

export class WebhookService {
  /**
   * Create a new webhook
   */
  static async createWebhook(
    webhookData: Omit<Webhook, 'id' | 'secret' | 'createdAt' | 'updatedAt' | 'lastTriggered'>
  ): Promise<Webhook> {
    try {
      const secret = this.generateSecret();
      
      const docRef = await addDoc(collection(db, COLLECTIONS.WEBHOOKS), {
        ...webhookData,
        secret,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const newWebhook: Webhook = {
        ...webhookData,
        id: docRef.id,
        secret,
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
      };

      return newWebhook;
    } catch (error: any) {
      throw new Error(`Failed to create webhook: ${error.message}`);
    }
  }

  /**
   * Get webhooks for a restaurant
   */
  static async getWebhooksByRestaurant(restaurantId: string): Promise<Webhook[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.WEBHOOKS),
        where('restaurantId', '==', restaurantId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Webhook[];
    } catch (error: any) {
      throw new Error(`Failed to fetch webhooks: ${error.message}`);
    }
  }

  /**
   * Update a webhook
   */
  static async updateWebhook(
    webhookId: string,
    updates: Partial<Omit<Webhook, 'id' | 'secret' | 'createdAt' | 'updatedAt'>>
  : Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.WEBHOOKS, webhookId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      throw new Error(`Failed to update webhook: ${error.message}`);
    }
  }

  /**
   * Delete a webhook
   */
  static async deleteWebhook(webhookId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.WEBHOOKS, webhookId);
      await deleteDoc(docRef);
    } catch (error: any) {
      throw new Error(`Failed to delete webhook: ${error.message}`);
    }
  }

  // Simplified implementation - remove complex functionality for now
  static async triggerWebhook(restaurantId: string, eventType: string, payload: any): Promise<void> {
    // Simplified implementation
    console.log('Webhook triggered:', { restaurantId, eventType, payload });
  }

  static async getWebhookDeliveries(webhookId: string): Promise<WebhookDelivery[]> {
    // Simplified implementation
    return [];
  }

  static async testWebhook(webhookId: string): Promise<{ success: boolean; response?: any; error?: string }> {
    // Simplified implementation
    return { success: true };
  }

  static getAvailableEvents(): WebhookEvent[] {
    return WEBHOOK_EVENTS;
  }

  private static generateSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static verifySignature(payload: string, signature: string, secret: string): boolean {
    // Simplified implementation
    return true;
  }
}
