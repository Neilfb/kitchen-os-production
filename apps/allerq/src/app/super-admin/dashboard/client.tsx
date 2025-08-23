'use client';

import { useState } from 'react';
import SuperAdminAnalyticsChart from '@/components/SuperAdminAnalyticsChart';
import DateRangeFilter from '@/components/DateRangeFilter';
import { AnalyticsFilters } from '@/hooks/useSuperAdminAnalytics';

export default function SuperAdminDashboardClient() {
  const [filters, setFilters] = useState<AnalyticsFilters>({});

  const handleDateRangeChange = (startDate?: string, endDate?: string) => {
    setFilters(prev => ({
      ...prev,
      startDate,
      endDate
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">System Analytics</h1>
        <DateRangeFilter onChange={handleDateRangeChange} />
      </div>

      <SuperAdminAnalyticsChart filters={filters} />
    </div>
  );
}
