'use client'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

interface HeatCell {
  hour: number
  dayOfWeek: number
  count: number
}

interface AnalyticsHeatmapProps {
  data: HeatCell[]
  className?: string
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export default function AnalyticsHeatmap({ data, className = '' }: AnalyticsHeatmapProps) {
  const max = Math.max(...data.map((d) => d.count), 1)

  if (!data.length || max === 0) {
    return (
      <div className={`flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 py-8 ${className}`}>
        <p className="text-sm">No scan data yet</p>
      </div>
    )
  }

  const getCount = (day: number, hour: number) => {
    const cell = data.find((d) => d.dayOfWeek === day && d.hour === hour)
    return cell?.count ?? 0
  }

  const cellColor = (count: number) => {
    if (count === 0) return undefined // use CSS class
    const t = count / max
    // from brand-100 (#e0e7ff) to brand-700 (#4338ca)
    const r = Math.round(lerp(224, 67, t))
    const g = Math.round(lerp(231, 56, t))
    const b = Math.round(lerp(255, 202, t))
    return `rgb(${r},${g},${b})`
  }

  return (
    <div className={`overflow-x-auto -mx-1 ${className}`}>
      <div className="min-w-[340px] px-1">
        {/* Hour labels */}
        <div className="flex mb-1 pl-8">
          {[0, 3, 6, 9, 12, 15, 18, 21].map((h) => (
            <div key={h} className="flex-1 text-[9px] text-slate-400 text-center">
              {h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h - 12}p`}
            </div>
          ))}
        </div>

        {DAYS.map((day, dayIdx) => (
          <div key={day} className="flex items-center gap-0.5 mb-0.5">
            <span className="w-7 text-[9px] text-slate-400 shrink-0">{day}</span>
            <div className="flex flex-1 gap-0.5">
              {HOURS.map((hour) => {
                const count = getCount(dayIdx, hour)
                const bg = cellColor(count)
                return (
                  <div
                    key={hour}
                    className={`flex-1 h-5 rounded-sm ${!bg ? 'bg-slate-100 dark:bg-slate-700/50' : ''}`}
                    style={bg ? { background: bg } : undefined}
                    title={`${day} ${hour}:00 — ${count} scan${count !== 1 ? 's' : ''}`}
                  />
                )
              })}
            </div>
          </div>
        ))}

        {/* Legend */}
        <div className="flex items-center gap-1.5 mt-2 pl-8">
          <span className="text-[9px] text-slate-400">Less</span>
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
            const c = cellColor(Math.round(t * max)) || 'transparent'
            return (
              <div
                key={i}
                className="w-3.5 h-3.5 rounded-sm"
                style={{ background: t === 0 ? '#f1f5f9' : c }}
              />
            )
          })}
          <span className="text-[9px] text-slate-400">More</span>
        </div>
      </div>
    </div>
  )
}
