'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { GoogleGenerativeAI } from "@google/generative-ai"

// Helper to get User ID safely
async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login') // Protect the action

  return { supabase, user }
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

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateStepsForGoal(goalId: string, goalTitle: string) {
  const { supabase, user } = await getUser()

  try {
    // 1. Configure the Model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" })

    // 2. The Prompt
    // We ask for JSON so it's easy to parse programmatically
    const prompt = `
      I have a goal: "${goalTitle}".
      Give me 4 specific, actionable, small weekly tasks to help me achieve this.
      Keep titles under 6 words.
      Return ONLY a raw JSON array of strings. 
      Example: ["Research competitors", "Draft first outline", "Email 3 leads"]
      Do not include markdown formatting like \`\`\`json.
    `

    // 3. Call Gemini
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // 4. Parse the Clean JSON
    // Sometimes AI adds backticks, so we clean it just in case
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim()
    const steps: string[] = JSON.parse(cleanedText)

    // 5. Insert into Database (Batch Insert)
    if (steps.length > 0) {
      const tasksToInsert = steps.map(stepTitle => ({
        user_id: user.id,
        goal_id: goalId,
        title: stepTitle,
        due_date: null, // Goes to Backlog/Weekly Rituals
        is_completed: false
      }))

      await supabase.from('tasks').insert(tasksToInsert)
    }

    revalidatePath('/')
    return { success: true }

  } catch (error) {
    console.error("AI Error:", error)
    return { success: false, error: "Failed to generate steps" }
  }
}


export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
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

export async function toggleTimer(taskId: string) {
  const supabase = await createClient()

  // 1. Get current task state
  const { data: task } = await supabase
    .from('tasks')
    .select('last_started_at, actual_duration')
    .eq('id', taskId)
    .single()

  if (!task) return

  const now = new Date()

  // CASE A: STOPPING (It was running)
  if (task.last_started_at) {
    const startTime = new Date(task.last_started_at)
    // Calculate minutes elapsed since start
    const elapsedMinutes = Math.floor((now.getTime() - startTime.getTime()) / 60000)

    await supabase
      .from('tasks')
      .update({
        last_started_at: null, // Stop it
        actual_duration: (task.actual_duration || 0) + elapsedMinutes // Add to total
      })
      .eq('id', taskId)
  }

  // CASE B: STARTING (It was stopped)
  else {
    await supabase
      .from('tasks')
      .update({ last_started_at: now.toISOString() })
      .eq('id', taskId)
  }

  revalidatePath('/')
}