'use client';

import { useState } from "react";
import AnalyticsChart from "../../../components/AnalyticsChart";
import AnalyticsFilter, { AnalyticsFilters } from "../../../components/AnalyticsFilter";

export default function SuperAdminDashboardClient() {
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  
  return (
    <main className="max-w-6xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Super Admin Analytics Dashboard</h1>
      <AnalyticsFilter filters={filters} setFilters={setFilters} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <AnalyticsChart customerId="all" filters={filters} type="usage" />
        <AnalyticsChart customerId="all" filters={filters} type="growth" />
        <AnalyticsChart customerId="all" filters={filters} type="revenue" />
        <AnalyticsChart customerId="all" filters={filters} type="allergens" />
      </div>
    </main>
  );
}
