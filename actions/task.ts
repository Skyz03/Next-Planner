'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login') // Protect the action

  return { supabase, user }
}

export async function addTask(formData: FormData) {
  const { supabase, user } = await getUser()

  // 1. Extract standard fields
  const title = formData.get('title') as string
  const goalId = formData.get('goal_id') as string
  const dateType = formData.get('date_type') as string
  const specificDate = formData.get('specific_date') as string

  // 2. Extract new fields (with fallbacks)
  const priority = (formData.get('priority') as string) || 'medium'
  const startTime = (formData.get('start_time') as string) || null // Expecting "HH:MM"
  const durationRaw = formData.get('duration') as string
  const duration = durationRaw ? parseInt(durationRaw) : 60 // Default 60m

  if (!title) return

  // 3. Construct the Payload
  const taskData: any = {
    title,
    user_id: user.id,
    is_completed: false,
    actual_duration: 0,

    // ✅ NEW: Map the extra fields
    priority, // 'low', 'medium', 'high'
    start_time: startTime,
    duration: duration,
  }

  // 4. Handle Date Logic (Inbox vs Schedule)
  if (dateType === 'inbox') {
    taskData.due_date = null
    taskData.goal_id = null
  } else if (dateType === 'backlog') {
    taskData.due_date = null
    taskData.goal_id = goalId && goalId !== 'none' ? goalId : null
  } else if (specificDate) {
    // Normalize date
    if (/^\d{4}-\d{2}-\d{2}$/.test(specificDate)) {
      taskData.due_date = specificDate
    } else {
      const date = new Date(specificDate)
      taskData.due_date = date.toISOString().split('T')[0]
    }
    taskData.goal_id = goalId && goalId !== 'none' ? goalId : null
  }

  // 5. Insert
  const { error } = await supabase.from('tasks').insert(taskData)

  if (error) {
    console.error('Error adding task:', error)
    return
  }

  revalidatePath('/')
}

export async function toggleTask(taskId: string, isCompleted: boolean) {
  const { supabase, user } = await getUser()

  await supabase
    .from('tasks')
    .update({ is_completed: isCompleted }) // 👈 Save the exact value sent from UI
    .eq('id', taskId)
    .eq('user_id', user.id)

  revalidatePath('/')
}

export async function deleteTask(formData: FormData) {
  const { supabase, user } = await getUser()

  const taskId = formData.get('taskId') as string

  await supabase.from('tasks').delete().eq('id', taskId).eq('user_id', user.id) // ✅ Ensure user can only delete their own tasks

  revalidatePath('/')
}

export async function scheduleTask(formData: FormData) {
  const { supabase, user } = await getUser()
  const taskId = formData.get('taskId') as string
  const date = formData.get('date') as string

  if (!taskId || !date) return

  await supabase.from('tasks').update({ due_date: date }).eq('id', taskId).eq('user_id', user.id)

  revalidatePath('/')
}

export async function updateTask(formData: FormData) {
  const { supabase, user } = await getUser()
  const taskId = formData.get('taskId') as string
  const newTitle = formData.get('title') as string

  if (!taskId || !newTitle) return

  await supabase.from('tasks').update({ title: newTitle }).eq('id', taskId).eq('user_id', user.id)

  revalidatePath('/')
}

export async function moveTaskToDate(taskId: string, dateStr: string | null) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('tasks')
    .update({ due_date: dateStr }) // Pass null to move back to backlog
    .eq('id', taskId)
    .eq('user_id', user.id)

  revalidatePath('/')
}

export async function scheduleTaskTime(
  taskId: string,
  startTime: string | null,
  duration: number = 60,
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('tasks')
    .update({
      start_time: startTime, // Pass null to remove from timeline (back to dock)
      duration: duration,
    })
    .eq('id', taskId)
    .eq('user_id', user.id)

  revalidatePath('/')
}

export async function toggleTimer(taskId: string) {
  const supabase = await createClient()

  // 1. Get current task status
  const { data: task } = await supabase
    .from('tasks')
    .select('last_started_at, actual_duration')
    .eq('id', taskId)
    .single()

  if (!task) return

  const now = new Date()

  if (task.last_started_at) {
    // STOPPING: Calculate session duration in minutes
    const startTime = new Date(task.last_started_at)
    const sessionMinutes = Math.floor((now.getTime() - startTime.getTime()) / 60000)
    const newTotal = (task.actual_duration || 0) + sessionMinutes

    await supabase
      .from('tasks')
      .update({
        last_started_at: null,
        actual_duration: newTotal
      })
      .eq('id', taskId)
  } else {
    // STARTING: Set timestamp
    await supabase
      .from('tasks')
      .update({ last_started_at: now.toISOString() })
      .eq('id', taskId)
  }

  revalidatePath('/dashboard')
}

export async function updateTaskDuration(taskId: string, duration: number) {
  const supabase = await createClient()

  const { error } = await supabase.from('tasks').update({ duration }).eq('id', taskId)

  if (error) {
    console.error('Error updating task duration:', error)
    return
  }

  revalidatePath('/dashboard')
}
