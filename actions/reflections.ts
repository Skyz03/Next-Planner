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

export async function getWeeklyReviewData(startDate: string, endDate: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // 1. Get Uncompleted Tasks (Past due or due this week and not done)
    const { data: uncompleted } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .lte('due_date', endDate) // Includes today/past
        .not('due_date', 'is', null) // Only scheduled ones

    // 2. Get Stats (Completed vs Total)
    const { data: stats } = await supabase
        .from('tasks')
        .select('is_completed')
        .eq('user_id', user.id)
        .gte('due_date', startDate)
        .lte('due_date', endDate)

    const completedCount = stats?.filter(t => t.is_completed).length || 0
    const totalCount = stats?.length || 0

    return { uncompleted, completedCount, totalCount }
}

export async function migrateUncompletedTasks(taskIds: string[], action: 'move-next-week' | 'move-backlog' | 'delete', nextMondayDate?: string) {
    const supabase = await createClient()

    if (action === 'delete') {
        await supabase.from('tasks').delete().in('id', taskIds)
    }
    else if (action === 'move-backlog') {
        await supabase.from('tasks').update({ due_date: null, start_time: null }).in('id', taskIds)
    }
    else if (action === 'move-next-week' && nextMondayDate) {
        await supabase.from('tasks').update({ due_date: nextMondayDate, start_time: null }).in('id', taskIds)
    }

    revalidatePath('/')
}

export async function saveWeeklyReflection(weekStart: string, completed: number, total: number, text: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('reflections').insert({
        user_id: user?.id,
        week_start_date: weekStart,
        total_tasks_completed: completed,
        total_tasks_scheduled: total,
        reflection_text: text
    })
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
