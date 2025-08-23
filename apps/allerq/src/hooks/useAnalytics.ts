import { useState, useCallback } from "react";
import type { AnalyticsFilters } from "../components/AnalyticsFilter";

interface AnalyticsData {
  [key: string]: unknown;
}

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<AnalyticsFilters>({ dateFrom: "", dateTo: "", geo: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics");
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const result = await res.json();
      setData(Array.isArray(result) ? result : [result]);
    } catch {
      setError("Failed to fetch analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, filters, setFilters, fetchData };
}
