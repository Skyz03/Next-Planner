import { getProductivityReport } from '@/utils/analytics'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Suspense } from 'react'
import AIReportCard from '@/components/features/reflection/AIReportCard'
import VelocityChart from '@/components/features/reflection/VelocityChart'

export default async function ReflectionPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const params = await searchParams
  const range = (params.range === 'month' ? 'month' : 'week')

  // ✅ 1. Fetch Dynamic Data (Week or Month)
  const data = await getProductivityReport(range)

  if (!data) return null // Or skeleton

  const { score, total, completed, activityByDay, goalBreakdown, biggestWin, focusHours, peakTime, planningAccuracy } = data

  const isElite = score >= 80
  const isGood = score >= 50
  const scoreColor = isElite ? 'text-emerald-500' : isGood ? 'text-stone-700 dark:text-stone-200' : 'text-orange-500'

  return (
    <div className="min-h-screen bg-[#FAFAF9] dark:bg-[#1C1917] text-stone-800 dark:text-stone-200 font-sans p-6 md:p-8">

      {/* HEADER & CONTROLS */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-stone-900 dark:text-stone-50">Reflection</h1>
          <p className="text-stone-500 text-sm mt-1">Performance analytics & strategic review.</p>
        </div>

        <div className="flex items-center gap-4">
          {/* 🟢 TAB SWITCHER */}
          <div className="bg-stone-200 dark:bg-stone-800 p-1 rounded-lg flex text-xs font-bold">
            <Link
              href="/reflection?range=week"
              className={`px-4 py-1.5 rounded-md transition-all ${range === 'week' ? 'bg-white dark:bg-stone-600 shadow-sm text-stone-900 dark:text-white' : 'text-stone-500 hover:text-stone-700'}`}
            >
              Weekly
            </Link>
            <Link
              href="/reflection?range=month"
              className={`px-4 py-1.5 rounded-md transition-all ${range === 'month' ? 'bg-white dark:bg-stone-600 shadow-sm text-stone-900 dark:text-white' : 'text-stone-500 hover:text-stone-700'}`}
            >
              Monthly
            </Link>
          </div>

          <div className="h-6 w-px bg-stone-300 dark:bg-stone-800"></div>
          <ThemeToggle />
          <Link href="/" className="text-xs font-bold bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-1.5 rounded-lg hover:border-orange-500 transition-colors">
            Close
          </Link>
        </div>
      </header>

      {/* BENTO GRID LAYOUT */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">

        {/* 1. AI BRIEFING (Spans 4 cols, dominant but concise) */}
        <div className="md:col-span-4 lg:col-span-4 row-span-2">
          <AIReportCard data={data} />
        </div>

        {/* 2. THE SCORE (Square) */}
        <div className="md:col-span-2 lg:col-span-2 bg-white dark:bg-[#262626] border border-stone-200 dark:border-stone-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">Score</h3>
            <div className={`text-6xl font-serif font-black mt-2 tracking-tighter ${scoreColor}`}>{score}</div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-stone-500">
              <span>Efficiency</span>
              <span>{Math.round((completed / total) * 100)}%</span>
            </div>
            <div className="h-1.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
              <div className="h-full bg-stone-800 dark:bg-stone-400 rounded-full" style={{ width: `${score}%` }}></div>
            </div>
          </div>
        </div>

        {/* 3. FOCUS METRICS (Split Column) */}
        <div className="md:col-span-2 lg:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#262626] border border-stone-200 dark:border-stone-800 rounded-2xl p-5 flex flex-col justify-center items-center text-center">
            <div className="text-3xl font-serif font-bold text-stone-800 dark:text-stone-100">{focusHours}h</div>
            <div className="text-[10px] uppercase font-bold text-stone-400 mt-1">Deep Work</div>
          </div>
          <div className="bg-white dark:bg-[#262626] border border-stone-200 dark:border-stone-800 rounded-2xl p-5 flex flex-col justify-center items-center text-center">
            <div className="text-3xl font-serif font-bold text-stone-800 dark:text-stone-100">{completed}</div>
            <div className="text-[10px] uppercase font-bold text-stone-400 mt-1">Tasks Done</div>
          </div>

          {/* New Metrics: Peak Time & Accuracy */}
          <div className="bg-white dark:bg-[#262626] border border-stone-200 dark:border-stone-800 rounded-2xl p-5 flex flex-col justify-center items-center text-center">
            <div className="text-lg font-bold text-stone-700 dark:text-stone-300">{peakTime}</div>
            <div className="text-[10px] uppercase font-bold text-stone-400 mt-1">Peak Energy</div>
          </div>
          <div className="bg-white dark:bg-[#262626] border border-stone-200 dark:border-stone-800 rounded-2xl p-5 flex flex-col justify-center items-center text-center">
            <div className={`text-lg font-bold ${planningAccuracy === 'Calibrated' ? 'text-green-600' : 'text-orange-500'}`}>{planningAccuracy}</div>
            <div className="text-[10px] uppercase font-bold text-stone-400 mt-1">Calibration</div>
          </div>
        </div>

        {/* 4. VELOCITY CHART (Wide) */}
        <div className="md:col-span-4 lg:col-span-4 bg-white dark:bg-[#262626] border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm">
          <VelocityChart data={activityByDay} range={range} />
        </div>

        {/* 5. GOAL BREAKDOWN (Tall) */}
        <div className="md:col-span-2 lg:col-span-2 row-span-1 bg-white dark:bg-[#262626] border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">Focus Distribution</h3>
          <div className="space-y-4">
            {goalBreakdown.slice(0, 5).map(g => (
              <div key={g.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="truncate pr-2 font-medium">{g.name}</span>
                  <span className="text-stone-400">{g.completed}/{g.total}</span>
                </div>
                <div className="h-1.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(g.completed / g.total) * 100}%` }}></div>
                </div>
              </div>
            ))}
            {goalBreakdown.length === 0 && <div className="text-stone-400 text-xs italic">No goals tracked.</div>}
          </div>
        </div>

      </div>
    </div>
  )
}