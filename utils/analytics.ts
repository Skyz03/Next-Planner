import { createClient } from '@/utils/supabase/server'
import { getWeekDays, formatDate } from '@/utils/date'

// ✅ NEW: Safe Local Date Formatter
// Extracts YYYY-MM-DD exactly as they appear in local time, ignoring timezone shifts.
function toLocalYMD(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getMonthRange(date: Date) {
  // Create dates at Noon (12:00) instead of Midnight (00:00) to avoid Daylight Savings shifts
  const start = new Date(date.getFullYear(), date.getMonth(), 1, 12, 0, 0)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 12, 0, 0)
  return { start, end }
}

export async function getProductivityReport(rangeType: 'week' | 'month' = 'week') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // 1. Determine Date Range
  const today = new Date()
  let startDateStr, endDateStr, dateLabels: Date[]

  if (rangeType === 'month') {
    const { start, end } = getMonthRange(today)
    startDateStr = toLocalYMD(start)
    endDateStr = toLocalYMD(end)

    // Generate array of all days in month
    dateLabels = []
    const current = new Date(start)
    // Reset to 1st of month to be safe
    current.setDate(1)

    while (current.getMonth() === start.getMonth()) {
      dateLabels.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
  } else {
    // Default to Week
    const weekDays = getWeekDays(today)
    startDateStr = formatDate(weekDays[0])
    endDateStr = formatDate(weekDays[6])
    dateLabels = weekDays
  }

  // 2. Fetch Data
  const { data: tasks } = await supabase
    .from('tasks')
    .select(`*, goals (id, title)`)
    .eq('user_id', user.id)
    .gte('due_date', startDateStr)
    .lte('due_date', endDateStr)

  if (!tasks) return null

  // --- ANALYSIS ENGINE ---

  const total = tasks.length
  const completedTasks = tasks.filter(t => t.is_completed)
  const completedCount = completedTasks.length

  // A. Score
  const completionRate = total > 0 ? (completedCount / total) * 100 : 0
  const highPriorityBonus = completedTasks.filter(t => t.priority === 'high').length * 2
  const score = Math.min(Math.round(completionRate + highPriorityBonus), 100)

  // B. Focus Hours
  const totalMinutes = completedTasks.reduce((acc, t) => {
    return acc + (t.actual_duration > 0 ? t.actual_duration : (t.duration || 60))
  }, 0)
  const focusHours = Math.round((totalMinutes / 60) * 10) / 10

  // C. Daily Velocity (Dynamic for Week or Month)
  const activityByDay = dateLabels.map(day => {
    // 🛑 FIX: Use the Safe Local Formatter here
    const dateStr = toLocalYMD(day)

    const count = completedTasks.filter(t => t.due_date === dateStr).length
    return {
      day: day.toLocaleDateString('en-US', { weekday: 'short' }),
      dateNum: day.getDate(),
      fullDate: dateStr,
      total: count
    }
  })

  // D. Goal Breakdown
  const goalMap = new Map()
  tasks.forEach(t => {
    const goalTitle = t.goals?.title || 'Unlinked / Ad-hoc'
    if (!goalMap.has(goalTitle)) goalMap.set(goalTitle, { name: goalTitle, total: 0, completed: 0 })
    const entry = goalMap.get(goalTitle)
    entry.total += 1
    if (t.is_completed) entry.completed += 1
  })
  const goalBreakdown = Array.from(goalMap.values()).sort((a, b) => b.completed - a.completed)

  // E. Peak Energy
  let morning = 0, afternoon = 0, evening = 0
  completedTasks.forEach(t => {
    if (t.start_time) {
      const hour = parseInt(t.start_time.split(':')[0])
      if (hour >= 5 && hour < 12) morning++
      else if (hour >= 12 && hour < 17) afternoon++
      else evening++
    }
  })
  const peakTime = morning > afternoon && morning > evening ? 'Morning' : afternoon > morning && afternoon > evening ? 'Afternoon' : 'Evening'

  // F. Biggest Win
  const biggestWin = completedTasks.sort((a, b) => {
    const priorityScore = (p: string) => (p === 'high' ? 3 : p === 'medium' ? 2 : 1)
    const scoreA = priorityScore(a.priority) + (a.goal_id ? 1 : 0)
    const scoreB = priorityScore(b.priority) + (b.goal_id ? 1 : 0)
    return scoreB - scoreA
  })[0] || null

  const rangeStart = new Date(startDateStr).getTime()

  // 1. Inputs (Where did tasks come from?)
  // "Planned": Created *before* this period started
  // "Ad-Hoc": Created *during* this period
  const plannedTasks = tasks.filter(t => new Date(t.created_at).getTime() < rangeStart)
  const adHocTasks = tasks.filter(t => new Date(t.created_at).getTime() >= rangeStart)

  // 2. Flows
  // Flow A: Planned -> Completed
  const plannedCompleted = plannedTasks.filter(t => t.is_completed).length
  // Flow B: Planned -> Rolled Over
  const plannedRolled = plannedTasks.filter(t => !t.is_completed).length
  // Flow C: Ad-Hoc -> Completed
  const adHocCompleted = adHocTasks.filter(t => t.is_completed).length
  // Flow D: Ad-Hoc -> Rolled Over
  const adHocRolled = adHocTasks.filter(t => !t.is_completed).length

  const flowData = {
    planned: plannedTasks.length,
    adHoc: adHocTasks.length,
    completed: plannedCompleted + adHocCompleted,
    rolledOver: plannedRolled + adHocRolled,
    flows: {
      plannedToCompleted: plannedCompleted,
      plannedToRolled: plannedRolled,
      adHocToCompleted: adHocCompleted,
      adHocToRolled: adHocRolled
    }
  }

  return {
    rangeType,
    score,
    total,
    completed: completedCount,
    activityByDay,
    goalBreakdown,
    biggestWin,
    focusHours,
    peakTime,
    planningAccuracy: calculateAccuracy(completedTasks),
    flowData,
  }
}

function calculateAccuracy(tasks: any[]) {
  const trackedTasks = tasks.filter(t => t.actual_duration > 0 && t.duration > 0)
  if (trackedTasks.length === 0) return 'Calibrated' // Default to calibrated if no data
  let totalDiff = 0
  trackedTasks.forEach(t => totalDiff += (t.actual_duration / t.duration))
  const avgRatio = totalDiff / trackedTasks.length
  if (avgRatio > 1.1) return 'Underestimator'
  if (avgRatio < 0.9) return 'Overestimator'
  return 'Calibrated'
}