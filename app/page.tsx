export const dynamic = 'force-dynamic'

import { createClient } from '@/utils/supabase/server'
import { addTask, addGoal, toggleTask, deleteGoal, scheduleTask, signOut, getWeeklyReviewData } from './actions'
import { getWeekDays, formatDate, isSameDay } from '@/utils/date'
import Link from 'next/link'
import TaskItem from '@/components/TaskItem'
import PlannerBoard from '@/components/PlannerBoard'
import DraggableTask from '@/components/DraggableTask'
import DroppableDay from '@/components/DroppableDay'
import PlanningGrid from '@/components/PlanningGrid'
import { ThemeToggle } from '@/components/ThemeToggle'
import EditableText from '@/components/EditableText'
import AIGenerateButton from '@/components/AIGenerateButton'
import DashboardShell from '@/components/DashboardShell'
import TimeGrid from '@/components/TimeGrid'
import ReviewTrigger from '@/components/ReviewTrigger'

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; view?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const viewMode = params.view || 'focus' // 'focus' | 'plan'

  const today = new Date()
  const selectedDateStr = params.date || formatDate(today)
  const normalizedDateStr = selectedDateStr.split('T')[0]
  const selectedDate = new Date(normalizedDateStr)

  // 1. Calculate Week Range (Mon - Sun)
  const weekDays = getWeekDays(selectedDate)
  const startOfWeek = formatDate(weekDays[0])
  const endOfWeek = formatDate(weekDays[6])

  const nextMondayStr = formatDate(new Date(weekDays[1])) // Pass this for task migration
  const reviewData = await getWeeklyReviewData(startOfWeek, endOfWeek)

  const prevWeek = new Date(selectedDate); prevWeek.setDate(selectedDate.getDate() - 7);
  const nextWeek = new Date(selectedDate); nextWeek.setDate(selectedDate.getDate() + 7);

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // 2. FETCH DATA (Optimized: Fetch entire week at once)
  const [weekTasksResponse, weeklyHabits, goalsResponse] = await Promise.all([
    supabase.from('tasks')
      .select('*, goals(title)')
      .eq('user_id', user.id)
      .gte('due_date', startOfWeek) // >= Monday
      .lte('due_date', endOfWeek)   // <= Sunday
      .order('is_completed', { ascending: true })
      .order('created_at', { ascending: false }),

    supabase.from('tasks').select('*').eq('user_id', user.id).is('due_date', null).eq('is_completed', false).order('created_at', { ascending: false }),
    supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
  ])

  // All tasks for this week (we filter these later)
  const allWeekTasks = weekTasksResponse.data || []

  // Filter for the MAIN VIEW (Selected Date Only)
  const tasks = allWeekTasks.filter(t => t.due_date === normalizedDateStr)

  const weeklyList = weeklyHabits.data || []
  const goals = goalsResponse.data || []

  const tree = goals.map(goal => ({
    ...goal,
    steps: weeklyList.filter(t => t.goal_id === goal.id)
  }))
  const orphanedTasks = weeklyList.filter(t => !t.goal_id)

  const sidebarContent = (
    <DroppableDay
      dateStr={null}
      className="h-full w-full bg-[#F5F5F4] dark:bg-[#18181b] border-r border-stone-200 dark:border-stone-800 flex flex-col transition-colors duration-500 font-sans"
    >

      {/* HEADER: Clean & Balanced */}
      <div className="flex flex-col px-6 pt-8 pb-4 pl-16"> {/* Maintained pl-16 for toggle button */}
        <div className="flex justify-between items-start mb-1">
          <div>
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-50 tracking-tight">Rituals</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">Design your week.</p>
          </div>

          {/* Controls Group */}
          <div className="flex items-center gap-2 bg-stone-200/50 dark:bg-stone-800/50 p-1 rounded-full">
            <ThemeToggle />
            <div className="w-px h-4 bg-stone-300 dark:bg-stone-700"></div>
            <form action={signOut}>
              <button
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors rounded-full hover:bg-white dark:hover:bg-stone-700"
                title="Sign Out"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* SCROLLABLE LIST */}
      <div className="flex-1 overflow-y-auto px-6 py-2 space-y-8 custom-scrollbar">

        {tree.map(goal => (
          <div key={goal.id} className="relative group/goal">

            {/* Connector Line (Subtler) */}
            <div className="absolute left-[11px] top-7 bottom-2 w-px bg-stone-200 dark:bg-stone-800"></div>

            {/* GOAL TITLE ROW */}
            <div className="flex items-start gap-3 mb-3 relative group/title">
              {/* Icon */}
              <div className="relative z-10 mt-0.5">
                <div className="w-6 h-6 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-sm flex items-center justify-center group-hover/goal:border-orange-300 dark:group-hover/goal:border-orange-900 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                </div>
              </div>

              {/* Text & Actions */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-sm text-stone-800 dark:text-stone-200 truncate pr-2">
                    <EditableText id={goal.id} initialText={goal.title} type="goal" className="hover:text-orange-600 transition-colors" />
                  </h3>

                  {/* Floating Actions (Visible on Hover) */}
                  <div className="flex items-center gap-1 opacity-0 group-hover/title:opacity-100 transition-all transform translate-x-2 group-hover/title:translate-x-0">
                    <AIGenerateButton goalId={goal.id} goalTitle={goal.title} />
                    <form action={deleteGoal}>
                      <input type="hidden" name="goalId" value={goal.id} />
                      <button className="text-stone-300 hover:text-red-400 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete Goal">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            {/* TASKS LIST */}
            <div className="pl-9 space-y-2.5 relative">
              {goal.steps.length === 0 && (
                <div className="flex items-center gap-2 py-1 opacity-40">
                  <div className="w-1 h-1 bg-stone-300 rounded-full"></div>
                  <p className="text-[10px] text-stone-500 italic">No active rituals</p>
                </div>
              )}

              {goal.steps.map((task: any) => (
                <DraggableTask key={task.id} task={task}>
                  <div className="group flex items-center justify-between px-3 py-2.5 bg-white dark:bg-[#222] rounded-lg border border-stone-100 dark:border-stone-800 shadow-sm hover:shadow-md hover:border-orange-200 dark:hover:border-orange-900 hover:-translate-y-0.5 transition-all duration-200 cursor-grab active:cursor-grabbing">
                    <div className="flex-1 min-w-0">
                      <EditableText id={task.id} initialText={task.title} type="task" className="text-xs font-medium text-stone-600 dark:text-stone-300 block truncate" />
                    </div>

                    {/* Drag Handle Icon (Subtle hint) */}
                    <div className="opacity-0 group-hover:opacity-30 text-stone-400 pl-2">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="2" /><circle cx="9" cy="12" r="2" /><circle cx="9" cy="19" r="2" /><circle cx="15" cy="5" r="2" /><circle cx="15" cy="12" r="2" /><circle cx="15" cy="19" r="2" /></svg>
                    </div>
                  </div>
                </DraggableTask>
              ))}

              {/* Add Task Input */}
              <form action={addTask} className="mt-1 opacity-60 hover:opacity-100 transition-opacity">
                <input type="hidden" name="date_type" value="backlog" />
                <input type="hidden" name="goal_id" value={goal.id} />
                <div className="flex items-center gap-2 pl-1">
                  <span className="text-stone-300 text-sm">+</span>
                  <input
                    name="title"
                    placeholder="Add step..."
                    className="w-full bg-transparent text-xs py-1 border-b border-transparent focus:border-stone-300 dark:focus:border-stone-600 outline-none text-stone-600 dark:text-stone-400 placeholder:text-stone-300 transition-colors"
                  />
                </div>
              </form>
            </div>
          </div>
        ))}

        {/* Add Goal Section */}
        <div className="pt-8 pb-20">
          <form action={addGoal} className="group relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-orange-500 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </div>
            <input
              name="title"
              placeholder="New Strategic Goal..."
              className="w-full bg-stone-100 dark:bg-stone-800/50 text-sm font-medium text-stone-800 dark:text-stone-200 placeholder:text-stone-400 outline-none border border-transparent focus:border-orange-300 dark:focus:border-orange-800/50 rounded-xl py-3 pl-10 pr-4 transition-all shadow-sm focus:shadow-md focus:bg-white dark:focus:bg-stone-800"
            />
          </form>
        </div>
      </div>

      {/* Footer Gradient Fade (Optional aesthetic touch) */}
      <div className="h-6 bg-gradient-to-t from-[#F5F5F4] dark:from-[#292524] to-transparent pointer-events-none -mt-6 z-10 relative"></div>
    </DroppableDay>
  )

  return (
    <PlannerBoard>
      <DashboardShell sidebar={sidebarContent} viewMode={viewMode}>

        {/* HEADER WITH VIEW TOGGLE */}
        <div className="h-16 px-8 flex items-center justify-between border-b border-stone-200 dark:border-stone-800 bg-[#FAFAF9] dark:bg-[#1C1917] pl-16">
          {/* pl-16 pushes title right to make room for toggle button in focus mode */}
          <h1 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
            {viewMode === 'plan' ? 'Weekly Strategy' : 'Daily Focus'}
          </h1>
          <div className="flex bg-stone-200 dark:bg-stone-800 p-1 rounded-lg">
            <Link
              href={`/?date=${normalizedDateStr}&view=focus`}
              className={`px-4 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'focus' ? 'bg-white dark:bg-stone-600 shadow-sm text-stone-800 dark:text-stone-100' : 'text-stone-500 dark:text-stone-400'}`}
            >
              Focus
            </Link>
            <Link
              href={`/?date=${normalizedDateStr}&view=plan`}
              className={`px-4 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'plan' ? 'bg-white dark:bg-stone-600 shadow-sm text-stone-800 dark:text-stone-100' : 'text-stone-500 dark:text-stone-400'}`}
            >
              Plan
            </Link>
          </div>
        </div>

        {/* CONDITIONAL VIEW */}
        {viewMode === 'plan' ? (
          <PlanningGrid weekDays={weekDays} allTasks={allWeekTasks} />
        ) : (
          // --- FOCUS MODE (With Sticky Header) ---
          <div className="flex flex-col h-full overflow-hidden relative">

            {/* 1. STICKY WEEK STRIP */}
            <div className="h-32 flex-none flex flex-col px-8 py-4 bg-[#FAFAF9]/90 dark:bg-[#1C1917]/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 z-30 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  Move tasks to another day
                </h2>
                <div className="flex gap-2">
                  <Link href={`/?date=${formatDate(prevWeek)}`} className="text-stone-400 hover:text-stone-600">←</Link>
                  <Link href={`/?date=${formatDate(nextWeek)}`} className="text-stone-400 hover:text-stone-600">→</Link>
                </div>
              </div>
              <div className="flex-1 flex items-start gap-2">
                {weekDays.map((day) => {
                  const dateStr = formatDate(day)
                  const isActive = dateStr === normalizedDateStr
                  const dayLoad = allWeekTasks.filter(t => t.due_date === dateStr).length

                  return (
                    <DroppableDay key={dateStr} dateStr={dateStr} className="flex-1 h-full">
                      <Link
                        href={`/?date=${dateStr}&view=focus`}
                        scroll={false}
                        className={`block h-full rounded-xl flex flex-col items-center justify-center gap-1 border-2 transition-all 
                        ${isActive
                            ? 'bg-stone-800 dark:bg-stone-200 border-stone-800 text-white dark:text-stone-900'
                            : 'bg-white dark:bg-stone-800 border-transparent hover:border-orange-300 text-stone-500'
                          }
                      `}
                      >
                        <span className="text-[10px] font-bold uppercase">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span className="text-lg font-serif font-bold leading-none">{day.getDate()}</span>
                        <div className="flex gap-0.5 mt-1">
                          {Array.from({ length: Math.min(dayLoad, 4) }).map((_, i) => (
                            <div key={i} className={`w-1 h-1 rounded-full ${isActive ? 'bg-white/50' : 'bg-orange-400'}`}></div>
                          ))}
                        </div>
                      </Link>
                    </DroppableDay>
                  )
                })}
              </div>
            </div>

            {/* 2. THE TIME GRID */}
            <div className="flex-1 overflow-hidden relative z-10">
              <TimeGrid tasks={allWeekTasks.filter(t => t.due_date === normalizedDateStr)} />
            </div>
          </div>
        )}
        <ReviewTrigger data={reviewData} weekStart={startOfWeek} nextMonday={nextMondayStr} />

      </DashboardShell>
    </PlannerBoard>
  )
}