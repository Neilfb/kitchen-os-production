'use client';

import { useEffect, useState } from 'react';
import Loader from '../../../components/Loader';
import ErrorDisplay from '../../../components/ErrorDisplay';

// Define Subscription type inline with all required fields
interface Subscription {
  id: string;
  planId: string;
  status: string;
  startDate: string;
  endDate?: string;
  customerId: string;
  plan?: string; // Added based on the API response
}

interface SubscriptionClientProps {
  subscriptionId: string;
}

// Function to fetch a subscription by ID
async function getSubscription(subscriptionId: string): Promise<Subscription> {
  const response = await fetch(`/api/subscriptions?id=${subscriptionId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch subscription: ${response.status}`);
  }
  return await response.json();
}

export default function SubscriptionClient({ subscriptionId }: SubscriptionClientProps) {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadSubscription() {
      try {
        setLoading(true);
        const data = await getSubscription(subscriptionId);
        setSubscription(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load subscription'));
      } finally {
        setLoading(false);
      }
    }
    loadSubscription();
  }, [subscriptionId]);

  if (loading) {
    return <Loader message="Loading subscription details..." />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (!subscription) {
    return <div>Subscription not found</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Subscription Details</h1>
      <div className="space-y-4">
        <div>
          <label className="font-semibold">Customer ID:</label>
          <div>{subscription.customerId}</div>
        </div>
        {/* Add more subscription details here */}
      </div>
    </div>
  );
}
