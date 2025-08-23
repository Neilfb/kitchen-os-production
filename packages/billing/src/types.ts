export interface Subscription {
  id: string;
  userId: string;
  status: 'active' | 'canceled' | 'past_due';
  planId: string;
  currentPeriodEnd: Date;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
}
