'use client';

// Analytics dashboard overview with filters and charts
import { useState, useEffect } from "react";
import AnalyticsChart, { ChartData as AnalyticsChartData } from "./AnalyticsChart";
import AnalyticsFilter, { AnalyticsFilters } from "./AnalyticsFilter";
import { useSuperAdminAnalytics, ChartData as AdminChartData } from "@/hooks/useSuperAdminAnalytics";

export default function AnalyticsDashboardClient() {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateFrom: "",
    dateTo: "",
    geo: ""
  });
  const { analytics, metrics, loading, error, fetchAnalytics } = useSuperAdminAnalytics();

  useEffect(() => {
    const abortController = new AbortController();
    
    async function loadAnalytics() {
      try {
        await fetchAnalytics(filters, abortController.signal);
      } catch (err) {
        if (!abortController.signal.aborted) {
          console.error("Error loading analytics:", err);
        }
      }
    }

    loadAnalytics();

    return () => {
      abortController.abort();
    };
  }, [filters, fetchAnalytics]);

  const handleFiltersChange = (newFilters: AnalyticsFilters) => {
    setFilters(newFilters);
  };

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <main className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="text-sm text-gray-500">Total Scans</div>
          <div className="text-2xl font-bold">{metrics?.scanCount ?? 0}</div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="text-sm text-gray-500">Active Restaurants</div>
          <div className="text-2xl font-bold">{metrics?.restaurantCount ?? 0}</div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="text-sm text-gray-500">Total Menus</div>
          <div className="text-2xl font-bold">{metrics?.menuCount ?? 0}</div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="text-sm text-gray-500">Active Users</div>
          <div className="text-2xl font-bold">{metrics?.activeUsers ?? 0}</div>
        </div>
      </div>

      <AnalyticsFilter filters={filters} setFilters={handleFiltersChange} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Scan Activity</h2>
          <AnalyticsChart 
            // Use explicit empty object that matches the ChartData interface
            data={analytics ? {usage: analytics.datasets ? analytics.datasets : [], [String('other')]: undefined} : undefined} 
            type="usage" 
          />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Allergen Trends</h2>
          <AnalyticsChart 
            // Use explicit empty object that matches the ChartData interface
            data={analytics ? {allergens: analytics.datasets ? analytics.datasets : [], [String('other')]: undefined} : undefined} 
            type="allergens" 
          />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Device Usage</h2>
          <AnalyticsChart 
            // Use explicit empty object that matches the ChartData interface
            data={analytics ? {growth: analytics.datasets ? analytics.datasets : [], [String('other')]: undefined} : undefined} 
            type="growth" 
          />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Language Distribution</h2>
          <AnalyticsChart 
            // Use explicit empty object that matches the ChartData interface
            data={analytics ? {languages: analytics.datasets ? analytics.datasets : [], [String('other')]: undefined} : undefined} 
            type="languages" 
          />
        </div>
      </div>
    </main>
  );
}
