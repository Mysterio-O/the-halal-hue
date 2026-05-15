import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { createRouteSupabase } from '@/utils/supabase/route'

// ─── Who is allowed to create whom ───────────────────────────────────────────
// SUPER_ADMIN can create anyone.
// ADMIN can create MANAGER only.
const CREATION_PERMISSIONS: Record<string, string[]> = {
    SUPER_ADMIN: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
    ADMIN: ['MANAGER'],
}

export async function POST(req: NextRequest) {
    try {
        // 1. Verify the caller is authenticated and has a permitted role
        const routeSupabase = await createRouteSupabase()
        const { data: { user: caller }, error: authError } = await routeSupabase.auth.getUser()

        if (authError || !caller) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: callerProfile, error: profileError } = await routeSupabase
            .from('user_profiles')
            .select('user_role')
            .eq('user_id', caller.id)
            .single()

        if (profileError || !callerProfile) {
            return NextResponse.json({ error: 'Forbidden — profile not found' }, { status: 403 })
        }

        const callerRole = callerProfile.user_role as string
        const allowedToCreate = CREATION_PERMISSIONS[callerRole]

        if (!allowedToCreate) {
            return NextResponse.json({ error: 'Forbidden — insufficient role' }, { status: 403 })
        }

        // 2. Parse and validate body
        const body = await req.json()
        const { full_name, email, password, user_role } = body as {
            full_name: string
            email: string
            password: string
            user_role: string
        }

        if (!full_name?.trim() || !email?.trim() || !password || !user_role) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
        }

        if (!allowedToCreate.includes(user_role)) {
            return NextResponse.json(
                { error: `Your role cannot create a ${user_role}` },
                { status: 403 }
            )
        }

        if (password.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
        }

        // 3. Create auth user via service role (never expose this key client-side)
        const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: email.trim().toLowerCase(),
            password,
            email_confirm: true, // skip confirmation email — admin-created users are pre-verified
        })

        if (createError) {
            // Surface friendly messages for common cases
            if (createError.message.includes('already registered')) {
                return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 })
            }
            return NextResponse.json({ error: createError.message }, { status: 400 })
        }

        // 4. Insert user_profile row (links to auth.users)
        const { error: insertError } = await supabaseAdmin
            .from('user_profiles')
            .insert({
                user_id: newAuthUser.user.id,
                full_name: full_name.trim(),
                email: email.trim().toLowerCase(),
                user_role,
                user_status: 'ACTIVE',
            })

        if (insertError) {
            // Profile insert failed — clean up the auth user so we don't leave orphans
            await supabaseAdmin.auth.admin.deleteUser(newAuthUser.user.id)
            return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 })
        }

        return NextResponse.json(
            { message: 'User created successfully', userId: newAuthUser.user.id },
            { status: 201 }
        )
    } catch (err) {
        console.error('[POST /api/admin/users]', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}