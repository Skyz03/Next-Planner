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

  const weekDays = getWeekDays(selectedDate)
  const prevWeek = new Date(selectedDate); prevWeek.setDate(selectedDate.getDate() - 7);
  const nextWeek = new Date(selectedDate); nextWeek.setDate(selectedDate.getDate() + 7);

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [scheduledTasks, weeklyHabits, goalsResponse] = await Promise.all([
    supabase.from('tasks').select('*, goals(title)').eq('user_id', user.id).eq('due_date', normalizedDateStr).order('is_completed', { ascending: true }).order('created_at', { ascending: false }),
    supabase.from('tasks').select('*').eq('user_id', user.id).is('due_date', null).eq('is_completed', false).order('created_at', { ascending: false }),
    supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
  ])

  const tasks = scheduledTasks.data || []
  const weeklyList = weeklyHabits.data || []
  const goals = goalsResponse.data || []

  const tree = goals.map(goal => ({
    ...goal,
    steps: weeklyList.filter(t => t.goal_id === goal.id)
  }))
  const orphanedTasks = weeklyList.filter(t => !t.goal_id)

  return (
    // CONTAINER: Warm Stone colors instead of cold Grays
    <div className="flex h-screen bg-[#FAFAF9] dark:bg-[#1C1917] text-stone-800 dark:text-stone-200 font-sans overflow-hidden transition-colors duration-500 selection:bg-orange-200 dark:selection:bg-orange-900">

      {/* --- SIDEBAR: CLEAN JOURNAL STYLE --- */}
      <aside className="w-80 bg-[#F5F5F4] dark:bg-[#292524] border-r border-stone-200 dark:border-stone-800 flex flex-col z-20 transition-colors duration-500">

        {/* Header */}
        <div className="p-8 pb-4 flex justify-between items-center">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-50 tracking-tight">Rituals</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-medium">Design your week.</p>
          </div>
          <ThemeToggle />
        </div>

        {/* GOAL TREE */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8 custom-scrollbar">

          {tree.map(goal => (
            <div key={goal.id} className="relative group/goal">
              {/* Connector Line */}
              <div className="absolute left-[11px] top-6 bottom-0 w-px bg-stone-300 dark:bg-stone-700"></div>

              {/* Goal Title */}
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

              {/* Weekly Steps */}
              <div className="pl-8 space-y-2 relative">
                {goal.steps.length === 0 && (
                  <p className="text-[10px] text-stone-400 italic mb-2">Add a step...</p>
                )}

                {goal.steps.map((task: { id: string; title: string }) => (
                  <div
                    key={task.id}
                    className="group flex items-center justify-between p-2 bg-white dark:bg-stone-800/50 rounded-lg border border-stone-200 dark:border-stone-700/50 hover:shadow-md hover:border-orange-200 dark:hover:border-orange-900 transition-all duration-200"
                  >
                    <div className="flex-1 truncate max-w-[140px]">
                      <EditableText
                        id={task.id}
                        initialText={task.title}
                        type="task"
                        className="text-xs font-medium text-stone-600 dark:text-stone-300"
                      />
                    </div>
                    <form action={scheduleTask}>
                      <input type="hidden" name="taskId" value={task.id} />
                      <input type="hidden" name="date" value={normalizedDateStr} />
                      <button className="text-[10px] bg-stone-100 dark:bg-stone-700 text-stone-500 hover:bg-orange-500 hover:text-white px-2 py-0.5 rounded-md transition-colors">
                        Add
                      </button>
                    </form>
                  </div>
                ))}

                {/* Inline Add */}
                <form action={addTask} className="mt-2">
                  <input type="hidden" name="date_type" value="backlog" />
                  <input type="hidden" name="goal_id" value={goal.id} />
                  <input name="title" placeholder="+ step" className="w-full bg-transparent text-xs border-b border-transparent focus:border-stone-300 dark:focus:border-stone-600 outline-none text-stone-500 placeholder:text-stone-300 pb-1" />
                </form>
              </div>
            </div>
          ))}

          {/* Add Goal Button */}
          <div className="pt-4 mt-6 border-t border-stone-200 dark:border-stone-700/50">
            <form action={addGoal}>
              <input name="title" placeholder="Define a new vision..." className="w-full bg-transparent text-sm font-serif italic text-stone-600 dark:text-stone-400 placeholder:text-stone-400 outline-none border-b border-stone-200 focus:border-orange-400 py-2 transition-all" />
            </form>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT: THE CANVAS --- */}
      <main className="flex-1 flex flex-col relative z-10">

        {/* WEEK STRIP */}
        <div className="h-32 flex flex-col pt-6 px-8 bg-[#FAFAF9] dark:bg-[#1C1917]">
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

              return (
                <Link
                  key={dateStr}
                  href={`/?date=${dateStr}`}
                  scroll={false}
                  className={`flex-1 h-16 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 border-2 cursor-pointer
                    ${isActive
                      ? 'bg-stone-800 dark:bg-stone-200 border-stone-800 dark:border-stone-200 text-white dark:text-stone-900 shadow-lg scale-105'
                      : 'bg-white dark:bg-stone-800 border-transparent hover:border-stone-200 dark:hover:border-stone-700 text-stone-500'
                    }
                  `}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  <span className="text-lg font-serif font-bold">{day.getDate()}</span>
                  {isToday && !isActive && <div className="w-1 h-1 bg-orange-500 rounded-full mt-1"></div>}
                </Link>
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
              tasks.map(task => <TaskItem key={task.id} task={task} />)
            )}

            {/* Inline Add Task (Looks like writing on paper) */}
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
      </main>
    </div>
  )
}