import { createClient } from '@/utils/supabase/server'
import { signOut } from '@/actions/auth'
import { getWeeklyReviewData } from '@/actions/reflections'
import { addTask, toggleTask, scheduleTask, deleteTask } from '@/actions/task'
import { addGoal, deleteGoal } from '@/actions/goal'
import { getWeekDays, formatDate, isSameDay } from '@/utils/date'
import Link from 'next/link'
import TaskItem from '@/components/features/planning/TaskItem'
import PlannerBoard from '@/components/features/planning/PlannerBoard'
import DraggableTask from '@/components/features/planning/DraggableTask'
import DroppableDay from '@/components/features/planning/DroppableDay'
import PlanningGrid from '@/components/features/planning/PlanningGrid'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import EditableText from '@/components/ui/EditableText'
import AIGenerateButton from '@/components/features/planning/AIGenerateButton'
import DashboardShell from '@/components/layout/DashboardShell'
import TimeGrid from '@/components/features/planning/TimeGrid'
import ReviewTrigger from '@/components/features/reflection/ReviewTrigger'

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
  const startOfWeekDate = weekDays[0]
  const endOfWeekDate = weekDays[6]

  const startOfWeek = formatDate(startOfWeekDate)
  const endOfWeek = formatDate(endOfWeekDate)

  const nextMondayStr = formatDate(new Date(weekDays[1]))
  const reviewData = await getWeeklyReviewData(startOfWeek, endOfWeek)

  // Navigation Logic
  const prevWeek = new Date(selectedDate)
  prevWeek.setDate(selectedDate.getDate() - 7)
  const nextWeek = new Date(selectedDate)
  nextWeek.setDate(selectedDate.getDate() + 7)
  const todayStr = formatDate(today)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  // 2. FETCH DATA
  const [weekTasksResponse, weeklyHabitsResponse, goalsResponse, inboxResponse] = await Promise.all(
    [
      supabase
        .from('tasks')
        .select('*, goals(title)')
        .eq('user_id', user.id)
        .gte('due_date', startOfWeek)
        .lte('due_date', endOfWeek)
        .order('is_completed', { ascending: true })
        .order('created_at', { ascending: false }),

      supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .is('due_date', null)
        .eq('is_completed', false)
        .order('created_at', { ascending: false }),
      supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      // Inbox: Tasks with no date AND no goal (rapid capture items)
      supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .is('due_date', null)
        .is('goal_id', null)
        .eq('is_completed', false)
        .order('created_at', { ascending: false }),
    ],
  )

  const allWeekTasks = weekTasksResponse.data || []
  const weeklyList =
    weeklyHabitsResponse && 'data' in weeklyHabitsResponse ? (weeklyHabitsResponse.data ?? []) : []
  const goals = goalsResponse && 'data' in goalsResponse ? (goalsResponse.data ?? []) : []
  const inboxTasks = inboxResponse && 'data' in inboxResponse ? (inboxResponse.data ?? []) : []

  const tree = goals.map((goal: any) => ({
    ...goal,
    steps: weeklyList.filter((t: any) => t.goal_id === goal.id),
  }))

  // Format the Date Range Text (e.g., "Dec 14 - Dec 20, 2025")
  const dateRangeText = `${startOfWeekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

  const sidebarContent = (
    <DroppableDay
      dateStr={null}
      className="flex h-full w-full flex-col border-r border-stone-200 bg-[#F5F5F4] font-sans transition-colors duration-500 dark:border-stone-800 dark:bg-[#18181b]"
    >
      <div className="flex flex-col px-6 pt-8 pb-4 pl-16">
        <div className="mb-1 flex items-start justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
              Rituals
            </h2>
            <p className="text-xs font-medium text-stone-500 dark:text-stone-400">
              Design your week.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-stone-200/50 p-1 dark:bg-stone-800/50">
            <ThemeToggle />
            <div className="h-4 w-px bg-stone-300 dark:bg-stone-700"></div>
            <form action={signOut}>
              <button
                className="rounded-full p-1.5 text-stone-400 transition-colors hover:bg-white hover:text-stone-700 dark:hover:bg-stone-700 dark:hover:text-stone-200"
                title="Sign Out"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="custom-scrollbar flex-1 space-y-8 overflow-y-auto px-6 py-2">
        <div className="mt-4 mb-2 px-6">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-bold tracking-widest text-stone-400 uppercase">
              Inbox
            </span>
            <span className="rounded-full bg-stone-200 px-1.5 text-[10px] text-stone-500 dark:bg-stone-800">
              {inboxTasks.length}
            </span>
            <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800"></div>
          </div>

          <div className="space-y-2">
            {inboxTasks.length === 0 && (
              <div className="rounded-lg border border-dashed border-stone-200 py-4 text-center dark:border-stone-800">
                <p className="text-[10px] text-stone-400">Cmd+K to capture</p>
              </div>
            )}

            {inboxTasks.map((task) => (
              <DraggableTask key={task.id} task={task}>
                <div className="group flex cursor-grab items-center gap-3 rounded-xl border border-stone-200 bg-white p-3 shadow-sm transition-all duration-200 hover:border-orange-300 hover:shadow-md active:cursor-grabbing dark:border-stone-800/60 dark:bg-[#262626] dark:hover:border-orange-700/50">
                  {/* 1. Status Indicator (Inbox Dot) */}
                  <div className="flex-none">
                    <div className="h-2 w-2 rounded-full bg-orange-400/80 ring-4 ring-orange-50 dark:ring-orange-900/10"></div>
                  </div>

                  {/* 2. Editable Title (Takes up space) */}
                  <div className="min-w-0 flex-1">
                    <EditableText
                      id={task.id}
                      initialText={task.title}
                      type="task"
                      className="block truncate text-sm font-medium text-stone-700 transition-colors hover:text-orange-600 dark:text-stone-200"
                    />
                  </div>

                  {/* 3. Actions (Delete) - Smooth Fade In */}
                  <div className="flex-none translate-x-2 transform opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
                    <form action={deleteTask}>
                      <input type="hidden" name="taskId" value={task.id} />
                      <button
                        className="rounded-lg p-1.5 text-stone-300 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                        title="Dismiss Thought"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </form>
                  </div>
                </div>
              </DraggableTask>
            ))}
          </div>
        </div>

        {tree.map((goal) => (
          <div key={goal.id} className="group/goal relative">
            <div className="absolute top-7 bottom-2 left-[11px] w-px bg-stone-200 dark:bg-stone-800"></div>
            <div className="group/title relative mb-3 flex items-start gap-3">
              <div className="relative z-10 mt-0.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-stone-200 bg-white shadow-sm transition-colors group-hover/goal:border-orange-300 dark:border-stone-700 dark:bg-stone-900 dark:group-hover/goal:border-orange-900">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="truncate pr-2 text-sm font-semibold text-stone-800 dark:text-stone-200">
                    <EditableText
                      id={goal.id}
                      initialText={goal.title}
                      type="goal"
                      className="transition-colors hover:text-orange-600"
                    />
                  </h3>
                  <div className="flex translate-x-2 transform items-center gap-1 opacity-0 transition-all group-hover/title:translate-x-0 group-hover/title:opacity-100">
                    <AIGenerateButton goalId={goal.id} goalTitle={goal.title} />
                    <form action={deleteGoal}>
                      <input type="hidden" name="goalId" value={goal.id} />
                      <button
                        className="rounded p-1 text-stone-300 transition-colors hover:bg-red-50 hover:text-red-400 dark:hover:bg-red-900/20"
                        title="Delete Goal"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative space-y-2.5 pl-9">
              {goal.steps.length === 0 && (
                <div className="flex items-center gap-2 py-1 opacity-40">
                  <div className="h-1 w-1 rounded-full bg-stone-300"></div>
                  <p className="text-[10px] text-stone-500 italic">No active rituals</p>
                </div>
              )}
              {goal.steps.map((task: any) => (
                <DraggableTask key={task.id} task={task}>
                  <div className="group flex cursor-grab items-center justify-between rounded-lg border border-stone-100 bg-white px-3 py-2.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md active:cursor-grabbing dark:border-stone-800 dark:bg-[#222] dark:hover:border-orange-900">
                    <div className="min-w-0 flex-1">
                      <EditableText
                        id={task.id}
                        initialText={task.title}
                        type="task"
                        className="block truncate text-xs font-medium text-stone-600 dark:text-stone-300"
                      />
                    </div>
                    <div className="pl-2 text-stone-400 opacity-0 group-hover:opacity-30">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="9" cy="5" r="2" />
                        <circle cx="9" cy="12" r="2" />
                        <circle cx="9" cy="19" r="2" />
                        <circle cx="15" cy="5" r="2" />
                        <circle cx="15" cy="12" r="2" />
                        <circle cx="15" cy="19" r="2" />
                      </svg>
                    </div>
                  </div>
                </DraggableTask>
              ))}
              <form
                action={addTask}
                className="mt-1 opacity-60 transition-opacity hover:opacity-100"
              >
                <input type="hidden" name="date_type" value="backlog" />
                <input type="hidden" name="goal_id" value={goal.id} />
                <div className="flex items-center gap-2 pl-1">
                  <span className="text-sm text-stone-300">+</span>
                  <input
                    name="title"
                    placeholder="Add step..."
                    className="w-full border-b border-transparent bg-transparent py-1 text-xs text-stone-600 transition-colors outline-none placeholder:text-stone-300 focus:border-stone-300 dark:text-stone-400 dark:focus:border-stone-600"
                  />
                  <select
                    name="priority"
                    defaultValue="medium"
                    className="rounded border border-stone-200 bg-transparent px-2 py-1 text-[11px] text-stone-500 outline-none dark:border-stone-700 dark:text-stone-400"
                    title="Priority"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <input type="number" name="duration" defaultValue={60} hidden />
                </div>
                <button type="submit" className="hiddeb"></button>
              </form>
            </div>
          </div>
        ))}
        <div className="pt-8 pb-20">
          <form action={addGoal} className="group relative">
            <div className="absolute top-1/2 left-3 -translate-y-1/2 text-stone-400 transition-colors group-focus-within:text-orange-500">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            <input
              name="title"
              placeholder="New Strategic Goal..."
              className="w-full rounded-xl border border-transparent bg-stone-100 py-3 pr-4 pl-10 text-sm font-medium text-stone-800 shadow-sm transition-all outline-none placeholder:text-stone-400 focus:border-orange-300 focus:bg-white focus:shadow-md dark:bg-stone-800/50 dark:text-stone-200 dark:focus:border-orange-800/50 dark:focus:bg-stone-800"
            />
          </form>
        </div>
      </div>
      <div className="pointer-events-none relative z-10 -mt-6 h-6 bg-gradient-to-t from-[#F5F5F4] to-transparent dark:from-[#292524]"></div>
    </DroppableDay>
  )

  return (
    <PlannerBoard>
      <DashboardShell sidebar={sidebarContent} viewMode={viewMode}>
        {/* HEADER: COMMAND CENTER */}
        <div className="relative z-40 flex h-16 items-center justify-between border-b border-stone-200 bg-[#FAFAF9] px-8 pl-16 transition-colors duration-500 dark:border-stone-800 dark:bg-[#1C1917]">
          <div className="flex items-center gap-6">
            <h1 className="hidden font-serif text-lg font-bold text-stone-900 md:block dark:text-stone-100">
              {viewMode === 'plan' ? 'Weekly Strategy' : 'Daily Focus'}
            </h1>

            {/* 🗓️ DATE NAVIGATION CONTROL */}
            <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-100 p-1 pr-4 shadow-sm dark:border-stone-800/50 dark:bg-stone-800/50">
              {/* Arrows Group */}
              <div className="flex items-center gap-0.5">
                <Link
                  href={`/?date=${formatDate(prevWeek)}&view=${viewMode}`}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 transition-all hover:bg-white hover:text-stone-600 dark:hover:bg-stone-700 dark:hover:text-stone-200"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </Link>

                {/* TODAY BUTTON (Contextual) */}
                <Link
                  href={`/?date=${todayStr}&view=${viewMode}`}
                  className={`flex h-7 items-center justify-center rounded-lg px-3 text-xs font-bold transition-all ${
                    normalizedDateStr === todayStr
                      ? 'cursor-default bg-white text-stone-800 shadow-sm dark:bg-stone-700 dark:text-stone-100'
                      : 'text-orange-500 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/20'
                  }`}
                >
                  Today
                </Link>

                <Link
                  href={`/?date=${formatDate(nextWeek)}&view=${viewMode}`}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 transition-all hover:bg-white hover:text-stone-600 dark:hover:bg-stone-700 dark:hover:text-stone-200"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </Link>
              </div>

              {/* Vertical Divider */}
              <div className="h-4 w-px bg-stone-300 dark:bg-stone-700"></div>

              {/* Date Range Text */}
              <span className="font-mono text-xs font-medium tracking-tight text-stone-500 uppercase dark:text-stone-400">
                {dateRangeText}
              </span>
            </div>
          </div>

          {/* VIEW TOGGLE */}
          <div className="flex rounded-lg bg-stone-200 p-1 dark:bg-stone-800">
            <Link
              href={`/?date=${normalizedDateStr}&view=focus`}
              className={`rounded-md px-4 py-1 text-xs font-bold transition-all ${viewMode === 'focus' ? 'bg-white text-stone-800 shadow-sm dark:bg-stone-600 dark:text-stone-100' : 'text-stone-500 dark:text-stone-400'}`}
            >
              Focus
            </Link>
            <Link
              href={`/?date=${normalizedDateStr}&view=plan`}
              className={`rounded-md px-4 py-1 text-xs font-bold transition-all ${viewMode === 'plan' ? 'bg-white text-stone-800 shadow-sm dark:bg-stone-600 dark:text-stone-100' : 'text-stone-500 dark:text-stone-400'}`}
            >
              Plan
            </Link>
          </div>
        </div>

        {/* CONDITIONAL VIEW */}
        {viewMode === 'plan' ? (
          <PlanningGrid weekDays={weekDays} allTasks={allWeekTasks} />
        ) : (
          <div className="relative flex h-full flex-col overflow-hidden">
            <div className="z-30 flex h-32 flex-none flex-col border-b border-stone-200 bg-[#FAFAF9]/90 px-8 py-4 shadow-sm backdrop-blur-md dark:border-stone-800 dark:bg-[#1C1917]/90">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">
                  Move tasks to another day
                </h2>
              </div>
              <div className="flex flex-1 items-start gap-2">
                {weekDays.map((day) => {
                  const dateStr = formatDate(day)
                  const isActive = dateStr === normalizedDateStr
                  const dayLoad = allWeekTasks.filter((t) => t.due_date === dateStr).length

                  return (
                    <DroppableDay key={dateStr} dateStr={dateStr} className="h-full flex-1">
                      <Link
                        href={`/?date=${dateStr}&view=focus`}
                        scroll={false}
                        className={`block flex h-full flex-col items-center justify-center gap-1 rounded-xl border-2 transition-all ${
                          isActive
                            ? 'border-stone-800 bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900'
                            : 'border-transparent bg-white text-stone-500 hover:border-orange-300 dark:bg-stone-800'
                        } `}
                      >
                        <span className="text-[10px] font-bold uppercase">
                          {day.toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                        <span className="font-serif text-lg leading-none font-bold">
                          {day.getDate()}
                        </span>
                        <div className="mt-1 flex gap-0.5">
                          {Array.from({ length: Math.min(dayLoad, 4) }).map((_, i) => (
                            <div
                              key={i}
                              className={`h-1 w-1 rounded-full ${isActive ? 'bg-white/50' : 'bg-orange-400'}`}
                            ></div>
                          ))}
                        </div>
                      </Link>
                    </DroppableDay>
                  )
                })}
              </div>
            </div>
            <div className="relative z-10 flex-1 overflow-hidden">
              <TimeGrid tasks={allWeekTasks.filter((t) => t.due_date === normalizedDateStr)} />
            </div>
          </div>
        )}
        <ReviewTrigger data={reviewData} weekStart={startOfWeek} nextMonday={nextMondayStr} />
      </DashboardShell>
    </PlannerBoard>
  )
}
