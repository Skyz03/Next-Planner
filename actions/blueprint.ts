'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { addDays, parseISO, startOfWeek, format, endOfWeek } from 'date-fns'

// --- CONSTANTS FOR SPECIAL DAYS ---
const EVERYDAY = 7
const WEEKDAYS = 8
const WEEKENDS = 9

/**
 * 1. ADD ITEM TO BLUEPRINT
 */
export async function addBlueprintItem(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const title = formData.get('title') as string
  const dayOfWeekStr = formData.get('day_of_week')
  const durationStr = formData.get('duration')

  const day_of_week = dayOfWeekStr !== "" ? parseInt(dayOfWeekStr as string) : null
  const duration = durationStr ? parseInt(durationStr as string) : 60

  const { error } = await supabase.from('blueprints').insert({
    user_id: user.id,
    title,
    day_of_week,
    duration,
    priority: 'medium',
  })

  if (error) console.error('Error adding blueprint:', error)
  revalidatePath('/dashboard')
}

/**
 * 2. DELETE ITEM (Unchanged)
 */
export async function deleteBlueprintItem(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('blueprints').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/dashboard')
}

/**
 * 3. APPLY BLUEPRINT (Now with Duplicate Protection & Expansion)
 */
export async function applyBlueprintToWeek(targetDateStr: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // A. Fetch Blueprint Templates
  const { data: templates } = await supabase
    .from('blueprints')
    .select('*')
    .eq('user_id', user.id)

  if (!templates || templates.length === 0) return

  // B. Calculate Week Boundaries
  const targetDate = parseISO(targetDateStr)
  const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 }) // Monday
  const weekEnd = endOfWeek(targetDate, { weekStartsOn: 1 }) // Sunday

  // C. Fetch EXISTING Tasks for this week (For Duplicate Check)
  const { data: existingTasks } = await supabase
    .from('tasks')
    .select('title, due_date')
    .eq('user_id', user.id)
    .gte('due_date', format(weekStart, 'yyyy-MM-dd'))
    .lte('due_date', format(weekEnd, 'yyyy-MM-dd'))

  // Create a quick lookup set: "Title|Date"
  const existingSet = new Set(
    existingTasks?.map(t => `${t.title.toLowerCase().trim()}|${t.due_date}`) || []
  )

  // D. Expand & Prepare Tasks
  const tasksToCreate: any[] = []

  templates.forEach((tmpl) => {
    // Determine which days this template applies to
    let daysToApply: number[] = []

    if (tmpl.day_of_week === null) {
      daysToApply = [-1] // Special flag for Inbox
    } else if (tmpl.day_of_week === EVERYDAY) {
      daysToApply = [1, 2, 3, 4, 5, 6, 0] // Mon-Sun
    } else if (tmpl.day_of_week === WEEKDAYS) {
      daysToApply = [1, 2, 3, 4, 5] // Mon-Fri
    } else if (tmpl.day_of_week === WEEKENDS) {
      daysToApply = [6, 0] // Sat, Sun
    } else {
      daysToApply = [tmpl.day_of_week] // Specific Day
    }

    // Generate a task for each applicable day
    daysToApply.forEach(dayIndex => {
      let dueDate = null

      if (dayIndex !== -1) {
        // Calculate date: Mon(1) adds 0 days, Sun(0) adds 6 days
        const daysToAdd = dayIndex === 0 ? 6 : dayIndex - 1
        dueDate = format(addDays(weekStart, daysToAdd), 'yyyy-MM-dd')
      }

      // E. DUPLICATE CHECK
      // If it has a date, check if it exists. If inbox (-1), we usually allow duplicates or check null date.
      const signature = `${tmpl.title.toLowerCase().trim()}|${dueDate || 'null'}`

      if (dueDate && existingSet.has(signature)) {
        // Skip! Task already exists on this day.
        return
      }

      tasksToCreate.push({
        user_id: user.id,
        title: tmpl.title,
        duration: tmpl.duration,
        priority: tmpl.priority,
        due_date: dueDate,
        is_completed: false
      })
    })
  })

  if (tasksToCreate.length === 0) return // Nothing new to add

  // F. Bulk Insert
  const { error } = await supabase.from('tasks').insert(tasksToCreate)

  if (error) console.error('Blueprint Error:', error)
  revalidatePath('/dashboard')
}