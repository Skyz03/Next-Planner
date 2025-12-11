import { createClient } from '@/utils/supabase/server'
import { addTask, addGoal, toggleTask, deleteGoal, scheduleTask } from './actions'
import { getWeekDays, formatDate, isSameDay } from '@/utils/date'
import Link from 'next/link'
import TaskItem from '@/components/TaskItem'
import { ThemeToggle } from '@/components/ThemeToggle'
import EditableText from '@/components/EditableText'

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const supabase = createClient()
  const params = await searchParams

  const today = new Date()
  const selectedDateStr = params.date || formatDate(today)
  const normalizedDateStr = selectedDateStr.split('T')[0]
  const selectedDate = new Date(normalizedDateStr)

  // Office Week Logic (Mon-Sun)
  const weekDays = getWeekDays(selectedDate)
  const prevWeek = new Date(selectedDate); prevWeek.setDate(selectedDate.getDate() - 7);
  const nextWeek = new Date(selectedDate); nextWeek.setDate(selectedDate.getDate() + 7);

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // FETCH DATA
  const [scheduledTasks, weeklyHabits, goalsResponse] = await Promise.all([
    supabase.from('tasks').select('*, goals(title)').eq('user_id', user.id).eq('due_date', normalizedDateStr).order('is_completed', { ascending: true }).order('created_at', { ascending: false }),
    // Weekly habits: No Due Date, Not Completed
    supabase.from('tasks').select('*').eq('user_id', user.id).is('due_date', null).eq('is_completed', false).order('created_at', { ascending: false }),
    supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
  ])

  const tasks = scheduledTasks.data || []
  const weeklyList = weeklyHabits.data || []
  const goals = goalsResponse.data || []

  // --- THE CONNECTED LOGIC ---
  // We group weekly tasks by their Goal ID to visually connect "Vision" to "Steps"
  const tree = goals.map(goal => ({
    ...goal,
    // Find tasks that belong to this goal
    steps: weeklyList.filter(t => t.goal_id === goal.id)
  }))

  // Find tasks that have NO goal (Orphans)
  const orphanedTasks = weeklyList.filter(t => !t.goal_id)

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-300">

      {/* --- SIDEBAR: THE STRATEGY CENTER --- */}
      <aside className="w-96 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-20 shadow-xl transition-colors">

        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-slate-800 dark:text-slate-100 text-xs uppercase tracking-widest">Strategy & Goals</h2>
            <p className="text-[10px] text-slate-400 mt-0.5">Push tasks to the calendar →</p>
          </div>
          <ThemeToggle />
        </div>

        {/* THE GOAL TREE */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">

          {/* 1. RENDER GOALS & THEIR TASKS */}
          {tree.map(goal => (
            <div key={goal.id} className="relative pl-4 border-l-2 border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors">

              {/* Goal Title */}
              <div className="flex justify-between items-start mb-2 group">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex-1">
                  <EditableText 
                    id={goal.id} 
                    initialText={goal.title} 
                    type="goal" 
                  />
                </h3>
                <form action={deleteGoal} className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <input type="hidden" name="goalId" value={goal.id} />
                  <button className="text-slate-300 hover:text-red-500 px-1 text-xs">Del</button>
                </form>
              </div>

              {/* Weekly Steps for this Goal */}
              <div className="space-y-2">
                {goal.steps.length === 0 && (
                  <p className="text-[10px] text-slate-400 italic">No steps planned this week.</p>
                )}

                {goal.steps.map((task: any) => (
                  <div
                    key={task.id}
                    className="group flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-indigo-200 transition-all"
                  >
                    <div className="flex-1 truncate max-w-[160px]">
                      <EditableText 
                        id={task.id} 
                        initialText={task.title} 
                        type="task" 
                        className="text-xs font-medium text-slate-600 dark:text-slate-300"
                      />
                    </div>

                    {/* THE "PUSH TO DAILY" BUTTON */}
                    <form action={scheduleTask}>
                      <input type="hidden" name="taskId" value={task.id} />
                      <input type="hidden" name="date" value={normalizedDateStr} />
                      <button
                        title={`Schedule for ${selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}`}
                        className="text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 px-2 py-1 rounded hover:bg-indigo-600 hover:text-white transition-colors"
                      >
                        → {selectedDate.toLocaleDateString('en-US', { weekday: 'short' })}
                      </button>
                    </form>
                  </div>
                ))}
              </div>

              {/* Quick Add Step for this specific Goal */}
              <form action={addTask} className="mt-2">
                <input type="hidden" name="date_type" value="backlog" />
                <input type="hidden" name="goal_id" value={goal.id} />
                <input
                  name="title"
                  placeholder="+ Add step..."
                  className="w-full bg-transparent text-[11px] border-b border-transparent focus:border-slate-300 dark:focus:border-slate-700 outline-none text-slate-500 placeholder:text-slate-300"
                />
              </form>
            </div>
          ))}

          {/* 2. ORPHANED TASKS (No Goal) */}
          {orphanedTasks.length > 0 && (
            <div className="pl-4 border-l-2 border-slate-100 dark:border-slate-800/50 mt-8">
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">Misc / Unsorted</h3>
              <div className="space-y-2">
                {orphanedTasks.map(task => (
                  <div key={task.id} className="group flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-all">
                    <div className="flex-1 truncate max-w-[160px]">
                      <EditableText 
                        id={task.id} 
                        initialText={task.title} 
                        type="task" 
                        className="text-xs text-slate-500 dark:text-slate-400"
                      />
                    </div>
                    <form action={scheduleTask}>
                      <input type="hidden" name="taskId" value={task.id} />
                      <input type="hidden" name="date" value={normalizedDateStr} />
                      <button className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded hover:bg-indigo-500 hover:text-white transition-colors">
                        → {selectedDate.toLocaleDateString('en-US', { weekday: 'short' })}
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Goal Button */}
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <form action={addGoal}>
              <input name="title" placeholder="+ Create New High-Level Goal" className="w-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 placeholder:text-indigo-300 text-xs font-bold py-3 px-4 rounded-xl outline-none focus:ring-2 ring-indigo-500/50" />
            </form>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT: EXECUTION CENTER --- */}
      <main className="flex-1 flex flex-col relative bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl transition-colors">

        {/* Week Strip (Mon-Sun) */}
        <div className="h-28 border-b border-slate-200/60 dark:border-slate-800 flex flex-col bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
          <div className="flex items-center justify-between px-8 pt-3 pb-1">
            <div className="flex gap-2 items-center">
              <Link href={`/?date=${formatDate(prevWeek)}`} className="text-slate-400 hover:text-indigo-500 text-lg">←</Link>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Week of {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <Link href={`/?date=${formatDate(nextWeek)}`} className="text-slate-400 hover:text-indigo-500 text-lg">→</Link>
            </div>
          </div>

          <div className="flex-1 flex items-center px-4 gap-2">
            {weekDays.map((day, index) => {
              const dateStr = formatDate(day)
              const isActive = dateStr === normalizedDateStr
              const isToday = isSameDay(day, today)
              const isWeekend = index >= 5

              return (
                <div key={dateStr} className="flex-1 flex items-center gap-2">
                  {index === 5 && <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>}
                  <Link
                    href={`/?date=${dateStr}`}
                    scroll={false}
                    className={`flex-1 flex flex-col items-center justify-center h-14 rounded-xl transition-all duration-200 border cursor-pointer relative 
                      ${isActive
                        ? 'bg-indigo-600 border-indigo-500 shadow-md shadow-indigo-500/20 text-white'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300'
                      } ${isWeekend && !isActive ? 'opacity-70 bg-slate-50' : ''}
                    `}
                  >
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive ? 'text-indigo-100' : 'opacity-60'}`}>
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className="text-lg font-bold">{day.getDate()}</span>
                    {isToday && !isActive && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>}
                  </Link>
                </div>
              )
            })}
          </div>
        </div>

        {/* Daily Execution View */}
        <div className="flex-1 p-8 overflow-y-auto">
          <header className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
                {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="text-right">
              <span className="text-4xl font-black text-indigo-100 dark:text-slate-800">{tasks.filter(t => t.is_completed).length}/{tasks.length}</span>
            </div>
          </header>

          <div className="space-y-3 pb-10">
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl text-slate-300 dark:text-slate-600 bg-slate-50/50 dark:bg-slate-900/20">
                <p className="font-medium">Ready to work.</p>
                <p className="text-xs mt-2">Add a task below or click the "→" arrow on the sidebar.</p>
              </div>
            ) : (
              tasks.map(task => <TaskItem key={task.id} task={task} />)
            )}
          </div>

          {/* Floating Input at Bottom (Chat style) */}
          <div className="sticky bottom-0 pb-6 pt-4 bg-gradient-to-t from-white dark:from-slate-950 to-transparent">
            <form action={addTask} className="relative flex gap-2">
              <input type="hidden" name="specific_date" value={normalizedDateStr} />
              <div className="flex-1 relative group">
                <input
                  name="title"
                  placeholder="Add a new daily task..."
                  autoComplete="off"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 pl-5 shadow-xl shadow-slate-200/50 dark:shadow-none outline-none focus:ring-2 ring-indigo-500/20 dark:text-white transition-all placeholder:text-slate-300"
                />
              </div>
              <select
                name="goal_id"
                className="w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 shadow-xl outline-none focus:ring-2 ring-indigo-500/20 text-xs text-slate-600 dark:text-slate-300"
                defaultValue="none"
              >
                <option value="none">Quick Task</option>
                {goals.map(goal => <option key={goal.id} value={goal.id}>{goal.title}</option>)}
              </select>
            </form>
          </div>

        </div>
      </main>
    </div>
  )
}