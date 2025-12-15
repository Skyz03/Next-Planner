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