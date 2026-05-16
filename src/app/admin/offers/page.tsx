import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/utils/supabase/server'
import OffersManagerClient from './OffersManagerClient'

type AppRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER'
const ALLOWED_ROLES: AppRole[] = ['SUPER_ADMIN', 'ADMIN', 'MANAGER']

export default async function AdminOffersPage() {
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login?next=/admin/offers')

    const { data: profile } = await supabase
        .from('user_profiles')
        .select('user_role')
        .eq('user_id', user.id)
        .single()

    if (!profile?.user_role || !ALLOWED_ROLES.includes(profile.user_role as AppRole)) {
        redirect('/admin?reason=forbidden')
    }

    return <OffersManagerClient />
}
