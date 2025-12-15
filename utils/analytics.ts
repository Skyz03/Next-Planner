import { createClient } from '@/utils/supabase/server'
import { getWeekDays, formatDate } from '@/utils/date'

// Helper to get Month Date Range
function getMonthRange(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
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
    startDateStr = formatDate(start)
    endDateStr = formatDate(end)
    // Generate array of all days in month for the chart
    dateLabels = []
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dateLabels.push(new Date(d))
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
    const dateStr = formatDate(day)
    const count = completedTasks.filter(t => t.due_date === dateStr).length
    return {
      day: day.toLocaleDateString('en-US', { weekday: 'short' }), // "Mon"
      dateNum: day.getDate(), // 15
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

  return {
    rangeType, // Pass this back so UI knows what to show
    score, total, completed: completedCount, activityByDay, goalBreakdown, biggestWin, focusHours, peakTime,
    planningAccuracy: calculateAccuracy(completedTasks)
  }
}

function calculateAccuracy(tasks: any[]) {
  const trackedTasks = tasks.filter(t => t.actual_duration > 0 && t.duration > 0)
  if (trackedTasks.length === 0) return 'No Data'
  let totalDiff = 0
  trackedTasks.forEach(t => totalDiff += (t.actual_duration / t.duration))
  const avgRatio = totalDiff / trackedTasks.length
  if (avgRatio > 1.1) return 'Underestimator'
  if (avgRatio < 0.9) return 'Overestimator'
  return 'Calibrated'
}