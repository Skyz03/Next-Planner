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
                <form action={deleteGoal} className="opacity-0 group-hover/goal:opacity-100 transition-opacity">
                  <input type="hidden" name="goalId" value={goal.id} />
                  <button className="text-stone-400 hover:text-red-400 px-1 text-xs">×</button>
                </form>
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
          // --- FOCUS MODE ---
          <>
            {/* WEEK STRIP WITH CAPACITY BARS */}
            <div className="h-40 flex flex-col pt-6 px-8 bg-[#FAFAF9] dark:bg-[#1C1917]">

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
              {weekDays[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <Link href={`/?date=${formatDate(prevWeek)}`} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500 transition-colors">←</Link>
              <Link href={`/?date=${formatDate(nextWeek)}`} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500 transition-colors">→</Link>
            </div>
          </div>

          <div className="flex-1 flex items-start gap-3">
            {weekDays.map((day, index) => {
              const dateStr = formatDate(day)
              const isActive = dateStr === normalizedDateStr
              const isToday = isSameDay(day, today)

              // --- CAPACITY LOGIC ---
              // Filter allWeekTasks to count how many fall on THIS specific day
              const dayLoad = allWeekTasks.filter(t => t.due_date === dateStr).length

              // Determine Color & Height based on load
              let barColor = "bg-stone-200 dark:bg-stone-700" // Default (Empty)
              let loadLabel = "Free"

              if (dayLoad > 0 && dayLoad <= 2) {
                barColor = "bg-green-400" // Light
                loadLabel = "Light"
              } else if (dayLoad > 2 && dayLoad <= 5) {
                barColor = "bg-yellow-400" // Medium
                loadLabel = "Busy"
              } else if (dayLoad > 5) {
                barColor = "bg-orange-500" // Heavy
                loadLabel = "Full"
              }

              return (
                <DroppableDay key={dateStr} dateStr={dateStr} className="flex-1 h-20">
                  <Link
                    href={`/?date=${dateStr}&view=focus`}
                    scroll={false}
                    className={`block h-full rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 border-2 cursor-pointer relative overflow-hidden group
                      ${isActive
                        ? 'bg-stone-800 dark:bg-stone-200 border-stone-800 dark:border-stone-200 text-white dark:text-stone-900 shadow-lg scale-105 z-10'
                        : 'bg-white dark:bg-stone-800 border-transparent hover:border-stone-200 dark:hover:border-stone-700 text-stone-500'
                      }
                    `}
                  >
                  <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  <span className="text-xl font-serif font-bold leading-none">{day.getDate()}</span>

                  {/* --- THE CAPACITY BAR --- */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 flex justify-center pb-1">
                    {dayLoad === 0 ? (
                      // Tiny dot if empty (optional, mostly clean)
                      <div className="w-1 h-1 rounded-full bg-stone-200 dark:bg-stone-700"></div>
                    ) : (
                      // The Load Bar
                      <div className={`h-1 rounded-full transition-all duration-500 ${barColor} ${isActive ? 'opacity-90' : 'opacity-70'}`} style={{ width: `${Math.min(dayLoad * 10 + 20, 80)}%` }}></div>
                    )}
                  </div>

                  {/* Tooltip on Hover (Optional detail for the "Architect") */}
                  <div className="absolute -top-8 bg-stone-900 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {dayLoad} tasks
                  </div>
                  </Link>
                </DroppableDay>
              )
            })}
          </div>
        </div>

            {/* DAILY VIEW */}
            <div className="flex-1 px-8 md:px-12 lg:px-20 overflow-y-auto custom-scrollbar">
          <header className="mt-8 mb-10 pb-6 border-b border-stone-200 dark:border-stone-800 flex items-baseline justify-between">
            <div>
              <h1 className="text-5xl md:text-6xl font-serif font-medium text-stone-900 dark:text-stone-50 tracking-tight mb-2">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}.
              </h1>
              <p className="text-stone-500 dark:text-stone-400 text-lg font-light">
                Focus on what matters.
              </p>
            </div>
            <div className="text-right hidden md:block">
              <span className="text-6xl font-serif text-stone-200 dark:text-stone-800">{tasks.filter(t => t.is_completed).length}</span>
              <span className="text-xl text-stone-300 dark:text-stone-700 font-light">/{tasks.length}</span>
            </div>
          </header>

          <div className="space-y-4 pb-32">
            {tasks.length === 0 ? (
              <div className="py-20 text-center">
                <p className="font-serif text-2xl text-stone-300 dark:text-stone-700 italic">"The journey of a thousand miles begins with a single step."</p>
                <p className="text-stone-400 mt-4 text-sm">Add a task to begin.</p>
              </div>
            ) : (
              tasks.map(task => (
                <DraggableTask key={task.id} task={task}>
                  <TaskItem task={task} />
                </DraggableTask>
              ))
            )}

            <div className="group pt-4 opacity-70 hover:opacity-100 transition-opacity">
              <form action={addTask} className="flex items-center gap-4">
                <input type="hidden" name="specific_date" value={normalizedDateStr} />
                <div className="w-5 h-5 rounded-full border-2 border-dashed border-stone-300 dark:border-stone-600"></div>
                <div className="flex-1">
                  <input
                    name="title"
                    placeholder="Write a new task..."
                    autoComplete="off"
                    className="w-full bg-transparent text-xl font-medium text-stone-800 dark:text-stone-200 placeholder:text-stone-300 dark:placeholder:text-stone-600 outline-none"
                  />
                </div>
                {goals.length > 0 && (
                  <select name="goal_id" className="bg-transparent text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 outline-none cursor-pointer text-right" defaultValue="none">
                    <option value="none">No Goal</option>
                    {goals.map(goal => <option key={goal.id} value={goal.id}>{goal.title}</option>)}
                  </select>
                )}
              </form>
            </div>
          </div>
        </div>
          </>
        )}
      </main>
      </div>
    </PlannerBoard>
  )
}