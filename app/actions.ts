'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Helper to get User ID safely
async function getUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login') // Protect the action
  
  return { supabase, user }
}

// --- NEW: Goal Action ---
export async function addGoal(formData: FormData) {
  const { supabase, user } = await getUser() // ✅ REAL USER
  const title = formData.get('title') as string

  if (!title) return

  await supabase.from('goals').insert({
    title,
    user_id: user.id, // ✅ Using Real ID
  })

  revalidatePath('/')
}

// --- UPDATED: Task Action ---
export async function addTask(formData: FormData) {
  const { supabase, user } = await getUser() // ✅ REAL USER
  const title = formData.get('title') as string
  const goalId = formData.get('goal_id') as string // <--- Get the selected Goal

  if (!title) return

  await supabase.from('tasks').insert({
    title,
    user_id: user.id, // ✅ Using Real ID
    priority: 'medium',
    goal_id: goalId !== 'none' ? goalId : null // <--- Save the relationship
  })

  revalidatePath('/')
}

export async function toggleTask(taskId: string, currentStatus: boolean) {
  const { supabase, user } = await getUser()
  
  await supabase
    .from('tasks')
    .update({ is_completed: !currentStatus })
    .eq('id', taskId)
    .eq('user_id', user.id) // ✅ Ensure user can only toggle their own tasks
  
  revalidatePath('/')
}

export async function saveReflection(formData: FormData) {
  const { supabase, user } = await getUser() // ✅ REAL USER

  const win = formData.get('win') as string
  const challenge = formData.get('challenge') as string
  const energy = formData.get('energy') as string
  const completedCount = formData.get('completed_count') as string
  const weekStart = formData.get('week_start') as string

  await supabase.from('reflections').insert({
    user_id: user.id, // ✅ Using Real ID
    biggest_win: win,
    biggest_challenge: challenge,
    energy_rating: parseInt(energy),
    total_tasks_completed: parseInt(completedCount),
    week_start_date: weekStart
  })

  // Redirect to home or show a success message
  revalidatePath('/')
}
