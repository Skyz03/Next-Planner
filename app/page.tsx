import { createClient } from '@/utils/supabase/server'
import { addTask, addGoal, toggleTask, deleteGoal, scheduleTask } from './actions'
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
import TimeGrid from '@/components/TimeGrid'

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; view?: string }>
}) {
  const supabase = createClient()
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

  return (
    <PlannerBoard>
      <div className="flex h-screen bg-[#FAFAF9] dark:bg-[#1C1917] text-stone-800 dark:text-stone-200 font-sans overflow-hidden transition-colors duration-500 selection:bg-orange-200 dark:selection:bg-orange-900">

      {/* --- SIDEBAR --- */}
      <DroppableDay dateStr={null} className="w-80 bg-[#F5F5F4] dark:bg-[#292524] border-r border-stone-200 dark:border-stone-800 flex flex-col z-20 transition-colors duration-500">
        {/* ... (Keep your existing sidebar code exactly the same) ... */}
        <div className="p-8 pb-4 flex justify-between items-center">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-50 tracking-tight">Rituals</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-medium">Design your week.</p>
          </div>
          <ThemeToggle />

        </div>

        {/* Simplified Goal Tree for brevity in this snippet */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8 custom-scrollbar">
          {tree.map(goal => (
            <div key={goal.id} className="relative group/goal">
              <div className="absolute left-[11px] top-6 bottom-0 w-px bg-stone-300 dark:bg-stone-700"></div>
              <div className="flex items-center gap-3 mb-3 relative">
                <div className="w-6 h-6 rounded-full bg-white dark:bg-stone-800 border-2 border-orange-300 dark:border-orange-700/50 flex items-center justify-center shadow-sm z-10">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                </div>
                <h3 className="font-bold text-sm text-stone-800 dark:text-stone-100 flex-1">
                  <EditableText id={goal.id} initialText={goal.title} type="goal" className="hover:text-orange-600 transition-colors" />
                </h3>
                {/* ACTIONS GROUP */}
                <div className="flex items-center gap-1 opacity-0 group-hover/goal:opacity-100 transition-opacity">
                  {/* AI Generate Button */}
                  <AIGenerateButton goalId={goal.id} goalTitle={goal.title} />
                  {/* Delete Button */}
                  <form action={deleteGoal}>
                    <input type="hidden" name="goalId" value={goal.id} />
                    <button className="text-stone-300 hover:text-red-400 px-1 text-xs">×</button>
                  </form>
                </div>
              </div>
              <div className="pl-8 space-y-2 relative">
                {goal.steps.length === 0 && <p className="text-[10px] text-stone-400 italic mb-2">Add a step...</p>}
                {goal.steps.map((task: any) => (
                  <DraggableTask key={task.id} task={task}>
                    <div className="group flex items-center justify-between p-2 bg-white dark:bg-stone-800/50 rounded-lg border border-stone-200 dark:border-stone-700/50 hover:shadow-md hover:border-orange-200 dark:hover:border-orange-900 transition-all duration-200 cursor-grab">
                      <div className="flex-1 truncate max-w-[140px]">
                        <EditableText id={task.id} initialText={task.title} type="task" className="text-xs font-medium text-stone-600 dark:text-stone-300" />
                      </div>
                    </div>
                  </DraggableTask>
                ))}
                <form action={addTask} className="mt-2">
                  <input type="hidden" name="date_type" value="backlog" />
                  <input type="hidden" name="goal_id" value={goal.id} />
                  <input name="title" placeholder="+ step" className="w-full bg-transparent text-xs border-b border-transparent focus:border-stone-300 dark:focus:border-stone-600 outline-none text-stone-500 placeholder:text-stone-300 pb-1" />
                </form>
              </div>
            </div>
          ))}
          <div className="pt-4 mt-6 border-t border-stone-200 dark:border-stone-700/50">
            <form action={addGoal}>
              <input name="title" placeholder="Define a new vision..." className="w-full bg-transparent text-sm font-serif italic text-stone-600 dark:text-stone-400 placeholder:text-stone-400 outline-none border-b border-stone-200 focus:border-orange-400 py-2 transition-all" />
            </form>
          </div>
        </div>
      </DroppableDay>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        
        {/* HEADER WITH VIEW TOGGLE */}
        <div className="h-16 px-8 flex items-center justify-between border-b border-stone-200 dark:border-stone-800 bg-[#FAFAF9] dark:bg-[#1C1917]">
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
          // --- PLAN MODE ---
          <PlanningGrid weekDays={weekDays} allTasks={allWeekTasks} />
        ) : (
          // --- FOCUS MODE (Revamped) ---
          <div className="flex flex-col h-full overflow-hidden relative">
            {/* 1. STICKY WEEK STRIP (The Drop Targets) */}
            {/* z-30 ensures it stays ON TOP when dragging time blocks under it */}
            <div className="h-32 flex-none flex flex-col px-8 py-4 bg-[#FAFAF9]/90 dark:bg-[#1C1917]/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 z-30 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  Move tasks to another day
                </h2>
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
                        
                        {/* Mini Capacity Dot */}
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

            {/* 2. THE TIME GRID (Scrollable Area) */}
            <div className="flex-1 overflow-hidden relative z-10">
              <TimeGrid tasks={allWeekTasks.filter(t => t.due_date === normalizedDateStr)} />
            </div>
          </div>
        )}
      </main>
      </div>
    </PlannerBoard>
  )
}