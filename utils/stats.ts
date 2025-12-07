import { createClient } from '@/utils/supabase/server'

export async function getWeeklyStats() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { completed: 0, total: 0, startOfWeek: new Date() }
    }

    // Get start of the current week (Sunday)
    const today = new Date()
    const dayOfWeek = today.getDay()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - dayOfWeek)
    startOfWeek.setHours(0, 0, 0, 0)

    // Fetch all tasks created/updated since Sunday
    // Note: In a real app, you might query based on 'completed_at'
    const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startOfWeek.toISOString())

    const completed = tasks?.filter(t => t.is_completed).length || 0
    const total = tasks?.length || 0

    return { completed, total, startOfWeek }
}