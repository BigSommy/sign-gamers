'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, getUserProfile, getUserRoles } from '@/lib/supabase'
import { UserProfile, UserRoleType } from '@/types/database'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  roles: UserRoleType[]
  loading: boolean
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>
  saveOnboardingData: (onboardingData: any) => Promise<{ error: any }>
  hasRole: (role: UserRoleType) => boolean
  isAdmin: () => boolean
  isModerator: () => boolean
  isGameHost: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [roles, setRoles] = useState<UserRoleType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await loadUserData(session.user.id)
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id)
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await loadUserData(session.user.id)
          
          // Handle redirection based on user state
          if (event === 'SIGNED_IN') {
            // Check if user needs to complete onboarding
            const profileData = await getUserProfile(session.user.id)
            if (!profileData?.bio && !profileData?.twitter_handle) {
              // Redirect to onboarding if profile is incomplete
              window.location.href = '/onboarding'
            } else {
              // Redirect to home if profile is complete
              window.location.href = '/'
            }
          }
        } else {
          setProfile(null)
          setRoles([])
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadUserData = async (userId: string) => {
    try {
      console.log('Loading user data for:', userId)
      // Load profile and roles in parallel
      const [profileData, rolesData] = await Promise.all([
        getUserProfile(userId),
        getUserRoles(userId)
      ])
      
      console.log('Profile data:', profileData)
      console.log('Roles data:', rolesData)
      
      setProfile(profileData)
      setRoles(rolesData)
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      })
      
      if (!error && data.user) {
        console.log('User signed up successfully:', data.user.id)
        
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: data.user.id,
            username: username,
            email: email
          })
        
        if (profileError) {
          console.error('Error creating profile:', profileError)
        } else {
          console.log('Profile created successfully')
        }
        
        // Assign default role (user) via server endpoint to ensure service-role privileges
        try {
          const res = await fetch('/api/admin/roles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'add', user_id: data.user.id, role: 'user' })
          })
          const rdata = await res.json()
          if (!res.ok) {
            console.error('Error assigning role via server:', rdata)
          } else {
            console.log('Role assigned successfully via server')
          }
        } catch (err) {
          console.error('Error assigning role via server:', err)
        }
      } else {
        console.log('Signup failed or no user data:', { error, user: data?.user })
      }
      
      return { error }
    } catch (error) {
      console.error('Error in signUp:', error)
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('Signing in with:', email)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      console.log('Sign in result:', { data, error })
      
      if (error) {
        console.error('Sign in error:', error)
      } else {
        console.log('Sign in successful, user:', data.user?.id)
      }
      
      return { error }
    } catch (error) {
      console.error('Sign in exception:', error)
      return { error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('No user logged in') }
    
    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', user.id)
    
    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : null)
    }
    
    return { error }
  }

  const saveOnboardingData = async (onboardingData: any) => {
    if (!user) return { error: new Error('No user logged in') }
    
    try {
      // Update user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          bio: onboardingData.bio,
          twitter_handle: onboardingData.twitter_handle,
          profile_picture_url: onboardingData.profile_picture_url || null
        })
        .eq('user_id', user.id)
      
      if (profileError) throw profileError

      // Save game preferences (only game selection; in-game IDs are added in profile settings)
      if (onboardingData.selectedGames && onboardingData.selectedGames.length > 0) {
        const gamePreferences = onboardingData.selectedGames.map((gameId: string) => ({
          user_id: user.id,
          game_id: gameId,
          is_favorite: false
        }))

        const { error: gameError } = await supabase
          .from('user_game_preferences')
          .upsert(gamePreferences, { onConflict: 'user_id,game_id' })
        
        if (gameError) throw gameError
      }

      // Reload user data
      await loadUserData(user.id)
      
      return { error: null }
    } catch (error) {
      console.error('Error saving onboarding data:', error)
      return { error }
    }
  }

  const hasRole = (role: UserRoleType) => {
    return roles.includes(role)
  }

  const isAdmin = () => hasRole('admin')
  const isModerator = () => hasRole('moderator')
  const isGameHost = () => hasRole('game_host')

  const value = {
    user,
    session,
    profile,
    roles,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    saveOnboardingData,
    hasRole,
    isAdmin,
    isModerator,
    isGameHost
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
