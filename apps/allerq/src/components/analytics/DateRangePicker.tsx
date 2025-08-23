'use client';

import { useState } from 'react';
import { Button } from '@kitchen-os/ui';
import { Input } from '@kitchen-os/ui';
import { Calendar, ChevronDown } from 'lucide-react';

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
  preset?: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

const PRESET_RANGES = [
  {
    label: 'Today',
    value: 'today',
    getRange: () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      return { startDate: today, endDate: endOfDay };
    },
  },
  {
    label: 'Yesterday',
    value: 'yesterday',
    getRange: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      const endOfDay = new Date(yesterday);
      endOfDay.setHours(23, 59, 59, 999);
      return { startDate: yesterday, endDate: endOfDay };
    },
  },
  {
    label: 'Last 7 days',
    value: 'last7days',
    getRange: () => {
      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      return { startDate, endDate };
    },
  },
  {
    label: 'Last 30 days',
    value: 'last30days',
    getRange: () => {
      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
      return { startDate, endDate };
    },
  },
  {
    label: 'This month',
    value: 'thismonth',
    getRange: () => {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      return { startDate, endDate };
    },
  },
  {
    label: 'Last month',
    value: 'lastmonth',
    getRange: () => {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      endDate.setHours(23, 59, 59, 999);
      return { startDate, endDate };
    },
  },
];

export function DateRangePicker({ value, onChange, className = '' }: DateRangePickerProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [customMode, setCustomMode] = useState(false);

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const parseDate = (dateString: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  const handlePresetSelect = (preset: typeof PRESET_RANGES[0]) => {
    const range = preset.getRange();
    onChange({
      ...range,
      preset: preset.value,
    });
    setShowDropdown(false);
    setCustomMode(false);
  };

  const handleCustomDateChange = (field: 'startDate' | 'endDate', dateString: string) => {
    const date = parseDate(dateString);
    onChange({
      ...value,
      [field]: date,
      preset: undefined,
    });
  };

  const getDisplayText = () => {
    if (value.preset) {
      const preset = PRESET_RANGES.find(p => p.value === value.preset);
      return preset?.label || 'Custom range';
    }

    if (value.startDate && value.endDate) {
      const start = value.startDate.toLocaleDateString();
      const end = value.endDate.toLocaleDateString();
      return `${start} - ${end}`;
    }

    if (value.startDate) {
      return `From ${value.startDate.toLocaleDateString()}`;
    }

    if (value.endDate) {
      return `Until ${value.endDate.toLocaleDateString()}`;
    }

    return 'Select date range';
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full justify-between"
      >
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <span>{getDisplayText()}</span>
        </div>
        <ChevronDown className="h-4 w-4" />
      </Button>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            {!customMode ? (
              <div className="space-y-2">
                {PRESET_RANGES.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => handlePresetSelect(preset)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${
                      value.preset === preset.value ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
                
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <button
                    onClick={() => setCustomMode(true)}
                    className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100"
                  >
                    Custom range
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={formatDate(value.startDate)}
                    onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
                    max={formatDate(value.endDate || new Date())}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={formatDate(value.endDate)}
                    onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
                    min={formatDate(value.startDate)}
                    max={formatDate(new Date())}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCustomMode(false)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowDropdown(false)}
                    className="flex-1"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
