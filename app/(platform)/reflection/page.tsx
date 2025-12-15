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
  const range = params.range === 'month' ? 'month' : 'week'

  // ✅ 1. Fetch Dynamic Data (Week or Month)
  const data = await getProductivityReport(range)

  if (!data) return null // Or skeleton component

  // ✅ 2. Identify the "Key Date" for saving the journal
  // If Weekly: Returns Monday's date (e.g., 2023-10-23)
  // If Monthly: Returns 1st of Month (e.g., 2023-10-01)
  const dateStr = data.activityByDay[0]?.fullDate

  // ✅ 3. Fetch existing journal entry for this specific date
  const userReflection = await getExistingReflection(dateStr)

  const {
    score,
    total,
    completed,
    activityByDay,
    goalBreakdown,
    focusHours,
    peakTime,
    planningAccuracy,
  } = data
  const isElite = score >= 80
  const isGood = score >= 50
  const scoreColor = isElite
    ? 'text-emerald-500'
    : isGood
      ? 'text-stone-700 dark:text-stone-200'
      : 'text-orange-500'

  return (
    <div className="min-h-screen bg-[#FAFAF9] p-6 font-sans text-stone-800 transition-colors duration-500 md:p-8 dark:bg-[#1C1917] dark:text-stone-200">
      {/* HEADER & CONTROLS */}
      <header className="mx-auto mb-8 flex max-w-7xl flex-col items-end justify-between gap-4 md:flex-row">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
            Reflection
          </h1>
          <p className="mt-1 text-sm text-stone-500">Performance analytics & strategic review.</p>
        </div>

        <div className="flex items-center gap-4">
          {/* 🟢 TAB SWITCHER */}
          <div className="flex rounded-lg bg-stone-200 p-1 text-xs font-bold dark:bg-stone-800">
            <Link
              href="/reflection?range=week"
              className={`rounded-md px-4 py-1.5 transition-all ${range === 'week' ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-600 dark:text-white' : 'text-stone-500 hover:text-stone-700'}`}
            >
              Weekly
            </Link>
            <Link
              href="/reflection?range=month"
              className={`rounded-md px-4 py-1.5 transition-all ${range === 'month' ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-600 dark:text-white' : 'text-stone-500 hover:text-stone-700'}`}
            >
              Monthly
            </Link>
          </div>

          <div className="h-6 w-px bg-stone-300 dark:bg-stone-800"></div>
          <ThemeToggle />
          <Link
            href="/"
            className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold transition-colors hover:border-orange-500 dark:border-stone-700 dark:bg-stone-800"
          >
            Close
          </Link>
        </div>
      </header>

      {/* 🚀 THE COMMAND CENTER GRID */}
      {/* We use a 12-column grid to split Data (Left) and Journal (Right) */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-12">
        {/* ============================================== */}
        {/* LEFT COLUMN: DATA & STRATEGY (8 Columns)       */}
        {/* ============================================== */}
        <div className="space-y-6 md:col-span-8">
          {/* ROW 1: AI & STATIC INSIGHTS */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Suspense
              fallback={
                <div className="h-full min-h-[250px] animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-800/50" />
              }
            >
              <AIReportCard data={data} />
            </Suspense>
            <StaticAnalysis data={data} />
          </div>

          {/* ROW 2: VELOCITY & SANKEY */}
          <div className="grid grid-cols-1 gap-6 md:col-span-8 lg:grid-cols-2">
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Score */}
            <div className="flex flex-col justify-center rounded-2xl border border-stone-200 bg-white p-4 text-center shadow-sm dark:border-stone-800 dark:bg-[#262626]">
              <div className={`text-4xl font-black ${scoreColor}`}>{score}</div>
              <div className="mt-1 text-[10px] font-bold text-stone-400 uppercase">Prod. Score</div>
            </div>

            {/* 2. Deep Work */}
            <div className="flex flex-col justify-center rounded-2xl border border-stone-200 bg-white p-4 text-center shadow-sm dark:border-stone-800 dark:bg-[#262626]">
              <div className="text-4xl font-bold text-stone-800 dark:text-stone-100">
                {focusHours}h
              </div>
              <div className="mt-1 text-[10px] font-bold text-stone-400 uppercase">Deep Work</div>
            </div>

            {/* 3. Peak Energy */}
            <div className="flex flex-col justify-center rounded-2xl border border-stone-200 bg-white p-4 text-center shadow-sm dark:border-stone-800 dark:bg-[#262626]">
              <div className="text-xl font-bold text-stone-800 dark:text-stone-100">{peakTime}</div>
              <div className="mt-2 text-[10px] font-bold text-stone-400 uppercase">Energy Peak</div>
            </div>

            {/* 4. Calibration */}
            <div className="flex flex-col justify-center rounded-2xl border border-stone-200 bg-white p-4 text-center shadow-sm dark:border-stone-800 dark:bg-[#262626]">
              <div
                className={`text-xl font-bold ${planningAccuracy === 'Calibrated' ? 'text-green-500' : 'text-orange-500'}`}
              >
                {planningAccuracy}
              </div>
              <div className="mt-2 text-[10px] font-bold text-stone-400 uppercase">Calibration</div>
            </div>
          </div>

          {/* ROW 4: GOAL BREAKDOWN (Optional, kept from your previous code) */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-[#262626]">
            <h3 className="mb-4 text-xs font-bold tracking-widest text-stone-400 uppercase">
              Focus Distribution
            </h3>
            <div className="space-y-4">
              {goalBreakdown.slice(0, 4).map((g) => (
                <div key={g.name}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="truncate pr-2 font-medium text-stone-700 dark:text-stone-300">
                      {g.name}
                    </span>
                    <span className="text-stone-400">
                      {g.completed}/{g.total}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                    <div
                      className="h-full rounded-full bg-orange-500"
                      style={{ width: `${(g.completed / g.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {goalBreakdown.length === 0 && (
                <div className="text-xs text-stone-400 italic">
                  No strategic goals tracked this period.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ============================================== */}
        {/* RIGHT COLUMN: INTERACTIVE JOURNAL (4 Columns)  */}
        {/* ============================================== */}
        <div className="h-full md:col-span-4">
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
