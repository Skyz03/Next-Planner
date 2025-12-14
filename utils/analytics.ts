import { createClient } from '@/utils/supabase/server'
import { getWeekDays, isSameDay } from '@/utils/date'

export async function getWeeklyReport() {
  const supabase = await createClient()
  const { data: { user } } = await  supabase.auth.getUser()

  // 1. Get the current Week Range (Mon - Sun)
  const weekDays = getWeekDays(new Date())
  const startStr = weekDays[0].toISOString()
  const endStr = weekDays[6].toISOString()

  // 2. Fetch ALL tasks for this week (Created or Due this week)
  const { data: tasks } = await supabase
    .from('tasks')
    .select(`*, goals(title, id)`)
    .eq('user_id', user?.id)
    .gte('due_date', startStr) // Simplified for demo
    .lte('due_date', endStr)

  if (!tasks) return null

  // --- METRIC 1: COMPLETION SCORE ---
  const total = tasks.length
  const completed = tasks.filter(t => t.is_completed).length
  const score = total === 0 ? 0 : Math.round((completed / total) * 100)

  // --- METRIC 2: ACTIVITY BY DAY (Velocity) ---
  const activityByDay = weekDays.map(day => {
    const dayTasks = tasks.filter(t => isSameDay(new Date(t.due_date), day))
    return {
      day: day.toLocaleDateString('en-US', { weekday: 'short' }), // "Mon"
      total: dayTasks.length,
      completed: dayTasks.filter(t => t.is_completed).length
    }
  })

  // --- METRIC 3: GOAL DISTRIBUTION ---
  const goalStats: Record<string, { total: number, completed: number, id: string }> = {}

  tasks.forEach(t => {
    const goalTitle = t.goals?.title || 'Uncategorized'
    if (!goalStats[goalTitle]) {
      goalStats[goalTitle] = { total: 0, completed: 0, id: t.goal_id || 'none' }
    }
    goalStats[goalTitle].total += 1
    if (t.is_completed) goalStats[goalTitle].completed += 1
  })

  const goalBreakdown = Object.entries(goalStats)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.total - a.total) // Sort by most busy

  // --- METRIC 4: BIGGEST WIN ---
  // Simple logic: The completed task created earliest (oldest backlog item done)
  // or just the last completed task.
  const biggestWin = tasks.filter(t => t.is_completed).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0]

  return { score, total, completed, activityByDay, goalBreakdown, biggestWin }
}