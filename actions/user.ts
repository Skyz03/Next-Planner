'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function completeOnboarding() {
    const supabase = await createClient()

    // getUser() is the safe way to call this on the server
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        console.error('Auth session missing or expired')
        redirect('/login') // Force redirect if the refresh token is missing
    }

    const { error } = await supabase
        .from('profiles')
        .update({ has_onboarded: true })
        .eq('id', user.id)

    if (error) {
        console.error('Error updating onboarding status:', error)
        return { error: 'Failed to update profile' }
    }

    revalidatePath('/', 'layout') // Revalidate everything to update UI state
    redirect('/dashboard')
}