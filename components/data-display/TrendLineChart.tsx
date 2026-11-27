'use client';

import React, { useState } from 'react';

interface DataPoint {
  date: string;
  movements: number;
}

interface TrendLineChartProps {
  data: DataPoint[];
  height?: number;
}

export function TrendLineChart({ data, height = 240 }: TrendLineChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center text-xs text-text-secondary bg-canvas/40 rounded-card"
      >
        Belum ada data tren untuk periode ini
      </div>
    );
  }

  const values = data.map((d) => d.movements);
  const maxVal = Math.max(...values, 5);
  const minVal = 0;

  const paddingLeft = 35;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  const viewBoxWidth = 600;
  const viewBoxHeight = height;

  const plotWidth = viewBoxWidth - paddingLeft - paddingRight;
  const plotHeight = viewBoxHeight - paddingTop - paddingBottom;

  const getX = (index: number) => {
    if (data.length <= 1) return paddingLeft + plotWidth / 2;
    return paddingLeft + (index / (data.length - 1)) * plotWidth;
  };

  const getY = (val: number) => {
    const range = maxVal - minVal || 1;
    return paddingTop + plotHeight - ((val - minVal) / range) * plotHeight;
  };

  const points = data.map((d, i) => `${getX(i)},${getY(d.movements)}`).join(' ');

  // Generate 4 horizontal grid lines
  const gridTicks = [0, Math.round(maxVal / 3), Math.round((maxVal * 2) / 3), maxVal];

  return (
    <div className="relative w-full overflow-hidden select-none" style={{ height }}>
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
      >
        {/* Horizontal grid lines */}
        {gridTicks.map((tick, i) => {
          const y = getY(tick);
          return (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={viewBoxWidth - paddingRight}
                y2={y}
                stroke="#E2E8E3"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 8}
                y={y + 3}
                textAnchor="end"
                className="text-[10px] fill-text-secondary font-mono"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* X Axis Labels */}
        {data.map((d, i) => {
          const x = getX(i);
          return (
            <text
              key={i}
              x={x}
              y={viewBoxHeight - 10}
              textAnchor="middle"
              className="text-[10px] fill-text-secondary"
            >
              {d.date}
            </text>
          );
        })}

        {/* Area fill */}
        <polygon
          points={`${getX(0)},${getY(0)} ${points} ${getX(data.length - 1)},${getY(0)}`}
          fill="url(#greenGradient)"
          opacity="0.25"
        />

        {/* Gradient Definition */}
        <defs>
          <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#26734D" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#26734D" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Line */}
        <polyline
          fill="none"
          stroke="#26734D"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />

        {/* Data Points */}
        {data.map((d, i) => {
          const cx = getX(i);
          const cy = getY(d.movements);
          const isHovered = hoveredIdx === i;

          return (
            <g
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            >
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? 6 : 4}
                className="fill-brand-700 stroke-white stroke-2 transition-all duration-150"
              />
              {/* Invisible larger hover target */}
              <circle cx={cx} cy={cy} r="18" fill="transparent" />
            </g>
          );
        })}
      </svg>

      {/* Floating Tooltip */}
      {hoveredIdx !== null && data[hoveredIdx] && (
        <div
          className="absolute pointer-events-none -translate-x-1/2 -translate-y-full bg-brand-950 text-white text-xs px-2.5 py-1.5 rounded-input shadow-lg border border-brand-900 transition-all z-20 flex flex-col items-center"
          style={{
            left: `${(getX(hoveredIdx) / viewBoxWidth) * 100}%`,
            top: `${(getY(data[hoveredIdx].movements) / viewBoxHeight) * 100}%`,
            marginTop: '-10px',
          }}
        >
          <span className="font-semibold text-emerald-300">
            {data[hoveredIdx].movements} Transaksi
          </span>
          <span className="text-[10px] text-neutral-300">
            {data[hoveredIdx].date}
          </span>
          <div className="w-2 h-2 bg-brand-950 rotate-45 -mb-1 mt-0.5 border-r border-b border-brand-900" />
        </div>
      )}
    </div>
  );
}
