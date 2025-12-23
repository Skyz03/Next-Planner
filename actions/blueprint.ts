'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { addDays, parseISO, startOfWeek } from 'date-fns'

// 1. Add Item to Blueprint
export async function addBlueprintItem(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const title = formData.get('title') as string
  const dayOfWeek = formData.get('day_of_week') // 1 (Mon) to 0 (Sun)
  const duration = formData.get('duration')

  await supabase.from('blueprints').insert({
    user_id: user.id,
    title,
    day_of_week: dayOfWeek ? parseInt(dayOfWeek as string) : null,
    duration: duration ? parseInt(duration as string) : 60,
  })

  revalidatePath('/dashboard')
}

// 2. Remove Item from Blueprint
export async function deleteBlueprintItem(id: string) {
  const supabase = await createClient()
  await supabase.from('blueprints').delete().eq('id', id)
  revalidatePath('/dashboard')
}

// 3. THE MAGIC: Apply Blueprint to a specific Week
export async function applyBlueprintToWeek(targetDateStr: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // A. Fetch Blueprint Items
  const { data: templates } = await supabase
    .from('blueprints')
    .select('*')
    .eq('user_id', user.id)

  if (!templates || templates.length === 0) return

  // B. Calculate Dates relative to the Target Week
  // We assume targetDateStr is any day in the target week
  const targetDate = parseISO(targetDateStr)
  const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 }) // Monday start

  // C. Prepare Tasks for Insertion
  const tasksToCreate = templates.map((tmpl) => {
    let dueDate = null
    
    // If template has a specific day (0-6), calculate the real date
    if (tmpl.day_of_week !== null) {
      // date-fns startOfWeek returns Sunday as 0, Monday as 1...
      // Adjust logic if your DB stores 0 as Sunday or Monday. 
      // Assuming DB: 0=Sun, 1=Mon...6=Sat (Standard JS)
      
      // Calculate difference from Sunday start
      const targetDay = addDays(weekStart, (tmpl.day_of_week === 0 ? 6 : tmpl.day_of_week - 1))
      dueDate = targetDay.toISOString().split('T')[0]
    }

    return {
      user_id: user.id,
      title: tmpl.title,
      duration: tmpl.duration,
      priority: tmpl.priority,
      due_date: dueDate, // If null, goes to Inbox
      is_completed: false
    }
  })

  // D. Bulk Insert
  const { error } = await supabase.from('tasks').insert(tasksToCreate)

  if (error) console.error('Blueprint Error:', error)

  revalidatePath('/dashboard')
}