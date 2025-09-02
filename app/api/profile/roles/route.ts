import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get('user_id')
    if (!userId) return NextResponse.json({ error: 'missing user_id' }, { status: 400 })

    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', userId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const roles: string[] = (data || []).map((r: any) => r.role)
    return NextResponse.json({ roles })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
