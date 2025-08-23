'use client';

import { useMemo } from 'react';

interface DataPoint {
  date: string;
  scans: number;
  views: number;
}

interface LineChartProps {
  data: DataPoint[];
  height?: number;
  showGrid?: boolean;
  colors?: {
    scans: string;
    views: string;
  };
}

export function LineChart({ 
  data, 
  height = 300, 
  showGrid = true,
  colors = { scans: '#0ea5e9', views: '#10b981' }
}: LineChartProps) {
  const { chartData, maxValue, dates } = useMemo(() => {
    if (!data.length) return { chartData: [], maxValue: 0, dates: [] };

    const maxScans = Math.max(...data.map(d => d.scans));
    const maxViews = Math.max(...data.map(d => d.views));
    const maxValue = Math.max(maxScans, maxViews);
    
    const chartData = data.map(d => ({
      ...d,
      scansPercent: maxValue > 0 ? (d.scans / maxValue) * 100 : 0,
      viewsPercent: maxValue > 0 ? (d.views / maxValue) * 100 : 0,
    }));

    const dates = data.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    return { chartData, maxValue, dates };
  }, [data]);

  if (!data.length) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
        style={{ height }}
      >
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const chartHeight = height - 60; // Reserve space for labels
  const chartWidth = 100; // Percentage
  const pointSpacing = chartWidth / (chartData.length - 1 || 1);

  // Generate SVG path for line
  const generatePath = (dataKey: 'scansPercent' | 'viewsPercent') => {
    return chartData
      .map((point, index) => {
        const x = index * pointSpacing;
        const y = chartHeight - (point[dataKey] / 100) * chartHeight;
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  const scansPath = generatePath('scansPercent');
  const viewsPath = generatePath('viewsPercent');

  // Grid lines
  const gridLines = [];
  if (showGrid) {
    for (let i = 0; i <= 4; i++) {
      const y = (chartHeight / 4) * i;
      gridLines.push(
        <line
          key={`grid-${i}`}
          x1="0"
          y1={y}
          x2={chartWidth}
          y2={y}
          stroke="#f3f4f6"
          strokeWidth="1"
        />
      );
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-center space-x-6 mb-4">
        <div className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: colors.scans }}
          />
          <span className="text-sm text-gray-600">QR Scans</span>
        </div>
        <div className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: colors.views }}
          />
          <span className="text-sm text-gray-600">Menu Views</span>
        </div>
      </div>

      <div className="relative">
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${chartWidth} ${height}`}
          className="overflow-visible"
        >
          {/* Grid lines */}
          {gridLines}

          {/* Y-axis labels */}
          {[0, 1, 2, 3, 4].map(i => {
            const value = Math.round((maxValue / 4) * (4 - i));
            const y = (chartHeight / 4) * i;
            return (
              <text
                key={`y-label-${i}`}
                x="-5"
                y={y + 4}
                textAnchor="end"
                className="text-xs fill-gray-500"
              >
                {value}
              </text>
            );
          })}

          {/* Lines */}
          <path
            d={scansPath}
            fill="none"
            stroke={colors.scans}
            strokeWidth="2"
            className="drop-shadow-sm"
          />
          <path
            d={viewsPath}
            fill="none"
            stroke={colors.views}
            strokeWidth="2"
            className="drop-shadow-sm"
          />

          {/* Data points */}
          {chartData.map((point, index) => {
            const x = index * pointSpacing;
            const scansY = chartHeight - (point.scansPercent / 100) * chartHeight;
            const viewsY = chartHeight - (point.viewsPercent / 100) * chartHeight;

            return (
              <g key={`points-${index}`}>
                <circle
                  cx={x}
                  cy={scansY}
                  r="3"
                  fill={colors.scans}
                  className="drop-shadow-sm"
                />
                <circle
                  cx={x}
                  cy={viewsY}
                  r="3"
                  fill={colors.views}
                  className="drop-shadow-sm"
                />
              </g>
            );
          })}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2 px-1">
          {dates.map((date, index) => (
            <span
              key={`x-label-${index}`}
              className="text-xs text-gray-500"
              style={{ 
                transform: index % 2 === 1 ? 'translateX(-50%)' : 'translateX(0)',
              }}
            >
              {date}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
