'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface DonutSlice {
  name: string
  value: number
  color: string
}

interface AnalyticsDonutChartProps {
  data: DonutSlice[]
  centerLabel?: string
  centerValue?: string | number
  height?: number
  className?: string
  emptyMessage?: string
  showLegend?: boolean
}

const RADIAN = Math.PI / 180

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.06) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-lg p-3 text-xs">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ background: payload[0].payload.color }} />
        <span className="font-semibold text-slate-700 dark:text-slate-200">{name}:</span>
        <span className="font-bold text-slate-900 dark:text-white">{value}</span>
      </div>
    </div>
  )
}

export default function AnalyticsDonutChart({
  data,
  centerLabel,
  centerValue,
  height = 220,
  className = '',
  emptyMessage = 'No data yet',
  showLegend = true,
}: AnalyticsDonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0)

  if (!total) {
    return (
      <div
        className={`flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 ${className}`}
        style={{ height }}
      >
        <svg width="40" height="40" fill="none" viewBox="0 0 40 40" className="mb-2 opacity-40">
          <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="2.5" fill="none" />
          <circle cx="20" cy="20" r="8" stroke="currentColor" strokeWidth="2.5" fill="none" />
        </svg>
        <p className="text-sm">{emptyMessage}</p>
      </div>
    )
  }

  const innerR = height < 180 ? 46 : 58
  const outerR = height < 180 ? 72 : 90

  return (
    <div className={`flex ${showLegend ? 'flex-col' : ''} items-center gap-3 ${className}`} style={{ height }}>
      <div style={{ flex: 1, minHeight: 0, width: '100%' }}>
        <ResponsiveContainer width="100%" height={showLegend ? height - 52 : height}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={innerR}
              outerRadius={outerR}
              paddingAngle={2}
              labelLine={false}
              label={renderCustomLabel}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {/* Center text rendered via foreignObject */}
            {centerLabel && (
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-slate-900 dark:fill-white"
              >
                <tspan x="50%" dy="-8" fontSize={20} fontWeight={700} fill="#0f172a">
                  {centerValue}
                </tspan>
                <tspan x="50%" dy={20} fontSize={10} fill="#94a3b8">
                  {centerLabel}
                </tspan>
              </text>
            )}
          </PieChart>
        </ResponsiveContainer>
      </div>
      {showLegend && (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 w-full px-2">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
              <span className="text-[11px] text-slate-600 dark:text-slate-400">
                {d.name} <span className="font-semibold text-slate-800 dark:text-slate-200">({d.value})</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
