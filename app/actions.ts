'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

const TEST_USER_ID = 'test-user-1'

// --- NEW: Goal Action ---
export async function addGoal(formData: FormData) {
    const supabase = createClient()
    const title = formData.get('title') as string

    if (!title) return

    await supabase.from('goals').insert({
        title,
        user_id: TEST_USER_ID,
    })

    revalidatePath('/')
}

// --- UPDATED: Task Action ---
export async function addTask(formData: FormData) {
    const supabase = createClient()
    const title = formData.get('title') as string
    const goalId = formData.get('goal_id') as string // <--- Get the selected Goal

    if (!title) return

    await supabase.from('tasks').insert({
        title,
        user_id: TEST_USER_ID,
        priority: 'medium',
        goal_id: goalId !== 'none' ? goalId : null // <--- Save the relationship
    })

    revalidatePath('/')
}

// ... keep toggleTask as is ...
export async function toggleTask(taskId: string, currentStatus: boolean) {
    const supabase = createClient()
    await supabase.from('tasks').update({ is_completed: !currentStatus }).eq('id', taskId)
    revalidatePath('/')
}

export async function saveReflection(formData: FormData) {
    const supabase = createClient()

    const win = formData.get('win') as string
    const challenge = formData.get('challenge') as string
    const energy = formData.get('energy') as string
    const completedCount = formData.get('completed_count') as string
    const weekStart = formData.get('week_start') as string

    await supabase.from('reflections').insert({
        user_id: TEST_USER_ID,
        biggest_win: win,
        biggest_challenge: challenge,
        energy_rating: parseInt(energy),
        total_tasks_completed: parseInt(completedCount),
        week_start_date: weekStart
    })

    // Redirect to home or show a success message
    revalidatePath('/')
}