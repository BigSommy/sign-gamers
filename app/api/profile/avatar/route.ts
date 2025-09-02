import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies()
    let userId: string | null = null

    // Try cookie-based auth
    const cookieClient = createRouteHandlerClient<Database>({ cookies: () => cookieStore })
    const cookieUserRes = await cookieClient.auth.getUser()
    if (cookieUserRes.data.user) {
      userId = cookieUserRes.data.user.id
    } else {
      // Fallback to Authorization bearer
      const authHeader = req.headers.get('authorization') || req.headers.get('Authorization')
      if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const token = authHeader.split(' ')[1]
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const tokenClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      })
      const tokenUserRes = await tokenClient.auth.getUser()
      if (!tokenUserRes.data.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      userId = tokenUserRes.data.user.id
    }

    // Use service-role client for storage and DB to bypass RLS safely
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const serviceClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
    }

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const path = `${userId}/profile_${Date.now()}.${ext}`

    const { error: uploadError } = await serviceClient.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: pub } = serviceClient.storage.from('avatars').getPublicUrl(path)
    const publicUrl = pub.publicUrl

    const { error: updateError } = await serviceClient
      .from('user_profiles')
      .update({ profile_picture_url: publicUrl })
      .eq('user_id', userId!)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ url: publicUrl })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
