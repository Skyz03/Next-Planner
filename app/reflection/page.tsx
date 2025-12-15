import { getWeeklyReport } from '@/utils/analytics'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Suspense } from 'react'
import AIWeeklyInsight from '@/components/features/reflection/AIWeeklyInsight'
import InsightSkeleton from '@/components/features/reflection/InsightSkeleton'
import { getWeekDays } from '@/utils/date'

export default async function ReflectionPage() {
  const data = await getWeeklyReport()

  if (!data) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAF9] dark:bg-[#1C1917] text-stone-400 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-stone-200 dark:border-stone-800 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
      <p className="text-xs font-mono uppercase tracking-widest opacity-60">Analyzing Week...</p>
    </div>
  )

  const { score, total, completed, activityByDay, goalBreakdown, biggestWin, focusHours } = data

  // Calculate Date Range
  const today = new Date()
  const weekDays = getWeekDays(today)
  const dateRange = `${weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`

  // Dynamic Styles
  const isElite = score >= 80
  const isGood = score >= 50

  const scoreColor = isElite ? 'text-emerald-600 dark:text-emerald-400' : isGood ? 'text-stone-800 dark:text-stone-100' : 'text-orange-500'
  const scoreMessage = isElite ? 'Elite Performance' : isGood ? 'Steady Progress' : 'Needs Focus'
  const progressBarColor = isElite ? 'bg-emerald-500' : isGood ? 'bg-stone-600 dark:bg-stone-400' : 'bg-orange-500'

  return (
    <div className="min-h-screen bg-[#FAFAF9] dark:bg-[#1C1917] text-stone-800 dark:text-stone-200 font-sans p-6 md:p-12 transition-colors duration-500">

      {/* HEADER */}
      <header className="max-w-6xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
            <span className="text-xs font-mono font-bold text-stone-400 uppercase tracking-widest">{dateRange}</span>
          </div>
          <h1 className="text-4xl font-serif font-bold tracking-tight text-stone-900 dark:text-stone-50">Weekly Intelligence</h1>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-[#262626] p-1.5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <ThemeToggle />
          <div className="w-px h-6 bg-stone-200 dark:bg-stone-700"></div>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
          >
            <span>Exit Report</span>
          </Link>
        </div>
      </header>

      {/* BENTO GRID */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* 1. AI INSIGHT (Top Full Width) */}
        <div className="md:col-span-4">
          <Suspense fallback={<InsightSkeleton />}>
            <AIWeeklyInsight data={data} />
          </Suspense>
        </div>

        {/* 2. THE SCORE (Large Square) */}
        <div className="md:col-span-2 bg-white dark:bg-[#262626] border border-stone-200 dark:border-stone-800 rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden shadow-sm hover:shadow-md transition-all">
          <div className={`absolute top-0 right-0 p-32 rounded-full blur-3xl -mr-16 -mt-16 opacity-30 pointer-events-none transition-colors duration-500 ${isElite ? 'bg-emerald-400/20' : 'bg-orange-400/10'}`}></div>
          <div>
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-400">Productivity Score</h3>
            <div className={`text-7xl font-serif font-black mt-3 tracking-tighter ${scoreColor}`}>{score}</div>
            <p className="text-stone-500 dark:text-stone-400 font-medium mt-2">{scoreMessage}</p>
          </div>
          <div className="mt-8 relative z-10">
            <div className="flex justify-between text-sm mb-3">
              <span className="text-stone-500 font-medium">Completion Rate</span>
              <span className="font-mono font-bold text-stone-700 dark:text-stone-300">{Math.round((completed / total) * 100)}%</span>
            </div>
            <div className="h-2.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-1000 ease-out ${progressBarColor}`} style={{ width: `${score}%` }}></div>
            </div>
          </div>
        </div>

        {/* 3. FOCUS HOURS (New Small Card) */}
        <div className="md:col-span-1 bg-white dark:bg-[#262626] border border-stone-200 dark:border-stone-800 rounded-[2rem] p-6 flex flex-col justify-center items-center text-center shadow-sm hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-3 text-orange-600 dark:text-orange-400">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">Focus Hours</h3>
          <div className="text-4xl font-serif font-bold text-stone-800 dark:text-stone-100 mt-1">{focusHours}h</div>
          <p className="text-xs text-stone-400 mt-1">Deep Work</p>
        </div>

        {/* 4. TOTAL TASKS (Small Card) */}
        <div className="md:col-span-1 bg-white dark:bg-[#262626] border border-stone-200 dark:border-stone-800 rounded-[2rem] p-6 flex flex-col justify-center items-center text-center shadow-sm hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mb-3 text-stone-600 dark:text-stone-400">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">Volume</h3>
          <div className="text-4xl font-serif font-bold text-stone-800 dark:text-stone-100 mt-1">{completed}</div>
          <p className="text-xs text-stone-400 mt-1">Tasks Done</p>
        </div>

        {/* 5. DAILY VELOCITY CHART (Wide) - UPDATED VISUALS */}
        <div className="md:col-span-2 bg-white dark:bg-[#262626] border border-stone-200 dark:border-stone-800 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">Daily Velocity</h3>
            <div className="text-[10px] bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded text-stone-500">Tasks / Day</div>
          </div>

          <div className="flex items-end justify-between h-40 gap-2 md:gap-4 px-2">
            {activityByDay.map((day, i) => {
              const max = Math.max(...activityByDay.map(d => d.total)) || 5 // Default max 5 so charts aren't huge for 1 task
              const heightPct = max === 0 ? 0 : Math.round((day.total / max) * 100)
              const isPeak = day.total === max && max > 0

              return (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-2 group cursor-default">

                  {/* The Value Label (Always visible if value > 0, else on hover) */}
                  <div className={`text-[10px] font-bold mb-1 transition-opacity ${day.total > 0 ? 'text-stone-600 dark:text-stone-300' : 'opacity-0 group-hover:opacity-100 text-stone-400'}`}>
                    {day.total}
                  </div>

                  {/* The Bar Container */}
                  <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-lg relative h-full flex items-end overflow-hidden">
                    {/* The Bar Fill */}
                    <div
                      className={`w-full rounded-lg transition-all duration-1000 ease-out delay-[${i * 50}ms]
                        ${isPeak ? 'bg-orange-500 dark:bg-orange-600' : 'bg-stone-800 dark:bg-stone-400'}
                      `}
                      // Ensure min-height of 4% so empty days aren't totally invisible, or 0 if truly 0
                      style={{ height: `${Math.max(heightPct, 4)}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold uppercase tracking-wide ${isPeak ? 'text-orange-600 dark:text-orange-400' : 'text-stone-400'}`}>
                    {day.day}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* 6. FOCUS DISTRIBUTION */}
        <div className="md:col-span-2 bg-white dark:bg-[#262626] border border-stone-200 dark:border-stone-800 rounded-[2rem] p-8 flex flex-col shadow-sm hover:shadow-md transition-all">
          <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-6">Focus Distribution</h3>
          <div className="flex-1 space-y-6">
            {goalBreakdown.length === 0 && <p className="text-stone-400 text-sm italic py-4 text-center">No strategic goals linked.</p>}

            {goalBreakdown.slice(0, 4).map((goal, i) => { // Limit to top 4
              const percentage = Math.round((goal.completed / goal.total) * 100) || 0
              return (
                <div key={goal.name} className="group/item">
                  <div className="flex justify-between text-sm mb-2.5">
                    <span className="font-medium truncate pr-4 text-stone-700 dark:text-stone-200">{goal.name}</span>
                    <span className="text-stone-400 text-xs font-mono bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded">{goal.completed}/{goal.total}</span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 delay-[${i * 100}ms] ${percentage === 100 ? 'bg-emerald-500' : 'bg-stone-800 dark:bg-stone-400'}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 7. BIGGEST WIN (Monolith) */}
        <div className="md:col-span-4 bg-stone-900 dark:bg-black rounded-[2rem] p-8 text-white relative overflow-hidden shadow-lg group">
          <div className="absolute inset-0 bg-gradient-to-br from-stone-800 to-black opacity-50"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-none bg-white/10 p-5 rounded-2xl backdrop-blur-sm border border-white/10 group-hover:border-orange-500/50 transition-colors duration-300">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-200 group-hover:text-orange-400 transition-colors">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-stone-400 text-xs font-bold uppercase tracking-widest">Biggest Win</h3>
              {biggestWin ? (
                <>
                  <p className="text-2xl md:text-3xl font-serif font-bold text-white leading-tight">{biggestWin.title}</p>
                  <p className="text-stone-400 text-sm opacity-80">Completed on {new Date(biggestWin.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </>
              ) : (
                <p className="text-xl font-bold opacity-60 italic">No major wins recorded yet.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}