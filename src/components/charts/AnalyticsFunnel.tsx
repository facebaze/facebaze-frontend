'use client'

interface FunnelStage {
  stage: string
  count: number
  color: string
}

interface AnalyticsFunnelProps {
  stages: FunnelStage[]
  className?: string
}

export default function AnalyticsFunnel({ stages, className = '' }: AnalyticsFunnelProps) {
  const max = Math.max(...stages.map((s) => s.count), 1)

  if (!stages.some((s) => s.count > 0)) {
    return (
      <div className={`flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 py-8 ${className}`}>
        <p className="text-sm">No funnel data yet</p>
      </div>
    )
  }

  return (
    <div className={`space-y-2.5 ${className}`}>
      {stages.map((stage, i) => {
        const pct = max > 0 ? (stage.count / max) * 100 : 0
        const prev = i > 0 ? stages[i - 1].count : null
        const drop = prev !== null && prev > 0 ? Math.round(((prev - stage.count) / prev) * 100) : null

        return (
          <div key={stage.stage}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{stage.stage}</span>
              <div className="flex items-center gap-2">
                {drop !== null && drop >= 0 && (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    -{drop}% drop
                  </span>
                )}
                <span className="text-xs font-bold text-slate-900 dark:text-white">{stage.count.toLocaleString()}</span>
              </div>
            </div>
            <div className="h-7 w-full bg-slate-100 dark:bg-slate-700/50 rounded-lg overflow-hidden">
              <div
                className="h-full rounded-lg transition-all duration-700 ease-out flex items-center justify-end pr-2"
                style={{ width: `${Math.max(pct, 2)}%`, background: stage.color }}
              >
                {pct > 15 && (
                  <span className="text-[10px] font-bold text-white/90">{Math.round(pct)}%</span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
