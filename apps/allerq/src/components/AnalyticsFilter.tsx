"use client";

// AnalyticsFilter: date-range & geo/IP filters
import { useState } from "react";

export interface AnalyticsFilters {
  dateFrom?: string;
  dateTo?: string;
  geo?: string;
}

export default function AnalyticsFilter({
  filters,
  setFilters,
}: {
  filters: AnalyticsFilters;
  setFilters: (f: AnalyticsFilters) => void;
}) {
  const [dateFrom, setDateFrom] = useState(filters.dateFrom || "");
  const [dateTo, setDateTo] = useState(filters.dateTo || "");
  const [geo, setGeo] = useState(filters.geo || "");

  const handleApply = () => {
    setFilters({ ...filters, dateFrom, dateTo, geo });
  };

  return (
    <form className="flex gap-4 items-end">
      <div>
        <label className="block mb-1">From</label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="border px-2 py-1 rounded"
        />
      </div>
      <div>
        <label className="block mb-1">To</label>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="border px-2 py-1 rounded"
        />
      </div>
      <div>
        <label className="block mb-1">Geo/IP</label>
        <input
          type="text"
          value={geo}
          onChange={(e) => setGeo(e.target.value)}
          className="border px-2 py-1 rounded"
          placeholder="e.g. US, 192.168.*"
        />
      </div>
      <button
        type="button"
        onClick={handleApply}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Apply
      </button>
    </form>
  );
}
