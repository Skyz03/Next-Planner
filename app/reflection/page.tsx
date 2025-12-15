import { getProductivityReport } from '@/utils/analytics'
import { getExistingReflection } from '@/actions/reflections'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Suspense } from 'react'
import AIReportCard from '@/components/features/reflection/AIReportCard'
import VelocityChart from '@/components/features/reflection/VelocityChart'
import StaticAnalysis from '@/components/features/reflection/StaticAnalysis'
import ReflectionJournal from '@/components/features/reflection/ReflectionJournal'
import FlowSankey from '@/components/features/reflection/FlowSankey'

export default async function ReflectionPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const params = await searchParams
  const range = (params.range === 'month' ? 'month' : 'week')

  // ✅ 1. Fetch Dynamic Data (Week or Month)
  const data = await getProductivityReport(range)

  if (!data) return null // Or skeleton component

  // ✅ 2. Identify the "Key Date" for saving the journal
  // If Weekly: Returns Monday's date (e.g., 2023-10-23)
  // If Monthly: Returns 1st of Month (e.g., 2023-10-01)
  const dateStr = data.activityByDay[0]?.fullDate

  // ✅ 3. Fetch existing journal entry for this specific date
  const userReflection = await getExistingReflection(dateStr)

  const { score, total, completed, activityByDay, goalBreakdown, focusHours, peakTime, planningAccuracy } = data
  const isElite = score >= 80
  const isGood = score >= 50
  const scoreColor = isElite ? 'text-emerald-500' : isGood ? 'text-stone-700 dark:text-stone-200' : 'text-orange-500'

  return (
    <div className="min-h-screen bg-[#FAFAF9] dark:bg-[#1C1917] text-stone-800 dark:text-stone-200 font-sans p-6 md:p-8 transition-colors duration-500">

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

      {/* 🚀 THE COMMAND CENTER GRID */}
      {/* We use a 12-column grid to split Data (Left) and Journal (Right) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* ============================================== */}
        {/* LEFT COLUMN: DATA & STRATEGY (8 Columns)       */}
        {/* ============================================== */}
        <div className="md:col-span-8 space-y-6">

          {/* ROW 1: AI & STATIC INSIGHTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Suspense fallback={<div className="h-full min-h-[250px] bg-stone-100 dark:bg-stone-800/50 rounded-2xl animate-pulse" />}>
              <AIReportCard data={data} />
            </Suspense>
            <StaticAnalysis data={data} />
          </div>

          {/* ROW 2: VELOCITY & SANKEY */}
          <div className="md:col-span-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Velocity Chart */}
            <div className="h-full min-h-[320px]">
              <VelocityChart data={activityByDay} range={range} />
            </div>

            {/* Flow Sankey - No fixed height needed on wrapper, component handles it */}
            <div className="h-full">
              <FlowSankey data={data.flowData} />
            </div>
          </div>

          {/* ROW 3: DETAILED METRICS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* 1. Score */}
            <div className="bg-white dark:bg-[#262626] border border-stone-200 dark:border-stone-800 rounded-2xl p-4 text-center shadow-sm flex flex-col justify-center">
              <div className={`text-4xl font-black ${scoreColor}`}>{score}</div>
              <div className="text-[10px] uppercase font-bold text-stone-400 mt-1">Prod. Score</div>
            </div>

            {/* 2. Deep Work */}
            <div className="bg-white dark:bg-[#262626] border border-stone-200 dark:border-stone-800 rounded-2xl p-4 text-center shadow-sm flex flex-col justify-center">
              <div className="text-4xl font-bold text-stone-800 dark:text-stone-100">{focusHours}h</div>
              <div className="text-[10px] uppercase font-bold text-stone-400 mt-1">Deep Work</div>
            </div>

            {/* 3. Peak Energy */}
            <div className="bg-white dark:bg-[#262626] border border-stone-200 dark:border-stone-800 rounded-2xl p-4 text-center shadow-sm flex flex-col justify-center">
              <div className="text-xl font-bold text-stone-800 dark:text-stone-100">{peakTime}</div>
              <div className="text-[10px] uppercase font-bold text-stone-400 mt-2">Energy Peak</div>
            </div>

            {/* 4. Calibration */}
            <div className="bg-white dark:bg-[#262626] border border-stone-200 dark:border-stone-800 rounded-2xl p-4 text-center shadow-sm flex flex-col justify-center">
              <div className={`text-xl font-bold ${planningAccuracy === 'Calibrated' ? 'text-green-500' : 'text-orange-500'}`}>{planningAccuracy}</div>
              <div className="text-[10px] uppercase font-bold text-stone-400 mt-2">Calibration</div>
            </div>
          </div>

          {/* ROW 4: GOAL BREAKDOWN (Optional, kept from your previous code) */}
          <div className="bg-white dark:bg-[#262626] border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">Focus Distribution</h3>
            <div className="space-y-4">
              {goalBreakdown.slice(0, 4).map(g => (
                <div key={g.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="truncate pr-2 font-medium text-stone-700 dark:text-stone-300">{g.name}</span>
                    <span className="text-stone-400">{g.completed}/{g.total}</span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(g.completed / g.total) * 100}%` }}></div>
                  </div>
                </div>
              ))}
              {goalBreakdown.length === 0 && <div className="text-stone-400 text-xs italic">No strategic goals tracked this period.</div>}
            </div>
          </div>

        </div>

        {/* ============================================== */}
        {/* RIGHT COLUMN: INTERACTIVE JOURNAL (4 Columns)  */}
        {/* ============================================== */}
        <div className="md:col-span-4 h-full">
          <div className="sticky top-6 h-[calc(100vh-6rem)]">
            <ReflectionJournal
              dateStr={dateStr}
              initialData={userReflection}
              viewMode={range as 'week' | 'month'}
            />
          </div>
        </div>

      </div>
    </div>
  )
}