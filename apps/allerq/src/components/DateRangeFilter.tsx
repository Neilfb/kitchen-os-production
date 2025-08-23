// UI for selecting date ranges
import React, { useState } from "react";

interface DateRangeFilterProps {
  dateFrom?: string;
  dateTo?: string;
  onDateFromChange?: (date: string) => void;
  onDateToChange?: (date: string) => void;
  onChange?: (startDate?: string, endDate?: string) => void;
}

export default function DateRangeFilter({
  dateFrom: propDateFrom,
  dateTo: propDateTo,
  onDateFromChange,
  onDateToChange,
  onChange
}: DateRangeFilterProps) {
  const [internalDateFrom, setInternalDateFrom] = useState(propDateFrom || '');
  const [internalDateTo, setInternalDateTo] = useState(propDateTo || '');
  
  const handleFromDateChange = (value: string) => {
    setInternalDateFrom(value);
    if (onDateFromChange) onDateFromChange(value);
    if (onChange) onChange(value, internalDateTo);
  };
  
  const handleToDateChange = (value: string) => {
    setInternalDateTo(value);
    if (onDateToChange) onDateToChange(value);
    if (onChange) onChange(internalDateFrom, value);
  };
  
  return (
    <div className="flex gap-2 items-center">
      <label className="text-sm">From</label>
      <input 
        type="date" 
        className="border rounded px-2 py-1"
        value={internalDateFrom}
        onChange={(e) => handleFromDateChange(e.target.value)}
      />
      <label className="text-sm">To</label>
      <input 
        type="date" 
        className="border rounded px-2 py-1"
        value={internalDateTo}
        onChange={(e) => handleToDateChange(e.target.value)}
      />
      <button className="ml-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
        Apply
      </button>
    </div>
  );
}
