"use client";

import { useState } from "react";
import AnalyticsChart from "../../../components/AnalyticsChart";
import DateRangeFilter from "../../../components/DateRangeFilter";
import { AnalyticsFilters } from "../../../components/AnalyticsFilter";

interface AnalyticsClientProps {
  id: string;
}

export default function AnalyticsClient({ id }: AnalyticsClientProps) {
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const filters: AnalyticsFilters = {
    dateFrom,
    dateTo,
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
        <AnalyticsChart customerId={id} filters={filters} />
      </div>
    </main>
  );
}
