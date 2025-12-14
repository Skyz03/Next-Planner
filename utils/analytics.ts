import { createClient } from '@/utils/supabase/server'
import { getWeekDays, formatDate, isSameDay } from '@/utils/date'

export async function getWeeklyReport() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = new Date()
  const weekDays = getWeekDays(today)
  const startOfWeek = formatDate(weekDays[0])
  const endOfWeek = formatDate(weekDays[6])

  // 1. Fetch Tasks in Range
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, goals(title, id)')
    .eq('user_id', user.id)
    .gte('due_date', startOfWeek)
    .lte('due_date', endOfWeek)

  if (!tasks) return null

  const total = tasks.length
  const completedTasks = tasks.filter(t => t.is_completed)
  const completedCount = completedTasks.length

  // 2. Calculate Productivity Score
  // Formula: (Completion Rate * 0.6) + (Velocity/Goal * 0.4) ... Simplified for now:
  const completionRate = total > 0 ? (completedCount / total) * 100 : 0
  const score = Math.round(completionRate)

  // 3. Daily Velocity (Chart Data)
  const activityByDay = weekDays.map(day => {
    const dateStr = formatDate(day)
    const count = tasks.filter(t => t.is_completed && t.due_date === dateStr).length
    return {
      day: day.toLocaleDateString('en-US', { weekday: 'short' }), // "Mon"
      fullDate: dateStr,
      total: count
    }
  })

  // 4. Focus Hours (New Metric)
  // Sum of duration of completed tasks (default 60m if null)
  const totalMinutes = completedTasks.reduce((acc, curr) => acc + (curr.duration || 60), 0)
  const focusHours = Math.round((totalMinutes / 60) * 10) / 10 // 1 decimal place

  // 5. Goal Breakdown
  const goalMap = new Map()
  tasks.forEach(t => {
    if (t.goals) {
      const goalTitle = t.goals.title
      if (!goalMap.has(goalTitle)) {
        goalMap.set(goalTitle, { name: goalTitle, total: 0, completed: 0 })
      }
      const entry = goalMap.get(goalTitle)
      entry.total += 1
      if (t.is_completed) entry.completed += 1
    }
  })
  const goalBreakdown = Array.from(goalMap.values())
    .sort((a, b) => b.completed - a.completed) // Sort by most active

  // 6. Biggest Win (Task with goal, completed, latest)
  const biggestWin = completedTasks
    .filter(t => t.goals) // Must have a goal to be a "Win"
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] || null

  return {
    score,
    total,
    completed: completedCount,
    activityByDay,
    goalBreakdown,
    biggestWin,
    focusHours // <--- Newly Added
  }
}