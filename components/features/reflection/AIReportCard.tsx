'use client'
import { useState, useEffect } from 'react'
import { generateWeeklyInsight } from '@/actions/ai' // Re-use your existing action

export default function AIReportCard({ data }: { data: any }) {
  const [insight, setInsight] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      if (!data) return
      const result = await generateWeeklyInsight(data)
      setInsight(result)
      setLoading(false)
    }
    fetch()
  }, [data])

  if (loading)
    return (
      <div className="h-full min-h-[180px] animate-pulse rounded-2xl bg-stone-100 p-6 dark:bg-stone-800/50">
        <div className="mb-4 h-4 w-1/3 rounded bg-stone-200 dark:bg-stone-700"></div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-stone-200 dark:bg-stone-700"></div>
          <div className="h-3 w-5/6 rounded bg-stone-200 dark:bg-stone-700"></div>
        </div>
      </div>
    )

  if (!insight) return null

  return (
    <div className="group relative h-full overflow-hidden rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 p-6 text-stone-100 shadow-xl md:p-8 dark:from-[#0f172a] dark:to-[#1e1b4b]">
      {/* Decorative */}
      <div className="pointer-events-none absolute top-0 right-0 -mt-32 -mr-32 h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest text-orange-400 uppercase">
              Chief of Staff
            </span>
            <div className="h-px flex-1 bg-white/10"></div>
          </div>
          <h3 className="mb-4 font-serif text-xl leading-snug text-white/95 md:text-2xl">
            {insight.executive_summary}
          </h3>
          <div className="rounded-lg border border-white/5 bg-black/20 p-3 backdrop-blur-md">
            <p className="text-xs leading-relaxed text-stone-300">
              <span className="mr-2 text-[9px] font-bold text-stone-500 uppercase">Analysis</span>
              {insight.psych_analysis}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <span className="mb-2 block text-[10px] font-bold tracking-widest text-stone-500 uppercase">
            Tactical Protocol
          </span>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            {insight.tactical_protocol.map((item: string, i: number) => (
              <div
                key={i}
                className="truncate rounded border border-white/5 bg-white/5 px-3 py-2 text-xs text-stone-200"
                title={item}
              >
                • {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
