'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function getUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login') // Protect the action

    return { supabase, user }
}


export async function addTask(formData: FormData) {
    const { supabase, user } = await getUser()

    const title = formData.get('title') as string
    const goalId = formData.get('goal_id') as string
    const dateType = formData.get('date_type') as string // 'inbox' | 'backlog' | undefined
    const specificDate = formData.get('specific_date') as string

    if (!title) return

    // 1. Base Task Object
    // We add 'duration: 60' so your new Timer/Reality Check UI works immediately
    const taskData: any = {
        title,
        user_id: user.id,
        priority: 'medium',
        duration: 60,
        actual_duration: 0, // Reset timer tracking
        is_completed: false
    }

    // 2. Logic Branching
    if (dateType === 'inbox') {
        // 📥 INBOX MODE: Rapid Capture
        // Explicitly nullify connections so it sits in the "Inbox" section
        taskData.due_date = null
        taskData.goal_id = null
    }
    else if (dateType === 'backlog') {
        // 📋 BACKLOG MODE: Strategic Planning
        // Has a goal (context), but no specific time yet
        taskData.due_date = null
        taskData.goal_id = goalId && goalId !== 'none' ? goalId : null
    }
    else if (specificDate) {
        // 🗓️ SCHEDULED MODE: Direct execution
        // Normalize date string
        if (/^\d{4}-\d{2}-\d{2}$/.test(specificDate)) {
            taskData.due_date = specificDate
        } else {
            const date = new Date(specificDate)
            taskData.due_date = date.toISOString().split('T')[0]
        }

        // Attach goal if present
        taskData.goal_id = goalId && goalId !== 'none' ? goalId : null
    }

    // 3. Database Insert
    const { error } = await supabase.from('tasks').insert(taskData)

    if (error) {
        console.error('Error adding task:', error)
        return
    }

    revalidatePath('/', 'layout')
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

    await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id) // ✅ Ensure user can only delete their own tasks

    revalidatePath('/')
}

export async function scheduleTask(formData: FormData) {
    const { supabase, user } = await getUser()
    const taskId = formData.get('taskId') as string
    const date = formData.get('date') as string

    if (!taskId || !date) return

    await supabase
        .from('tasks')
        .update({ due_date: date })
        .eq('id', taskId)
        .eq('user_id', user.id)

    revalidatePath('/')
}

export async function updateTask(formData: FormData) {
    const { supabase, user } = await getUser()
    const taskId = formData.get('taskId') as string
    const newTitle = formData.get('title') as string

    if (!taskId || !newTitle) return

    await supabase
        .from('tasks')
        .update({ title: newTitle })
        .eq('id', taskId)
        .eq('user_id', user.id)

    revalidatePath('/')
}

export async function moveTaskToDate(taskId: string, dateStr: string | null) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
        .from('tasks')
        .update({ due_date: dateStr }) // Pass null to move back to backlog
        .eq('id', taskId)
        .eq('user_id', user.id)

    revalidatePath('/')
}

export async function scheduleTaskTime(taskId: string, startTime: string | null, duration: number = 60) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
  
    await supabase
      .from('tasks')
      .update({
        start_time: startTime, // Pass null to remove from timeline (back to dock)
        duration: duration
      })
      .eq('id', taskId)
      .eq('user_id', user.id)
  
    revalidatePath('/')
  }