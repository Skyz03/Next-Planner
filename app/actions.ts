'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { GoogleGenerativeAI } from "@google/generative-ai"

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
  const goalId = formData.get('goal_id') as string
  const dateType = formData.get('date_type') as string
  const specificDate = formData.get('specific_date') as string

  if (!title) return

  // Determine due_date based on form inputs
  let dueDate: string | null = null
  if (dateType === 'backlog') {
    dueDate = null // Backlog tasks have no due date
  } else if (specificDate) {
    // Normalize date to YYYY-MM-DD format (ensure no time component)
    // If already in YYYY-MM-DD format, use it directly; otherwise parse it
    if (/^\d{4}-\d{2}-\d{2}$/.test(specificDate)) {
      dueDate = specificDate // Already in correct format
    } else {
      const date = new Date(specificDate)
      dueDate = date.toISOString().split('T')[0] // Returns "YYYY-MM-DD"
    }
  }

  const { error } = await supabase.from('tasks').insert({
    title,
    user_id: user.id, // ✅ Using Real ID
    priority: 'medium',
    goal_id: goalId && goalId !== 'none' ? goalId : null,
    due_date: dueDate
  })

  if (error) {
    console.error('Error adding task:', error)
    return
  }

  // Revalidate the page - Next.js will preserve the current URL with query params
  revalidatePath('/', 'layout')
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
  const supabase = createClient()
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