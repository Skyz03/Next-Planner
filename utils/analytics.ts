import { createClient } from '@/utils/supabase/server'

export async function getReviewData() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Calculate Week Range
  const today = new Date()
  const lastSunday = new Date(today)
  lastSunday.setDate(today.getDate() - today.getDay())
  lastSunday.setHours(0, 0, 0, 0)

  // 2. Fetch Completed Tasks with Goal Info
  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      id, 
      title, 
      created_at, 
      due_date,
      priority,
      goals ( title, id )
    `)
    .eq('user_id', user?.id)
    .eq('is_completed', true)
    .gte('created_at', lastSunday.toISOString())
    .order('created_at', { ascending: false })

  // 3. Simple "Intelligence" Grouping
  // Calculate which goal got the most attention
  const goalCounts: Record<string, number> = {}
  tasks?.forEach(t => {
    let goalName = 'Uncategorized'
    // "goals" might be an array or null. Handle both cases.
    if (Array.isArray(t.goals) && t.goals.length > 0) {
      // Take the first goal's title if present
      goalName = t.goals[0]?.title || 'Uncategorized'
    } else if (
      t.goals &&
      typeof t.goals === 'object' &&
      !Array.isArray(t.goals) &&
      typeof (t.goals as any).title === 'string'
    ) {
      // Handle single goal object (precaution for future model change)
      goalName = (t.goals as { title: string }).title || 'Uncategorized'
    }
    goalCounts[goalName] = (goalCounts[goalName] || 0) + 1
  })

  // Find top focus
  const sortedGoals = Object.entries(goalCounts).sort(([,a], [,b]) => b - a)
  const topFocus = sortedGoals[0]?.[0] || 'Nothing specific'

  return { 
    history: tasks || [], 
    topFocus,
    totalDone: tasks?.length || 0 
  }
}