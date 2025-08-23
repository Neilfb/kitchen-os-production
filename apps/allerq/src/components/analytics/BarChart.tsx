'use client';

import { useMemo } from 'react';

interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarData[];
  height?: number;
  showValues?: boolean;
  horizontal?: boolean;
  color?: string;
}

export function BarChart({ 
  data, 
  height = 300, 
  showValues = true,
  horizontal = false,
  color = '#0ea5e9'
}: BarChartProps) {
  const { chartData, maxValue } = useMemo(() => {
    if (!data.length) return { chartData: [], maxValue: 0 };

    const maxValue = Math.max(...data.map(d => d.value));
    const chartData = data.map(d => ({
      ...d,
      percentage: maxValue > 0 ? (d.value / maxValue) * 100 : 0,
    }));

    return { chartData, maxValue };
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

  if (horizontal) {
    return (
      <div className="space-y-4">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-20 text-sm text-gray-600 text-right truncate">
              {item.label}
            </div>
            <div className="flex-1 relative">
              <div className="bg-gray-200 rounded-full h-6">
                <div
                  className="h-6 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color || color,
                  }}
                >
                  {showValues && (
                    <span className="text-xs text-white font-medium">
                      {item.value}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const chartHeight = height - 40; // Reserve space for labels
  const barWidth = 80 / chartData.length; // Percentage width for each bar
  const barSpacing = 20 / (chartData.length + 1); // Spacing between bars

  return (
    <div className="w-full">
      <div className="relative">
        <svg
          width="100%"
          height={height}
          viewBox="0 0 100 100"
          className="overflow-visible"
        >
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => {
            const y = (chartHeight / 4) * i;
            return (
              <line
                key={`grid-${i}`}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="#f3f4f6"
                strokeWidth="0.5"
              />
            );
          })}

          {/* Y-axis labels */}
          {[0, 1, 2, 3, 4].map(i => {
            const value = Math.round((maxValue / 4) * (4 - i));
            const y = (chartHeight / 4) * i;
            return (
              <text
                key={`y-label-${i}`}
                x="-2"
                y={y + 1}
                textAnchor="end"
                className="text-xs fill-gray-500"
                fontSize="3"
              >
                {value}
              </text>
            );
          })}

          {/* Bars */}
          {chartData.map((item, index) => {
            const x = barSpacing + (index * (barWidth + barSpacing));
            const barHeight = (item.percentage / 100) * chartHeight;
            const y = chartHeight - barHeight;

            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={item.color || color}
                  className="transition-all duration-500 ease-out"
                  rx="1"
                />
                {showValues && item.value > 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 1}
                    textAnchor="middle"
                    className="text-xs fill-gray-700"
                    fontSize="2.5"
                  >
                    {item.value}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2">
          {chartData.map((item, index) => (
            <div
              key={`x-label-${index}`}
              className="text-xs text-gray-500 text-center truncate"
              style={{ 
                width: `${barWidth}%`,
                marginLeft: index === 0 ? `${barSpacing}%` : `${barSpacing}%`,
              }}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
