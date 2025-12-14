import { getWeeklyReport } from '@/utils/analytics'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Suspense } from 'react'
import AIWeeklyInsight from '@/components/AIWeeklyInsight'
import InsightSkeleton from '@/components/InsightSkeleton'

export default async function ReflectionPage() {
  const data = await getWeeklyReport()

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9] dark:bg-[#1C1917] text-stone-400">
      <div className="flex flex-col items-center gap-2">
        <div className="w-6 h-6 border-2 border-stone-300 border-t-orange-500 rounded-full animate-spin"></div>
        <p className="text-xs font-mono uppercase">Gathering Intelligence...</p>
      </div>
    </div>
  )

  const { score, total, completed, activityByDay, goalBreakdown, biggestWin } = data

  // Dynamic Color for Score (Stone/Green/Orange Palette)
  const scoreColor = score >= 80 ? 'text-green-600 dark:text-green-400' : score >= 50 ? 'text-stone-800 dark:text-stone-100' : 'text-orange-500'
  const scoreMessage = score >= 80 ? 'Elite Performance' : score >= 50 ? 'Steady Progress' : 'Needs Focus'
  const scoreBarColor = score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-stone-600 dark:bg-stone-400' : 'bg-orange-500'

  return (
    <div className="min-h-screen bg-[#FAFAF9] dark:bg-[#1C1917] text-stone-800 dark:text-stone-200 font-sans p-4 md:p-8 transition-colors duration-500">

      {/* HEADER */}
      <header className="max-w-5xl mx-auto mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-stone-900 dark:text-stone-50">Weekly Intelligence</h1>
          <p className="text-stone-500 text-sm mt-1">Data-driven analysis & strategic review.</p>
        </div>
        <div className="flex gap-4 items-center">
          <ThemeToggle />
          <Link href="/" className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-4 py-2 rounded-xl text-xs font-bold hover:border-orange-500 transition-colors shadow-sm">
            Close Report
          </Link>
        </div>
      </header>

      {/* BENTO GRID LAYOUT */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* 1. AI CHIEF OF STAFF (Top Full Width) */}
        {/* Streaming: Shows Skeleton immediately, then AI content */}
        <Suspense fallback={<InsightSkeleton />}>
          <AIWeeklyInsight data={data} />
        </Suspense>

        {/* 2. THE SCORE (Square) */}
        <div className="bg-white dark:bg-[#221F1D] border border-stone-200 dark:border-stone-800 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden shadow-sm">
          {/* Background Ambient Blur */}
          <div className="absolute top-0 right-0 p-32 bg-stone-100 dark:bg-stone-800 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 pointer-events-none"></div>

          <div className="relative z-10">
            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">Productivity Score</h3>
            <div className={`text-6xl font-serif font-black mt-2 ${scoreColor}`}>
              {score}
            </div>
            <p className="text-stone-500 dark:text-stone-400 font-medium mt-1">{scoreMessage}</p>
          </div>

          <div className="mt-8 relative z-10">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-stone-500">Tasks Completed</span>
              <span className="font-bold font-mono">{completed} <span className="text-stone-400 font-normal">/ {total}</span></span>
            </div>
            {/* Progress Bar */}
            <div className="h-3 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-1000 ${scoreBarColor}`} style={{ width: `${score}%` }}></div>
            </div>
          </div>
        </div>

        {/* 3. FOCUS DISTRIBUTION (Tall Rectangle) */}
        <div className="md:col-span-1 md:row-span-2 bg-white dark:bg-[#221F1D] border border-stone-200 dark:border-stone-800 rounded-3xl p-8 flex flex-col shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-6">Focus Distribution</h3>

          <div className="flex-1 space-y-6">
            {goalBreakdown.length === 0 && <p className="text-stone-400 text-sm italic">No goals linked this week.</p>}
            {goalBreakdown.map((goal) => {
              const percentage = Math.round((goal.completed / goal.total) * 100) || 0
              return (
                <div key={goal.name}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium truncate pr-4 text-stone-700 dark:text-stone-300">{goal.name}</span>
                    <span className="text-stone-400 text-xs font-mono">{goal.completed}/{goal.total}</span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${percentage === 100 ? 'bg-green-500' : 'bg-orange-500'}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-8 p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-100 dark:border-stone-800">
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              <span className="font-bold text-orange-600 dark:text-orange-400">Insight:</span> You directed {Math.round((goalBreakdown[0]?.total || 0) / total * 100)}% of your energy toward <span className="text-stone-800 dark:text-stone-200 font-bold">"{goalBreakdown[0]?.name || 'Tasks'}"</span>.
            </p>
          </div>
        </div>

        {/* 4. DAILY VELOCITY (Wide Rectangle) */}
        <div className="md:col-span-2 bg-white dark:bg-[#221F1D] border border-stone-200 dark:border-stone-800 rounded-3xl p-8 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-6">Daily Velocity</h3>

          {/* CSS-Only Bar Chart */}
          <div className="flex items-end justify-between h-32 gap-3">
            {activityByDay.map((day) => {
              // Normalize height
              const max = Math.max(...activityByDay.map(d => d.total)) || 1
              const heightPct = Math.round((day.total / max) * 100)

              return (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-3 group">
                  <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-t-sm relative h-full flex items-end overflow-hidden">
                    {/* The Bar */}
                    <div
                      className="w-full bg-stone-800 dark:bg-stone-200 opacity-80 group-hover:bg-orange-500 transition-colors duration-300"
                      style={{ height: `${heightPct}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors">{day.day}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* 5. BIGGEST WIN (Monolith Card) */}
        <div className="md:col-span-2 bg-stone-900 dark:bg-stone-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg group">
          {/* Subtle Texture/Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-stone-800 to-black opacity-50"></div>

          <div className="relative z-10 flex items-start gap-5">
            <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-sm border border-white/10 group-hover:border-orange-500/50 transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-200 group-hover:text-orange-400 transition-colors">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
            </div>
            <div>
              <h3 className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-1.5">Biggest Win</h3>
              {biggestWin ? (
                <>
                  <p className="text-2xl font-serif font-bold text-white leading-tight">{biggestWin.title}</p>
                  <p className="text-stone-400 text-sm mt-2 opacity-80 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Completed on {new Date(biggestWin.created_at).toLocaleDateString(undefined, { weekday: 'long' })}
                  </p>
                </>
              ) : (
                <p className="text-xl font-bold opacity-50 italic">No major tasks completed yet.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}