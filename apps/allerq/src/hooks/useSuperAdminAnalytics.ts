import { useState, useCallback } from "react";

export interface SuperAdminMetrics {
  scanCount: number;
  menuCount: number;
  restaurantCount: number;
  totalUsers: number;
  activeUsers: number;
}

export interface AnalyticsFilters {
  dateFrom?: string;
  dateTo?: string;
  geo?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

export function useSuperAdminAnalytics(customerId?: string) {
  const [analytics, setAnalytics] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [metrics, setMetrics] = useState<SuperAdminMetrics>({
    scanCount: 0,
    menuCount: 0,
    restaurantCount: 0,
    totalUsers: 0,
    activeUsers: 0
  });

  const fetchAnalytics = useCallback(async (filters?: AnalyticsFilters, signal?: AbortSignal) => {
    if (signal?.aborted) return;
    
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (customerId) params.set('customerId', customerId);
      if (filters?.dateFrom) params.set('startDate', filters.dateFrom);
      if (filters?.dateTo) params.set('endDate', filters.dateTo);
      if (filters?.geo) params.set('geo', filters.geo);
      const url = `/api/analytics/super-admin?${params.toString()}`;
      const res = await fetch(url, { signal });
      
      if (signal?.aborted) return;
      if (!res.ok) throw new Error("Failed to fetch analytics");
      
      const data = await res.json();
      if (signal?.aborted) return;
      
      setAnalytics(data.charts || null);
      if (data.metrics) {
        setMetrics((prevMetrics) => ({
          ...prevMetrics,
          ...data.metrics
        }));
      }
    } catch (err) {
      if (!signal?.aborted) {
        console.error("Analytics error:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch analytics");
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [customerId]);

  return { analytics, loading, error, fetchAnalytics, metrics, setMetrics };
}
