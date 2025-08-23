'use client';

import { useState } from "react";
import AnalyticsChart from "./AnalyticsChart";
import DateRangeFilter from "./DateRangeFilter";
import type { AnalyticsFilters } from "./AnalyticsFilter";

interface AnalyticsDetailProps {
  id: string;
}

export default function AnalyticsDetail({ id }: AnalyticsDetailProps) {
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  
  const filters: AnalyticsFilters = {
    dateFrom,
    dateTo
  };
  
  return (
    <main className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Analytics Detail</h1>
      <DateRangeFilter 
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
      />
      <div className="mt-8">
        <AnalyticsChart 
          customerId={id}
          filters={filters}
        />
      </div>
    </main>
  );
}
