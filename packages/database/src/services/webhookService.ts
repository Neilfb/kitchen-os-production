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
import { db } from '@kitchen-os/auth';
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
  ): Promise<void> {
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

  /**
   * Trigger a webhook
   */
  static async triggerWebhook(
    restaurantId: string,
    eventType: string,
    payload: any
  ): Promise<void> {
    try {
      // Get active webhooks for this restaurant that listen to this event
      const webhooks = await this.getWebhooksByRestaurant(restaurantId);
      const relevantWebhooks = webhooks.filter(
        webhook => webhook.active && webhook.events.some(event => event.type === eventType)
      );

      // Create delivery records and send webhooks
      const deliveryPromises = relevantWebhooks.map(webhook =>
        this.deliverWebhook(webhook, eventType, payload)
      );

      await Promise.allSettled(deliveryPromises);
    } catch (error: any) {
      console.error('Failed to trigger webhooks:', error);
    }
  }

  /**
   * Deliver a webhook
   */
  private static async deliverWebhook(
    webhook: Webhook,
    eventType: string,
    payload: any
  ): Promise<void> {
    try {
      // Create delivery record
      const delivery = await addDoc(collection(db, COLLECTIONS.WEBHOOK_DELIVERIES), {
        webhookId: webhook.id,
        eventType,
        payload,
        status: 'pending',
        attempts: 0,
        createdAt: serverTimestamp(),
      });

      // Attempt delivery
      await this.attemptDelivery(delivery.id, webhook, eventType, payload);
    } catch (error: any) {
      console.error('Failed to deliver webhook:', error);
    }
  }

  /**
   * Attempt webhook delivery
   */
  private static async attemptDelivery(
    deliveryId: string,
    webhook: Webhook,
    eventType: string,
    payload: any
  ): Promise<void> {
    try {
      const webhookPayload = {
        event: eventType,
        timestamp: new Date().toISOString(),
        data: payload,
      };

      const signature = this.generateSignature(JSON.stringify(webhookPayload), webhook.secret);

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Kitchen-OS-Signature': signature,
          'X-Kitchen-OS-Event': eventType,
          'User-Agent': 'Kitchen-OS-Webhooks/1.0',
        },
        body: JSON.stringify(webhookPayload),
      });

      const responseBody = await response.text();

      // Update delivery record
      await updateDoc(doc(db, COLLECTIONS.WEBHOOK_DELIVERIES, deliveryId), {
        status: response.ok ? 'delivered' : 'failed',
        attempts: 1,
        lastAttempt: serverTimestamp(),
        response: {
          status: response.status,
          body: responseBody,
          headers: Object.fromEntries(response.headers.entries()),
        },
      });

      // Update webhook last triggered time
      if (response.ok) {
        await updateDoc(doc(db, COLLECTIONS.WEBHOOKS, webhook.id), {
          lastTriggered: serverTimestamp(),
        });
      }
    } catch (error: any) {
      // Update delivery record with error
      await updateDoc(doc(db, COLLECTIONS.WEBHOOK_DELIVERIES, deliveryId), {
        status: 'failed',
        attempts: 1,
        lastAttempt: serverTimestamp(),
        response: {
          status: 0,
          body: error.message,
          headers: {},
        },
      });
    }
  }

  /**
   * Get webhook deliveries
   */
  static async getWebhookDeliveries(webhookId: string): Promise<WebhookDelivery[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.WEBHOOK_DELIVERIES),
        where('webhookId', '==', webhookId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as WebhookDelivery[];
    } catch (error: any) {
      throw new Error(`Failed to fetch webhook deliveries: ${error.message}`);
    }
  }

  /**
   * Test a webhook
   */
  static async testWebhook(webhookId: string): Promise<{ success: boolean; response?: any; error?: string }> {
    try {
      const webhookDoc = await getDoc(doc(db, COLLECTIONS.WEBHOOKS, webhookId));
      if (!webhookDoc.exists()) {
        throw new Error('Webhook not found');
      }

      const webhook = { id: webhookDoc.id, ...webhookDoc.data() } as Webhook;

      const testPayload = {
        event: 'webhook.test',
        timestamp: new Date().toISOString(),
        data: {
          message: 'This is a test webhook from Kitchen OS',
          webhookId: webhook.id,
          webhookName: webhook.name,
        },
      };

      const signature = this.generateSignature(JSON.stringify(testPayload), webhook.secret);

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Kitchen-OS-Signature': signature,
          'X-Kitchen-OS-Event': 'webhook.test',
          'User-Agent': 'Kitchen-OS-Webhooks/1.0',
        },
        body: JSON.stringify(testPayload),
      });

      const responseBody = await response.text();

      return {
        success: response.ok,
        response: {
          status: response.status,
          body: responseBody,
          headers: Object.fromEntries(response.headers.entries()),
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get available webhook events
   */
  static getAvailableEvents(): WebhookEvent[] {
    return WEBHOOK_EVENTS;
  }

  /**
   * Generate webhook secret
   */
  private static generateSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate webhook signature
   */
  private static generateSignature(payload: string, secret: string): string {
    // In a real implementation, use HMAC-SHA256
    // For now, we'll use a simple hash
    const crypto = require('crypto');
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  /**
   * Verify webhook signature
   */
  static verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = this.generateSignature(payload, secret);
    return signature === expectedSignature;
  }
}
