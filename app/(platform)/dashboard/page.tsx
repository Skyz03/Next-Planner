import { createClient } from '@/utils/supabase/server'
import { signOut } from '@/actions/auth'
import { getWeeklyReviewData } from '@/actions/reflections'
import { addTask, deleteTask } from '@/actions/task'
import { addGoal } from '@/actions/goal'
import { getWeekDays, formatDate } from '@/utils/date'
import Link from 'next/link'
import PlannerBoard from '@/components/features/planning/PlannerBoard'
import DraggableTask from '@/components/features/planning/DraggableTask'
import DroppableDay from '@/components/features/planning/DroppableDay'
import PlanningGrid from '@/components/features/planning/PlanningGrid'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import EditableText from '@/components/ui/EditableText'
import DashboardShell from '@/components/layout/DashboardShell'
import TimeGrid from '@/components/features/planning/TimeGrid'
import ReviewTrigger from '@/components/features/reflection/ReviewTrigger'
import SidebarGoal from '@/components/features/planning/SidebarGoal'
import OnboardingTour from '@/components/features/onboarding/OnboardingTour'
import BlueprintModal from '@/components/features/planning/BlueprintModal'
import HeaderTimer from '@/components/features/focus/HeaderTimer'

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

  // 2. FETCH DATA (Parallel Fetching)
  const [
    weekTasksResponse,
    weeklyHabitsResponse,
    goalsResponse,
    inboxResponse,
    profileResponse,
    blueprintResponse
  ] = await Promise.all([
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

    supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .is('due_date', null)
      .is('goal_id', null)
      .eq('is_completed', false)
      .order('created_at', { ascending: false }),

    supabase
      .from('profiles')
      .select('has_onboarded')
      .eq('id', user.id)
      .single(),

    supabase
      .from('blueprints')
      .select('*')
      .eq('user_id', user.id)
      .order('day_of_week', { ascending: true }),
  ])

  const allWeekTasks = weekTasksResponse.data || []
  const weeklyList = weeklyHabitsResponse.data || []
  const goals = goalsResponse.data || []
  const inboxTasks = inboxResponse.data || []
  const blueprints = blueprintResponse.data || []
  const hasOnboarded = profileResponse.data?.has_onboarded ?? false

  const tree = goals.map((goal: any) => ({
    ...goal,
    steps: weeklyList.filter((t: any) => t.goal_id === goal.id),
  }))

  const dateRangeText = `${startOfWeekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

  // --- SIDEBAR CONTENT ---
  const sidebarContent = (
    <DroppableDay
      dateStr={null}
      className="flex h-full w-full flex-col border-r border-stone-200 bg-[#F5F5F4] font-sans transition-colors duration-500 dark:border-stone-800 dark:bg-[#18181b]"
    >
      {/* 1. HEADER & CONTROLS BLOCK */}
      <div className="flex flex-col px-6 pt-8 pb-4 pl-8">
        <div className="mb-4 flex items-center justify-between">
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              </button>
            </form>
          </div>
        </div>

        <Link
          href="/reflection"
          id="tour-reflection"
          className="flex items-center justify-between rounded-xl bg-orange-500/10 p-3 text-sm font-bold text-orange-600 transition-colors hover:bg-orange-500/20 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-800/30"
          title="Weekly Reflection"
        >
          <span>Start Weekly Reflection</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        </Link>

        <div className="pt-6">
          <hr className="border-stone-200 dark:border-stone-800" />
        </div>
      </div>

      {/* 3. SCROLLABLE AREA */}
      <div className="custom-scrollbar flex-1 overflow-y-auto px-4 pb-24">
        {/* INBOX SECTION */}
        <div className="mb-8 px-4" id="tour-inbox">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-widest text-stone-400 uppercase">Inbox</span>
            <span className="rounded-full bg-stone-200 px-1.5 text-[10px] text-stone-500 dark:bg-stone-800">{inboxTasks.length}</span>
            <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800"></div>
          </div>
          <div className="space-y-2">
            {inboxTasks.length === 0 && (
              <div className="rounded-lg border border-dashed border-stone-200 py-3 text-center dark:border-stone-800">
                <p className="text-[10px] text-stone-400">Cmd+K to capture thoughts</p>
              </div>
            )}
            {inboxTasks.map((task) => (
              <DraggableTask key={task.id} task={task}>
                <div className="group flex cursor-grab items-center gap-3 rounded-xl border border-stone-200 bg-white p-2.5 shadow-sm transition-all duration-200 hover:border-orange-300 hover:shadow-md active:cursor-grabbing dark:border-stone-800/60 dark:bg-[#262626] dark:hover:border-orange-700/50">
                  <div className="flex-none">
                    <div className="h-2 w-2 rounded-full bg-orange-400/80 ring-2 ring-orange-50 dark:ring-orange-900/10"></div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <EditableText id={task.id} initialText={task.title} type="task" className="block truncate text-sm font-medium text-stone-700 transition-colors hover:text-orange-600 dark:text-stone-200" />
                  </div>
                  <div className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
                    <form action={deleteTask}>
                      <input type="hidden" name="taskId" value={task.id} />
                      <button className="text-stone-300 hover:text-red-500" title="Dismiss Thought"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                    </form>
                  </div>
                </div>
              </DraggableTask>
            ))}
          </div>
        </div>

        {/* STRATEGIC GOALS HEADER */}
        {tree.length > 0 && (
          <div className="mt-8 mb-4 flex items-center gap-2 px-4">
            <span className="text-[11px] font-bold tracking-widest text-stone-400 uppercase">Strategic Goals</span>
            <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800"></div>
          </div>
        )}

        {/* GOALS LIST */}
        <div id="tour-goals" className="space-y-6 px-2">
          {tree.map((goal) => (
            <SidebarGoal key={goal.id} goal={goal} />
          ))}
        </div>

        {/* ADD GOAL FORM */}
        <div className="mt-8 px-4">
          <form action={addGoal} className="group relative">
            <div className="absolute top-1/2 left-3 -translate-y-1/2 text-stone-400 transition-colors group-focus-within:text-orange-500">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </div>
            <input name="title" placeholder="New Strategic Goal..." className="w-full rounded-xl border border-transparent bg-stone-100 py-3 pr-4 pl-10 text-sm font-medium text-stone-800 shadow-sm transition-all outline-none placeholder:text-stone-400 focus:border-orange-300 focus:bg-white focus:shadow-md dark:bg-stone-800/50 dark:text-stone-200 dark:focus:border-orange-800/50 dark:focus:bg-stone-800" />
          </form>
        </div>
      </div>

      <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-12 bg-gradient-to-t from-[#F5F5F4] to-transparent dark:from-[#18181b]"></div>
    </DroppableDay>
  )

  return (
    <PlannerBoard>
      <OnboardingTour hasSeenTour={hasOnboarded} />

      <DashboardShell sidebar={sidebarContent} viewMode={viewMode} >
        {/* HEADER: COMMAND CENTER */}
        <div id="tour-welcome" className="relative z-40 flex h-16 items-center justify-between border-b border-stone-200 bg-[#FAFAF9] px-8 pl-16 transition-colors duration-500 dark:border-stone-800 dark:bg-[#1C1917]">

          {/* LEFT: Title & Date Nav */}
          <div className="flex items-center gap-6">
            <h1 className="hidden font-serif text-lg font-bold text-stone-900 md:block dark:text-stone-100">
              {viewMode === 'plan' ? 'Weekly Strategy' : 'Daily Focus'}
            </h1>

            {/* DATE NAVIGATION */}
            <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-100 p-1 pr-4 shadow-sm dark:border-stone-800/50 dark:bg-stone-800/50">
              <div className="flex items-center gap-0.5">
                <Link href={`/dashboard?date=${formatDate(prevWeek)}&view=${viewMode}`} className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 transition-all hover:bg-white hover:text-stone-600 dark:hover:bg-stone-700 dark:hover:text-stone-200"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg></Link>
                <Link href={`/dashboard?date=${todayStr}&view=${viewMode}`} className={`flex h-7 items-center justify-center rounded-lg px-3 text-xs font-bold transition-all ${normalizedDateStr === todayStr ? 'cursor-default bg-white text-stone-800 shadow-sm dark:bg-stone-700 dark:text-stone-100' : 'text-orange-500 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/20'}`}>Today</Link>
                <Link href={`/dashboard?date=${formatDate(nextWeek)}&view=${viewMode}`} className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 transition-all hover:bg-white hover:text-stone-600 dark:hover:bg-stone-700 dark:hover:text-stone-200"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></Link>
              </div>
              <div className="h-4 w-px bg-stone-300 dark:bg-stone-700"></div>
              <span className="font-mono text-xs font-medium tracking-tight text-stone-500 uppercase dark:text-stone-400">{dateRangeText}</span>
            </div>
          </div>

          {/* RIGHT: Tools & View Toggle */}
          <div className="flex items-center gap-4">
            {/* 1. Timer */}
            <HeaderTimer />

            {/* 2. Blueprint Modal */}
            <BlueprintModal items={blueprints} currentDateStr={normalizedDateStr} />

            {/* Separator */}
            <div className="h-6 w-px bg-stone-200 dark:bg-stone-800"></div>

            {/* 3. View Toggle */}
            <div id="tour-planner" className="flex rounded-lg bg-stone-200 p-1 dark:bg-stone-800">
              <Link
                id="view-toggle-focus"
                href={`/dashboard?date=${normalizedDateStr}&view=focus`}
                className={`rounded-md px-4 py-1 text-xs font-bold transition-all ${viewMode === 'focus' ? 'bg-white text-stone-800 shadow-sm dark:bg-stone-600 dark:text-stone-100' : 'text-stone-500 dark:text-stone-400'}`}
              >
                Focus
              </Link>
              <Link
                id="view-toggle-plan"
                href={`/dashboard?date=${normalizedDateStr}&view=plan`}
                className={`rounded-md px-4 py-1 text-xs font-bold transition-all ${viewMode === 'plan' ? 'bg-white text-stone-800 shadow-sm dark:bg-stone-600 dark:text-stone-100' : 'text-stone-500 dark:text-stone-400'}`}
              >
                Plan
              </Link>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
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
                        href={`/dashboard?date=${dateStr}&view=focus`}
                        scroll={false}
                        className={`block flex h-full flex-col items-center justify-center gap-1 rounded-xl border-2 transition-all ${isActive ? 'border-stone-800 bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900' : 'border-transparent bg-white text-stone-500 hover:border-orange-300 dark:bg-stone-800'} `}
                      >
                        <span className="text-[10px] font-bold uppercase">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span className="font-serif text-lg leading-none font-bold">{day.getDate()}</span>
                        <div className="mt-1 flex gap-0.5">
                          {Array.from({ length: Math.min(dayLoad, 4) }).map((_, i) => (
                            <div key={i} className={`h-1 w-1 rounded-full ${isActive ? 'bg-white/50' : 'bg-orange-400'}`}></div>
                          ))}
                        </div>
                      </Link>
                    </DroppableDay>
                  )
                })}
              </div>
            </div>
            <div id="tour-focus" className="relative z-10 flex-1 overflow-hidden">
              <TimeGrid tasks={allWeekTasks.filter((t) => t.due_date === normalizedDateStr)} />
            </div>
          </div>
        )}
        <ReviewTrigger data={reviewData} weekStart={startOfWeek} nextMonday={nextMondayStr} />
      </DashboardShell>
    </PlannerBoard>
  )
}