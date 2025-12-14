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
// app/actions.ts

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

export async function deleteGoal(formData: FormData) {
  const { supabase, user } = await getUser()

  const goalId = formData.get('goalId') as string

  // Note: Since we set "ON DELETE SET NULL" in the database earlier,
  // deleting a goal won't delete the tasks; it just unlinks them.
  await supabase
    .from('goals')
    .delete()
    .eq('id', goalId)
    .eq('user_id', user.id) // ✅ Ensure user can only delete their own goals

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

export async function updateGoal(formData: FormData) {
  const { supabase, user } = await getUser()
  const goalId = formData.get('goalId') as string
  const newTitle = formData.get('title') as string

  if (!goalId || !newTitle) return

  await supabase
    .from('goals')
    .update({ title: newTitle })
    .eq('id', goalId)
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