import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient<Database>(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    // Fetch auth users (all users in the Supabase auth system)
    const { data: usersData, error: uErr } = await supabase.auth.admin.listUsers()
    if (uErr) return NextResponse.json({ error: uErr.message }, { status: 500 })

    const [{ data: profiles, error: pErr }, { data: roles, error: rErr }] = await Promise.all([
      supabase.from('user_profiles').select('*'),
      supabase.from('user_roles').select('*')
    ])

    if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 })
    if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 })

    const users = usersData?.users || []

    // Map profiles by user_id for quick merge
    const profilesByUserId: Record<string, any> = {}
    ;(profiles || []).forEach((p: any) => { profilesByUserId[p.user_id] = p })

    // Build a unified profiles list that includes auth users even if they lack a user_profiles row
    const unified = users.map((u: any) => {
      const p = profilesByUserId[u.id]
      return {
        id: p?.id ?? null,
        user_id: u.id,
        username: p?.username ?? (u.user_metadata?.username ?? (u.email ? u.email.split('@')[0] : '')),
        bio: p?.bio ?? null,
        profile_picture_url: p?.profile_picture_url ?? null,
        created_at: p?.created_at ?? u.created_at,
        updated_at: p?.updated_at ?? null,
        email: u.email ?? null
      }
    })

    return NextResponse.json({ profiles: unified, roles: roles || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}

