import React, { useState } from 'react';
import { motion } from 'motion/react';

interface ChartProps {
  type: 'bar' | 'line' | 'multi-bar' | 'donut';
  data: { label: string; value: number; secondaryValue?: number }[];
  title?: string;
  height?: number;
  color?: 'emerald' | 'indigo' | 'amber' | 'rose';
}

export const Charts: React.FC<ChartProps> = ({
  type,
  data,
  title = 'Predictive Analytics Output',
  height = 240,
  color = 'emerald'
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400">
        No analytical data provided.
      </div>
    );
  }

  // Get min/max for scale sizing
  const values = data.map(d => d.value);
  const maxVal = Math.max(...values, 1);
  const padding = 40;

  // Render SVG Line Chart
  const renderLineChart = () => {
    const width = 500;
    const chartHeight = height - padding;
    const pointsCount = data.length;
    
    // Generate coordinate pairs
    const coordinates = data.map((d, idx) => {
      const x = padding + (idx * (width - padding * 2)) / Math.max(pointsCount - 1, 1);
      const y = chartHeight - (d.value / maxVal) * (chartHeight - padding);
      return { x, y, label: d.label, val: d.value };
    });

    // Create SVG Path string
    const pathString = coordinates.reduce((acc, c, idx) => {
      return idx === 0 ? `M ${c.x} ${c.y}` : `${acc} L ${c.x} ${c.y}`;
    }, '');

    // Area fill path string
    const areaPathString = coordinates.length > 0
      ? `${pathString} L ${coordinates[coordinates.length - 1].x} ${chartHeight} L ${coordinates[0].x} ${chartHeight} Z`
      : '';

    const strokeColor = color === 'emerald' ? '#10b981' : color === 'rose' ? '#f43f5e' : '#6366f1';
    const fillColor = color === 'emerald' ? 'rgba(16, 185, 129, 0.08)' : color === 'rose' ? 'rgba(244, 63, 94, 0.08)' : 'rgba(99, 102, 241, 0.08)';

    return (
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = chartHeight - ratio * (chartHeight - padding);
            const gridVal = ratio * maxVal;
            return (
              <g key={i}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="rgba(148, 163, 184, 0.08)"
                  strokeWidth="1.5"
                />
                <text
                  x={padding - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-400 dark:fill-slate-600 font-mono text-[9px]"
                >
                  {gridVal >= 1000 ? `${(gridVal / 1000).toFixed(0)}k` : gridVal.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Area under the line */}
          <path d={areaPathString} fill={fillColor} />

          {/* Core Line */}
          <motion.path
            d={pathString}
            fill="none"
            stroke={strokeColor}
            strokeWidth="3.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />

          {/* Data Points / Interactivity circles */}
          {coordinates.map((c, idx) => (
            <g key={idx} onMouseEnter={() => setHoveredIdx(idx)} onMouseLeave={() => setHoveredIdx(null)}>
              {/* Invisible interactive hover zone */}
              <circle cx={c.x} cy={c.y} r={16} fill="transparent" className="cursor-pointer" />
              {/* Rendered Circle */}
              <circle
                cx={c.x}
                cy={c.y}
                r={hoveredIdx === idx ? 6 : 4.5}
                fill={hoveredIdx === idx ? strokeColor : '#fff'}
                stroke={strokeColor}
                strokeWidth={hoveredIdx === idx ? 3.5 : 2.5}
                className="transition-all duration-100 cursor-pointer shadow-md"
              />
            </g>
          ))}
        </svg>

        {/* Dynamic Interactive Tooltip */}
        {hoveredIdx !== null && coordinates[hoveredIdx] && (
          <div className="absolute top-1 right-2 bg-slate-900/95 dark:bg-slate-800/95 text-white p-2.5 rounded-xl border border-slate-700/50 shadow-xl text-left pointer-events-none transition-all duration-100">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{coordinates[hoveredIdx].label}</div>
            <div className="text-sm font-black font-sans text-emerald-400 mt-0.5">
              ${coordinates[hoveredIdx].val.toLocaleString()}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render SVG Horizontal Feature Importance Bar Chart
  const renderBarChart = () => {
    const width = 500;
    const barHeight = 24;
    const gap = 12;
    const startX = 140; // Spacing for labels
    const chartWidth = width - startX - padding;

    return (
      <div className="w-full">
        <svg viewBox={`0 0 ${width} ${data.length * (barHeight + gap) + padding}`} className="w-full h-auto">
          {data.map((d, idx) => {
            const barWidth = (d.value / maxVal) * chartWidth;
            const y = idx * (barHeight + gap) + padding;
            const strokeColor = color === 'emerald' ? '#10b981' : color === 'rose' ? '#f43f5e' : '#6366f1';

            return (
              <g key={idx} className="group">
                {/* Horizontal grid guide */}
                <line
                  x1={startX}
                  y1={y + barHeight / 2}
                  x2={width - padding}
                  y2={y + barHeight / 2}
                  stroke="rgba(148, 163, 184, 0.05)"
                  strokeDasharray="2 2"
                />

                {/* Left Label */}
                <text
                  x={startX - 12}
                  y={y + barHeight / 2 + 4}
                  textAnchor="end"
                  className="fill-slate-600 dark:fill-slate-300 font-mono text-[10px] font-bold"
                >
                  {d.label}
                </text>

                {/* Background Track */}
                <rect
                  x={startX}
                  y={y}
                  width={chartWidth}
                  height={barHeight}
                  rx="6"
                  className="fill-slate-100/60 dark:fill-slate-800/40"
                />

                {/* Actual value bar */}
                <motion.rect
                  x={startX}
                  y={y}
                  height={barHeight}
                  rx="6"
                  fill={strokeColor}
                  className="opacity-90 hover:opacity-100 cursor-pointer"
                  initial={{ width: 0 }}
                  animate={{ width: barWidth }}
                  transition={{ duration: 0.85, delay: idx * 0.05, ease: 'easeOut' }}
                />

                {/* Right Value Label */}
                <text
                  x={startX + Math.max(8, barWidth - 36)}
                  y={y + barHeight / 2 + 3.5}
                  className={`font-mono text-[9px] font-extrabold ${
                    barWidth > 45 ? 'fill-white' : 'fill-slate-500 dark:fill-slate-400'
                  }`}
                >
                  {(d.value * 100).toFixed(1)}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div id={`analytics-chart-${type}`} className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/50 p-4 rounded-2xl">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{title}</span>
          <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/15">ACTIVE_STREAM</span>
        </div>
      )}
      <div className="flex-1 flex items-center justify-center">
        {type === 'line' ? renderLineChart() : renderBarChart()}
      </div>
    </div>
  );
};
