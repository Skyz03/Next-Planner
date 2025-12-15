'use client'

import { useState } from 'react'

interface DayData {
  day: string
  dateNum?: number
  fullDate: string
  total: number
}

interface VelocityChartProps {
  data: DayData[]
  range: 'week' | 'month'
}

export default function VelocityChart({ data, range }: VelocityChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // 1. Calculate Metrics
  const max = Math.max(...data.map((d) => d.total)) || 5
  const totalTasks = data.reduce((acc, curr) => acc + curr.total, 0)
  const average = totalTasks / data.length

  // Calculate where the "Average Line" should sit (percentage from bottom)
  const averagePct = (average / max) * 100

  return (
    <div className="w-full rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-[#262626]">
      {/* HEADER */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h3 className="mb-1 text-xs font-bold tracking-widest text-stone-400 uppercase">
            {range === 'month' ? 'Monthly Momentum' : 'Daily Velocity'}
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl font-bold text-stone-800 dark:text-stone-100">
              {average.toFixed(1)}
            </span>
            <span className="text-[10px] font-medium text-stone-500">avg tasks / day</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-[10px] text-stone-400">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-stone-800 dark:bg-stone-400"></div>
            <span>Volume</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-px w-2 bg-orange-500/50"></div>
            <span>Baseline</span>
          </div>
        </div>
      </div>

      {/* CHART CONTAINER */}
      <div className="relative h-48 w-full select-none">
        {/* BACKGROUND GUIDES (Optional aesthetic touch) */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
          <div className="h-px w-full border-t border-dashed border-stone-200 bg-stone-100 dark:border-stone-800 dark:bg-stone-800/50"></div>
          <div className="h-px w-full border-t border-dashed border-stone-200 bg-stone-100 dark:border-stone-800 dark:bg-stone-800/50"></div>
          <div className="h-px w-full border-t border-dashed border-stone-200 bg-stone-100 dark:border-stone-800 dark:bg-stone-800/50"></div>
          <div className="h-px w-full bg-stone-200 dark:bg-stone-700"></div> {/* Base */}
        </div>

        {/* ------------------------------------------- */}
        {/* THE AVERAGE LINE (The "Architect" Feature)  */}
        {/* ------------------------------------------- */}
        <div
          className="pointer-events-none absolute right-0 left-0 z-0 flex items-end justify-end border-t border-orange-500/30 pr-2 dark:border-orange-400/30"
          style={{ bottom: `${averagePct}%` }}
        >
          <span className="-mb-2 bg-white px-1 text-[9px] text-orange-500/60 dark:bg-[#262626]">
            avg
          </span>
        </div>

        {/* BARS CONTAINER */}
        <div className="absolute inset-0 z-10 flex items-end justify-between gap-1 pl-2">
          {data.map((d, i) => {
            const heightPct = (d.total / max) * 100
            const isHovered = hoveredIndex === i

            // For monthly view, only show bars, no text labels unless hovered
            const showLabel = range === 'week' || i % 5 === 0 || i === data.length - 1

            return (
              <div
                key={i}
                className="group relative flex h-full flex-1 flex-col items-center justify-end"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* TOOLTIP (Floating Above) */}
                <div
                  className={`pointer-events-none absolute -top-8 transition-all duration-200 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'} `}
                >
                  <div className="z-50 rounded bg-stone-900 px-2 py-1 text-[10px] font-bold whitespace-nowrap text-white shadow-xl">
                    {d.total} Tasks <span className="ml-1 font-normal opacity-60">on {d.day}</span>
                  </div>
                  {/* Triangle */}
                  <div className="mx-auto -mt-1 h-2 w-2 rotate-45 bg-stone-900"></div>
                </div>

                {/* THE BAR */}
                <div
                  className="relative flex w-full max-w-[40px] items-end overflow-hidden rounded-t-sm transition-all duration-300"
                  style={{ height: `${Math.max(heightPct, 2)}%` }} // Min 2% visibility
                >
                  {/* Bar Fill */}
                  <div
                    className={`h-full w-full transition-colors duration-200 ${
                      isHovered
                        ? 'bg-orange-500 dark:bg-orange-500'
                        : 'bg-stone-800 opacity-90 dark:bg-stone-400'
                    } `}
                  ></div>

                  {/* Reflection/Shine Effect (Subtle) */}
                  <div className="absolute top-0 right-0 left-0 h-px bg-white/20"></div>
                </div>

                {/* BASELINE DOT (For 0 days) */}
                {d.total === 0 && (
                  <div className="absolute bottom-0 mb-1 h-1 w-1 rounded-full bg-stone-300 dark:bg-stone-700"></div>
                )}

                {/* X-AXIS LABELS */}
                <div className="mt-2 flex h-4 items-start justify-center">
                  <span
                    className={`font-mono text-[9px] transition-colors duration-200 ${isHovered ? 'font-bold text-stone-800 dark:text-stone-100' : 'text-stone-400'} ${!showLabel && !isHovered ? 'opacity-0' : 'opacity-100'} `}
                  >
                    {range === 'month' ? d.dateNum : d.day}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
