// filepath: /Users/neilbradley/allerq-forge/AllerQ-Forge/src/components/AnalyticsChart.tsx
import React from "react";

import { AnalyticsFilters } from "./AnalyticsFilter";

export interface ChartData {
  // Define specific analytics data properties
  usage?: unknown[];
  growth?: unknown[];
  revenue?: unknown[];
  allergens?: unknown[];
  languages?: unknown[];
  // Allow for other properties as needed
  [key: string]: unknown;
}

export interface AnalyticsChartProps {
  customerId?: string;
  filters?: AnalyticsFilters;
  type?: "usage" | "growth" | "revenue" | "allergens" | "languages";
  data?: ChartData; // For data passed directly to the chart
}

export default function AnalyticsChart({
  customerId,
  filters = {},
  type = "usage",
  data
}: AnalyticsChartProps) {
  // Placeholder: fetch and display metrics for customer or global
  return (
    <div className="bg-white rounded shadow p-4">
      <div className="font-bold mb-2">{type.charAt(0).toUpperCase() + type.slice(1)} Analytics</div>
      <div className="text-gray-500 text-sm">
        (Chart for {customerId ? `customer ${customerId}` : "all customers"})
        {filters.dateFrom && ` from ${filters.dateFrom}`}
        {filters.dateTo && ` to ${filters.dateTo}`}
        {filters.geo && ` in ${filters.geo}`}
      </div>
      {/* Display data if available */}
      {data && (
        <pre className="text-xs mt-2 overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
