import { useState, useCallback } from "react";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
}

interface Subscription {
  id: string;
  planId: string;
  status: string;
  startDate: string;
  endDate?: string;
}

export function useSubscriptions() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [current, setCurrent] = useState<Subscription | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/subscriptions");
      if (!res.ok) throw new Error("Failed to fetch plans");
      const data = await res.json();
      setPlans(data.subscriptions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch plans");
      console.error("Error fetching plans:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCurrent = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/subscriptions/${id}`);
      if (!res.ok) throw new Error("Failed to fetch current subscription");
      const data = await res.json();
      setCurrent(data.subscription || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch subscription");
      console.error("Error fetching subscription:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { plans, current, fetchPlans, fetchCurrent, setPlans, setCurrent };
}
