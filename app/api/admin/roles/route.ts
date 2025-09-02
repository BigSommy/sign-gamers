
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export async function POST(req: Request) {
  // Expect body: { action: 'add' | 'remove', user_id: string, role: string }
  const body = await req.json()
  const { action, user_id, role } = body

  if (!user_id || !role || !action) {
    return NextResponse.json({ error: 'missing parameters' }, { status: 400 })
  }

  // Use Supabase client with service role key for RLS bypass
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  if (action === 'add') {
    const { error } = await supabase.from('user_roles').insert([{ user_id, role }])
    if (error) return NextResponse.json({ error }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  if (action === 'remove') {
    const { error } = await supabase.from('user_roles').delete().match({ user_id, role })
    if (error) return NextResponse.json({ error }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'invalid action' }, { status: 400 })
}
