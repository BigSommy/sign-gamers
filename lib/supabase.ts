import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper function to get the current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting current user:', error)
    return null
  }
  return user
}

// Helper function to get user profile
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) {
    console.error('Error getting user profile:', error)
    return null
  }
  return data
}

// Helper function to get user roles
export const getUserRoles = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
  
  if (error) {
    console.error('Error getting user roles:', error)
    return []
  }
  return data.map(role => role.role)
}

// Helper function to check if user has specific role
export const hasRole = async (userId: string, role: string) => {
  const roles = await getUserRoles(userId)
  return roles.includes(role as any)
}

// Helper function to check if user is admin
export const isAdmin = async (userId: string) => {
  return await hasRole(userId, 'admin')
}

// Helper function to check if user is moderator
export const isModerator = async (userId: string) => {
  return await hasRole(userId, 'moderator')
}

// Helper function to check if user is game host
export const isGameHost = async (userId: string) => {
  return await hasRole(userId, 'game_host')
}
