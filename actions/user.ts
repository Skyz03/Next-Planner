'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function completeOnboarding() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    await supabase
        .from('profiles')
        .update({ has_onboarded: true })
        .eq('id', user.id)

    revalidatePath('/dashboard')
}