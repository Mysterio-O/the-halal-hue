import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/utils/supabase/server'
import CreateUserClient from '@/app/callerRole/CreateUserClient'

// Only SUPER_ADMIN and ADMIN can reach this page
const ALLOWED_ROLES = ['SUPER_ADMIN', 'ADMIN'] as const
type AllowedRole = typeof ALLOWED_ROLES[number]

export default async function CreateUserPage() {
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login?next=/admin/users/create')

    const { data: profile } = await supabase
        .from('user_profiles')
        .select('user_role, full_name')
        .eq('user_id', user.id)
        .single()

    if (!profile?.user_role || !ALLOWED_ROLES.includes(profile.user_role as AllowedRole)) {
        redirect('/admin?reason=forbidden')
    }

    return (
        <CreateUserClient callerRole={profile.user_role as AllowedRole} />
    )
}