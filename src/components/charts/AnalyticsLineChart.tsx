'use client'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

interface DataPoint {
  timestamp: string
  [key: string]: string | number
}

interface Series {
  key: string
  label: string
  color: string
}

interface AnalyticsLineChartProps {
  data: DataPoint[]
  series: Series[]
  height?: number
  className?: string
  emptyMessage?: string
  formatXAxis?: (value: string) => string
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  let displayLabel = label
  try {
    const d = new Date(label)
    if (!isNaN(d.getTime())) {
      displayLabel = d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    }
  } catch {}
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1.5">{displayLabel}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-slate-500 dark:text-slate-400">{entry.name}:</span>
          <span className="font-bold text-slate-800 dark:text-white">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

function fmtX(value: string): string {
  try {
    const d = new Date(value)
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  } catch {}
  return value
}

export default function AnalyticsLineChart({
  data,
  series,
  height = 220,
  className = '',
  emptyMessage = 'No data yet',
  formatXAxis,
}: AnalyticsLineChartProps) {
  if (!data.length) {
    return (
      <div
        className={`flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 ${className}`}
        style={{ height }}
      >
        <svg width="40" height="40" fill="none" viewBox="0 0 40 40" className="mb-2 opacity-40">
          <polyline
            points="4,32 14,18 22,24 32,10 36,14"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
        <p className="text-sm">{emptyMessage}</p>
      </div>
    )
  }

  const xFmt = formatXAxis ?? fmtX

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={s.color} stopOpacity={0.18} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f1f5f9"
            vertical={false}
          />
          <XAxis
            dataKey="timestamp"
            tickFormatter={xFmt}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {series.length > 1 && (
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              iconType="circle"
              iconSize={8}
            />
          )}
          {series.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              fill={`url(#grad-${s.key})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
