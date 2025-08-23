import { Subscription } from './types';

export class SubscriptionService {
  async getSubscription(userId: string): Promise<Subscription | null> {
    // Implementation will connect to database
    return null;
  }

  async hasAccess(userId: string, feature: string): Promise<boolean> {
    const subscription = await this.getSubscription(userId);
    return subscription?.status === 'active';
  }
}
