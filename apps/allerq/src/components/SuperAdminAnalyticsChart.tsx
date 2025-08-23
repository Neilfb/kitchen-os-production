"use client";
import React, { useEffect } from "react";
import { useSuperAdminAnalytics } from "@/hooks/useSuperAdminAnalytics";
import { AnalyticsFilters } from "@/hooks/useSuperAdminAnalytics";

interface SuperAdminAnalyticsChartProps {
  customerId?: string;
  filters?: AnalyticsFilters;
}

export default function SuperAdminAnalyticsChart({
  customerId,
  filters,
}: SuperAdminAnalyticsChartProps) {
  const { metrics, loading, error, analytics, fetchAnalytics } =
    useSuperAdminAnalytics(customerId);

  useEffect(() => {
    fetchAnalytics(filters);
  }, [fetchAnalytics, filters]);

  if (loading)
    return <div className="animate-pulse">Loading analytics...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {metrics.totalUsers}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
          <p className="mt-2 text-3xl font-semibold text-green-600">
            {metrics.activeUsers}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">
            Total Restaurants
          </h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {metrics.restaurantCount}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Menus</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {metrics.menuCount}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">QR Scans</h3>
          <p className="mt-2 text-3xl font-semibold text-blue-600">
            {metrics.scanCount}
          </p>
        </div>
      </div>

      {/* Analytics Charts */}
      {analytics && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Usage Analytics
          </h3>
          <div className="h-[300px] relative">
            {/* Chart would be rendered here - you'll need to add a charting library like Chart.js */}
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              Chart visualization here
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
