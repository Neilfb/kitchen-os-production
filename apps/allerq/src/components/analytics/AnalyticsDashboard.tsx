'use client';

import { useState, useEffect } from 'react';
import { AnalyticsService, DashboardMetrics } from '@kitchen-os/database';
import { MetricCard } from './MetricCard';
import { LineChart } from './LineChart';
import { BarChart } from './BarChart';
import { PieChart } from './PieChart';
import { DateRangePicker, DateRange } from './DateRangePicker';
import { Button } from '@kitchen-os/ui';
import {
  QrCode,
  Eye,
  MousePointer,
  Users,
  TrendingUp,
  Download,
  RefreshCw,
  Clock,
} from 'lucide-react';

interface AnalyticsDashboardProps {
  restaurantId: string;
  restaurantName: string;
}

export function AnalyticsDashboard({ restaurantId, restaurantName }: AnalyticsDashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
    preset: 'last30days',
  });

  useEffect(() => {
    // Set initial date range
    const preset = PRESET_RANGES.find(p => p.value === 'last30days');
    if (preset) {
      const range = preset.getRange();
      setDateRange({ ...range, preset: 'last30days' });
    }
  }, []);

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      loadMetrics();
    }
  }, [restaurantId, dateRange]);

  const loadMetrics = async () => {
    if (!dateRange.startDate || !dateRange.endDate) return;

    try {
      setLoading(true);
      setError(null);
      
      const data = await AnalyticsService.getDashboardMetrics(
        restaurantId,
        dateRange.startDate,
        dateRange.endDate
      );
      
      setMetrics(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!metrics) return;

    // Create CSV data
    const csvData = [
      ['Metric', 'Value'],
      ['Total QR Scans', metrics.totalScans],
      ['Total Menu Views', metrics.totalViews],
      ['Total Item Clicks', metrics.totalClicks],
      ['Unique Visitors', metrics.uniqueVisitors],
      [''],
      ['Date', 'QR Scans', 'Menu Views'],
      ...metrics.scansByDay.map(day => [day.date, day.scans, day.views]),
      [''],
      ['Device Type', 'Count'],
      ...metrics.deviceBreakdown.map(device => [device.device, device.count]),
      [''],
      ['Country', 'Count'],
      ...metrics.locationBreakdown.map(location => [location.country, location.count]),
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${restaurantName}_analytics_${dateRange.startDate?.toISOString().split('T')[0]}_${dateRange.endDate?.toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getPeakHour = () => {
    if (!metrics?.peakHours.length) return null;
    
    const peak = metrics.peakHours.reduce((max, hour) => 
      hour.count > max.count ? hour : max
    );
    
    const hour12 = peak.hour === 0 ? 12 : peak.hour > 12 ? peak.hour - 12 : peak.hour;
    const ampm = peak.hour < 12 ? 'AM' : 'PM';
    
    return `${hour12}:00 ${ampm}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-kitchen-os-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p>Error loading analytics: {error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={loadMetrics}
          className="mt-2"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No analytics data available for the selected period.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">{restaurantName}</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            className="w-64"
          />
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={loadMetrics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="QR Code Scans"
          value={metrics.totalScans}
          icon={<QrCode className="h-5 w-5 text-blue-600" />}
          description="Total QR code scans"
        />
        <MetricCard
          title="Menu Views"
          value={metrics.totalViews}
          icon={<Eye className="h-5 w-5 text-green-600" />}
          description="Total menu page views"
        />
        <MetricCard
          title="Item Clicks"
          value={metrics.totalClicks}
          icon={<MousePointer className="h-5 w-5 text-purple-600" />}
          description="Menu item interactions"
        />
        <MetricCard
          title="Unique Visitors"
          value={metrics.uniqueVisitors}
          icon={<Users className="h-5 w-5 text-orange-600" />}
          description="Unique customer sessions"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Over Time */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Over Time</h3>
          <LineChart data={metrics.scansByDay} height={300} />
        </div>

        {/* Peak Hours */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Peak Usage Hours</h3>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              Peak: {getPeakHour()}
            </div>
          </div>
          <BarChart
            data={metrics.peakHours.map(hour => ({
              label: `${hour.hour}:00`,
              value: hour.count,
            }))}
            height={300}
            color="#8b5cf6"
          />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Types</h3>
          <PieChart
            data={metrics.deviceBreakdown.map((device, index) => ({
              label: device.device,
              value: device.count,
              color: ['#0ea5e9', '#10b981', '#f59e0b'][index % 3],
            }))}
            size={200}
            showLegend={true}
          />
        </div>

        {/* Top Locations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Locations</h3>
          <BarChart
            data={metrics.locationBreakdown.slice(0, 5).map(location => ({
              label: location.country,
              value: location.count,
            }))}
            height={250}
            horizontal={true}
            color="#06b6d4"
          />
        </div>

        {/* Top Menu Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Items</h3>
          <div className="space-y-3">
            {metrics.topMenuItems.slice(0, 5).map((item, index) => (
              <div key={item.itemId} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <span className="text-sm text-gray-900 truncate">
                    {item.name || `Item ${item.itemId.slice(-6)}`}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {item.clicks} clicks
                </span>
              </div>
            ))}
            {metrics.topMenuItems.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No item clicks recorded yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper for date range presets
const PRESET_RANGES = [
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
];
