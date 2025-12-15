'use client'

import { useState, useEffect } from 'react'
import { generateWeeklyInsight } from '@/actions/ai' // Import the new action

export default function AIWeeklyInsight({ data }: { data: any }) {
    const [insight, setInsight] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let isMounted = true

        async function fetchInsight() {
            if (!data) return

            // Artificial delay for "Thinking" effect (optional, feels more premium)
            // await new Promise(r => setTimeout(r, 800)) 

            const result = await generateWeeklyInsight(data)
            if (isMounted) {
                setInsight(result)
                setLoading(false)
            }
        }

        fetchInsight()
        return () => { isMounted = false }
    }, [data])

    if (loading) {
        return (
            <div className="h-full min-h-[200px] flex flex-col items-center justify-center p-8 bg-white dark:bg-[#262626] border border-stone-200 dark:border-stone-800 rounded-[2rem] shadow-sm animate-pulse">
                <div className="flex items-center gap-3 text-stone-400">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-200"></div>
                </div>
                <p className="text-xs font-mono uppercase tracking-widest mt-4 text-stone-500">Chief of Staff is thinking...</p>
            </div>
        )
    }

    if (!insight) return null

    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-stone-900 to-stone-800 dark:from-[#1e1b4b] dark:to-[#0f172a] text-stone-100 rounded-[2rem] p-8 shadow-xl border border-stone-800">

            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-40 bg-orange-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* COL 1: Executive Summary */}
                <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-white/10 rounded-lg">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        </div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">Executive Summary</h3>
                    </div>
                    <p className="text-xl md:text-2xl font-serif leading-relaxed text-white/90">
                        {insight.executive_summary}
                    </p>

                    {/* Psych Analysis (Smaller) */}
                    <div className="mt-6 pt-6 border-t border-white/10">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-2">Behavioral Analysis</h4>
                        <p className="text-sm text-stone-300 leading-relaxed max-w-xl">
                            {insight.psych_analysis}
                        </p>
                    </div>
                </div>

                {/* COL 2: The Protocol (Action Items) */}
                <div className="bg-black/20 rounded-2xl p-6 border border-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-400"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">Next Week's Protocol</h3>
                    </div>

                    <ul className="space-y-3">
                        {insight.tactical_protocol.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-stone-200">
                                <span className="flex-none mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-6 pt-4 border-t border-white/10 text-center">
                        <button className="text-[10px] uppercase font-bold tracking-widest text-stone-500 hover:text-white transition-colors">
                            View Monthly Trend →
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}