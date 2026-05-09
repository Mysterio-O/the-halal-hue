import React from 'react'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/utils/supabase/server'

type AppRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER'
const ALLOWED_ROLES: AppRole[] = ['SUPER_ADMIN', 'ADMIN', 'MANAGER']

export default async function AdminPage() {

    const supabase = await createServerSupabase()

    // Single call — gets user AND profile in one shot
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login?next=/admin')

    const { data: profile } = await supabase
        .from('user_profiles')
        .select('user_role')
        .eq('user_id', user.id)
        .single()

    if (!profile?.user_role || !ALLOWED_ROLES.includes(profile.user_role as AppRole)) {
        redirect('/login?reason=forbidden')
    }

    return (
        <div>AdminPage</div>
    )
}