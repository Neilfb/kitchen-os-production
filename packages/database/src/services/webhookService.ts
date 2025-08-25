export interface Webhook {
  id: string;
  restaurantId: string;
  name: string;
  url: string;
  active: boolean;
}

export class WebhookService {
  static async createWebhook(webhookData: any): Promise<Webhook> {
    return {
      id: 'test-id',
      restaurantId: webhookData.restaurantId,
      name: webhookData.name,
      url: webhookData.url,
      active: true,
    };
  }

  static async getWebhooksByRestaurant(restaurantId: string): Promise<Webhook[]> {
    return [];
  }

  static async triggerWebhook(restaurantId: string, eventType: string, payload: any): Promise<void> {
    console.log('Webhook triggered', { restaurantId, eventType, payload });
  }
}
