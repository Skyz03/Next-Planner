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

    if (loading) return (
        <div className="h-full min-h-[180px] bg-stone-100 dark:bg-stone-800/50 rounded-2xl animate-pulse p-6">
            <div className="h-4 w-1/3 bg-stone-200 dark:bg-stone-700 rounded mb-4"></div>
            <div className="space-y-2">
                <div className="h-3 w-full bg-stone-200 dark:bg-stone-700 rounded"></div>
                <div className="h-3 w-5/6 bg-stone-200 dark:bg-stone-700 rounded"></div>
            </div>
        </div>
    )

    if (!insight) return null

    return (
        <div className="h-full bg-gradient-to-br from-stone-900 to-stone-800 dark:from-[#0f172a] dark:to-[#1e1b4b] rounded-2xl p-6 md:p-8 text-stone-100 shadow-xl relative overflow-hidden group">
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400">Chief of Staff</span>
                        <div className="h-px flex-1 bg-white/10"></div>
                    </div>
                    <h3 className="text-xl md:text-2xl font-serif leading-snug text-white/95 mb-4">
                        {insight.executive_summary}
                    </h3>
                    <div className="bg-black/20 rounded-lg p-3 border border-white/5 backdrop-blur-md">
                        <p className="text-xs text-stone-300 leading-relaxed">
                            <span className="text-stone-500 uppercase font-bold text-[9px] mr-2">Analysis</span>
                            {insight.psych_analysis}
                        </p>
                    </div>
                </div>

                <div className="mt-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2 block">Tactical Protocol</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {insight.tactical_protocol.map((item: string, i: number) => (
                            <div key={i} className="bg-white/5 border border-white/5 rounded px-3 py-2 text-xs text-stone-200 truncate" title={item}>
                                • {item}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}