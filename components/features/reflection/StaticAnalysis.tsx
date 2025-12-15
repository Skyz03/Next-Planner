import { ArrowUpRight, ArrowDownRight, Clock, Target } from 'lucide-react' // Or use your SVG icons

export default function StaticAnalysis({ data }: { data: any }) {
  const { completed, total, activityByDay, goalBreakdown, peakTime, planningAccuracy, focusHours } =
    data

  // 1. Calculate "Busiest Day"
  const busiestDay = [...activityByDay].sort((a, b) => b.total - a.total)[0]

  // 2. Calculate "Top Focus"
  const topGoal = goalBreakdown[0] || { name: 'General Admin', completed: 0, total: 1 }
  const focusPercent = Math.round((topGoal.completed / (completed || 1)) * 100)

  // 3. Efficiency Rate
  const efficiency = Math.round((completed / (total || 1)) * 100)

  return (
    <div className="h-full rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-[#262626]">
      <div className="mb-6 flex items-center gap-2">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-stone-400"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        <h3 className="text-xs font-bold tracking-widest text-stone-500 uppercase">
          Analysis Report
        </h3>
      </div>

      <div className="space-y-6">
        {/* Insight 1: Velocity */}
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-stone-100 p-2 text-stone-500 dark:bg-stone-800">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200">
              Peak Velocity on {busiestDay.day}
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-stone-500">
              You cleared{' '}
              <strong className="text-stone-700 dark:text-stone-300">
                {busiestDay.total} tasks
              </strong>{' '}
              on your best day.
              {busiestDay.total > 5 ? ' High throughput.' : ' Steady pace.'}
            </p>
          </div>
        </div>

        {/* Insight 2: Focus */}
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-stone-100 p-2 text-stone-500 dark:bg-stone-800">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200">
              {focusPercent}% Focus on "{topGoal.name}"
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-stone-500">
              Your primary effort went towards your top goal.
              {planningAccuracy === 'Calibrated'
                ? ' Your time estimation was accurate.'
                : ` You tend to ${planningAccuracy === 'Underestimator' ? 'underestimate' : 'overestimate'} task duration.`}
            </p>
          </div>
        </div>

        {/* Insight 3: Rhythm */}
        <div className="mt-2 rounded-xl border border-stone-100 bg-stone-50 p-4 dark:border-stone-800/50 dark:bg-stone-900/50">
          <p className="text-xs text-stone-500 italic">
            "Based on your timestamps, you are a{' '}
            <span className="font-bold text-stone-700 dark:text-stone-300">{peakTime}</span> worker
            with an overall efficiency of {efficiency}%."
          </p>
        </div>
      </div>
    </div>
  )
}
