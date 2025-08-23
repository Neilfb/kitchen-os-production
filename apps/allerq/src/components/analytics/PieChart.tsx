'use client';

import { useMemo } from 'react';

interface PieData {
  label: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieData[];
  size?: number;
  showLabels?: boolean;
  showLegend?: boolean;
  colors?: string[];
}

const DEFAULT_COLORS = [
  '#0ea5e9', // Blue
  '#10b981', // Green
  '#f59e0b', // Yellow
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange
];

export function PieChart({ 
  data, 
  size = 200, 
  showLabels = true,
  showLegend = true,
  colors = DEFAULT_COLORS
}: PieChartProps) {
  const { chartData, total } = useMemo(() => {
    if (!data.length) return { chartData: [], total: 0 };

    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    const chartData = data.map((item, index) => {
      const percentage = total > 0 ? (item.value / total) * 100 : 0;
      const angle = total > 0 ? (item.value / total) * 360 : 0;
      const startAngle = currentAngle;
      currentAngle += angle;

      return {
        ...item,
        percentage,
        angle,
        startAngle,
        endAngle: currentAngle,
        color: item.color || colors[index % colors.length],
      };
    });

    return { chartData, total };
  }, [data, colors]);

  if (!data.length || total === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
        style={{ width: size, height: size }}
      >
        <p className="text-gray-500 text-sm">No data</p>
      </div>
    );
  }

  const radius = (size - 40) / 2; // Leave margin for labels
  const center = size / 2;

  // Create SVG path for each slice
  const createPath = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(center, center, radius, endAngle);
    const end = polarToCartesian(center, center, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M", center, center,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const getLabelPosition = (startAngle: number, endAngle: number) => {
    const midAngle = (startAngle + endAngle) / 2;
    const labelRadius = radius * 0.7;
    return polarToCartesian(center, center, labelRadius, midAngle);
  };

  return (
    <div className="flex items-center space-x-6">
      <div className="relative">
        <svg width={size} height={size}>
          {chartData.map((slice, index) => {
            const path = createPath(slice.startAngle, slice.endAngle);
            const labelPos = getLabelPosition(slice.startAngle, slice.endAngle);

            return (
              <g key={index}>
                <path
                  d={path}
                  fill={slice.color}
                  className="transition-all duration-300 hover:opacity-80"
                />
                {showLabels && slice.percentage > 5 && (
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs fill-white font-medium"
                    style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.5)' }}
                  >
                    {slice.percentage.toFixed(0)}%
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{total}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="space-y-2">
          {chartData.map((slice, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              <div className="text-sm">
                <div className="text-gray-900 font-medium">{slice.label}</div>
                <div className="text-gray-500">
                  {slice.value} ({slice.percentage.toFixed(1)}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
