'use client'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts'

interface BarSeries {
  key: string
  label: string
  color: string
}

interface AnalyticsBarChartProps {
  data: Record<string, string | number>[]
  series: BarSeries[]
  labelKey: string
  height?: number
  layout?: 'vertical' | 'horizontal'
  className?: string
  emptyMessage?: string
  barSize?: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1.5 truncate max-w-[160px]">{label}</p>
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

export default function AnalyticsBarChart({
  data,
  series,
  labelKey,
  height = 220,
  layout = 'horizontal',
  className = '',
  emptyMessage = 'No data yet',
  barSize = 18,
}: AnalyticsBarChartProps) {
  if (!data.length) {
    return (
      <div
        className={`flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 ${className}`}
        style={{ height }}
      >
        <svg width="40" height="40" fill="none" viewBox="0 0 40 40" className="mb-2 opacity-40">
          <rect x="5" y="22" width="8" height="13" rx="2" stroke="currentColor" strokeWidth="2.5" fill="none" />
          <rect x="16" y="14" width="8" height="21" rx="2" stroke="currentColor" strokeWidth="2.5" fill="none" />
          <rect x="27" y="8" width="8" height="27" rx="2" stroke="currentColor" strokeWidth="2.5" fill="none" />
        </svg>
        <p className="text-sm">{emptyMessage}</p>
      </div>
    )
  }

  if (layout === 'vertical') {
    // Horizontal bar chart (categories on Y axis)
    return (
      <div className={className} style={{ height: Math.max(height, data.length * 40 + 20) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-700/50" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey={labelKey}
              tick={{ fontSize: 10, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              width={100}
              tickFormatter={(v) => v.length > 14 ? v.slice(0, 13) + '…' : v}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.04)' }} />
            {series.map((s, i) => (
              <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[0, 4, 4, 0]} barSize={barSize} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-700/50" vertical={false} />
          <XAxis
            dataKey={labelKey}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => typeof v === 'string' && v.length > 10 ? v.slice(0, 9) + '…' : v}
          />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.04)' }} />
          {series.length > 1 && (
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" iconSize={8} />
          )}
          {series.map((s) => (
            <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[4, 4, 0, 0]} barSize={barSize} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
