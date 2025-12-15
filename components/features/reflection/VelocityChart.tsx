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
    const max = Math.max(...data.map(d => d.total)) || 5
    const totalTasks = data.reduce((acc, curr) => acc + curr.total, 0)
    const average = totalTasks / data.length

    // Calculate where the "Average Line" should sit (percentage from bottom)
    const averagePct = (average / max) * 100

    return (
        <div className="w-full bg-white dark:bg-[#262626] border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm">

            {/* HEADER */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">
                        {range === 'month' ? 'Monthly Momentum' : 'Daily Velocity'}
                    </h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-serif font-bold text-stone-800 dark:text-stone-100">
                            {average.toFixed(1)}
                        </span>
                        <span className="text-[10px] text-stone-500 font-medium">avg tasks / day</span>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex gap-4 text-[10px] text-stone-400">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-stone-800 dark:bg-stone-400"></div>
                        <span>Volume</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-px bg-orange-500/50"></div>
                        <span>Baseline</span>
                    </div>
                </div>
            </div>

            {/* CHART CONTAINER */}
            <div className="relative h-48 w-full select-none">

                {/* BACKGROUND GUIDES (Optional aesthetic touch) */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    <div className="w-full h-px bg-stone-100 dark:bg-stone-800/50 border-t border-dashed border-stone-200 dark:border-stone-800"></div>
                    <div className="w-full h-px bg-stone-100 dark:bg-stone-800/50 border-t border-dashed border-stone-200 dark:border-stone-800"></div>
                    <div className="w-full h-px bg-stone-100 dark:bg-stone-800/50 border-t border-dashed border-stone-200 dark:border-stone-800"></div>
                    <div className="w-full h-px bg-stone-200 dark:bg-stone-700"></div> {/* Base */}
                </div>

                {/* ------------------------------------------- */}
                {/* THE AVERAGE LINE (The "Architect" Feature)  */}
                {/* ------------------------------------------- */}
                <div
                    className="absolute left-0 right-0 border-t border-orange-500/30 dark:border-orange-400/30 z-0 pointer-events-none flex items-end justify-end pr-2"
                    style={{ bottom: `${averagePct}%` }}
                >
                    <span className="text-[9px] text-orange-500/60 bg-white dark:bg-[#262626] px-1 -mb-2">avg</span>
                </div>

                {/* BARS CONTAINER */}
                <div className="absolute inset-0 flex items-end justify-between gap-1 z-10 pl-2">
                    {data.map((d, i) => {
                        const heightPct = (d.total / max) * 100
                        const isHovered = hoveredIndex === i

                        // For monthly view, only show bars, no text labels unless hovered
                        const showLabel = range === 'week' || i % 5 === 0 || i === data.length - 1

                        return (
                            <div
                                key={i}
                                className="flex-1 flex flex-col justify-end items-center group relative h-full"
                                onMouseEnter={() => setHoveredIndex(i)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >

                                {/* TOOLTIP (Floating Above) */}
                                <div className={`
                  absolute -top-8 transition-all duration-200 pointer-events-none
                  ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
                `}>
                                    <div className="bg-stone-900 text-white text-[10px] font-bold py-1 px-2 rounded shadow-xl whitespace-nowrap z-50">
                                        {d.total} Tasks <span className="font-normal opacity-60 ml-1">on {d.day}</span>
                                    </div>
                                    {/* Triangle */}
                                    <div className="w-2 h-2 bg-stone-900 rotate-45 mx-auto -mt-1"></div>
                                </div>

                                {/* THE BAR */}
                                <div
                                    className="w-full max-w-[40px] relative flex items-end rounded-t-sm overflow-hidden transition-all duration-300"
                                    style={{ height: `${Math.max(heightPct, 2)}%` }} // Min 2% visibility
                                >
                                    {/* Bar Fill */}
                                    <div className={`w-full h-full transition-colors duration-200 
                      ${isHovered
                                            ? 'bg-orange-500 dark:bg-orange-500'
                                            : 'bg-stone-800 dark:bg-stone-400 opacity-90'
                                        }
                   `}></div>

                                    {/* Reflection/Shine Effect (Subtle) */}
                                    <div className="absolute top-0 left-0 right-0 h-px bg-white/20"></div>
                                </div>

                                {/* BASELINE DOT (For 0 days) */}
                                {d.total === 0 && (
                                    <div className="w-1 h-1 rounded-full bg-stone-300 dark:bg-stone-700 mb-1 absolute bottom-0"></div>
                                )}

                                {/* X-AXIS LABELS */}
                                <div className="mt-2 h-4 flex items-start justify-center">
                                    <span className={`
                    text-[9px] font-mono transition-colors duration-200
                    ${isHovered ? 'text-stone-800 dark:text-stone-100 font-bold' : 'text-stone-400'}
                    ${!showLabel && !isHovered ? 'opacity-0' : 'opacity-100'}
                  `}>
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