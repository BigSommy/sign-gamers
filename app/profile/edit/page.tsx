'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { FaUser, FaTwitter, FaGamepad, FaSave, FaArrowLeft } from 'react-icons/fa'
import { UserProfile, UserGamePreference, Game } from '@/types/database'
import ProfilePictureUpload from '@/components/ProfilePictureUpload'
import GameCard from '@/components/GameCard'

const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Must be 20 characters or fewer').regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores'),
  bio: z.string().max(500, 'Bio must be less than 500 characters'),
  twitter_handle: z.string().optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

export default function EditProfilePage() {
  const { user, profile, loading, updateProfile } = useAuth()
  const router = useRouter()
  const [games, setGames] = useState<Game[]>([])
  const [userGamePreferences, setUserGamePreferences] = useState<UserGamePreference[]>([])
  const [selectedGames, setSelectedGames] = useState<string[]>([])
  const [gameIds, setGameIds] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
      return
    }

    if (profile) {
      setValue('username', profile.username || '')
      setValue('bio', profile.bio || '')
      setValue('twitter_handle', profile.twitter_handle || '')
    }

    fetchGames()
    fetchUserGamePreferences()
  }, [user, profile, loading, router, setValue])

  const fetchGames = async () => {
    try {
      const { data: gamesData, error } = await supabase
        .from('games')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching games:', error)
        return
      }

      setGames(gamesData || [])
    } catch (error) {
      console.error('Error fetching games:', error)
    }
  }

  const fetchUserGamePreferences = async () => {
    if (!user) return

    try {
      const { data: preferencesData, error } = await supabase
        .from('user_game_preferences')
        .select('*')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching game preferences:', error)
        return
      }

      setUserGamePreferences(preferencesData || [])
      
      const selected = preferencesData?.map(p => p.game_id) || []
      const ids: Record<string, string> = {}
      preferencesData?.forEach(p => {
        if (p.in_game_id) {
          ids[p.game_id] = p.in_game_id
        }
      })
      
      setSelectedGames(selected)
      setGameIds(ids)
    } catch (error) {
      console.error('Error fetching game preferences:', error)
    }
  }

  const toggleGame = (gameId: string) => {
    setSelectedGames(prev => 
      prev.includes(gameId) 
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId]
    )
  }

  const updateGameId = (gameId: string, value: string) => {
    setGameIds(prev => ({
      ...prev,
      [gameId]: value
    }))
  }

  const onSubmit = async (data: ProfileForm) => {
    if (!user) return

    setIsLoading(true)
    
    try {
      // Enforce unique username (case-insensitive)
      const { data: existing, error: nameErr } = await supabase
        .from('user_profiles')
        .select('user_id')
        .ilike('username', data.username)
      if (nameErr) {
        console.error(nameErr)
      }
      const taken = (existing || []).some((row: any) => row.user_id !== user.id)
      if (taken) {
        toast.error('Username already taken')
        setIsLoading(false)
        return
      }

      // Update profile (username, bio, twitter)
      const { error: profileError } = await updateProfile({
        username: data.username.trim(),
        bio: data.bio.trim(),
        twitter_handle: data.twitter_handle?.trim() || null
      })

      if (profileError) {
        toast.error('Failed to update profile')
        setIsLoading(false)
        return
      }

      // Update game preferences
      const currentGameIds = userGamePreferences.map(p => p.game_id)
      const gamesToRemove = currentGameIds.filter(id => !selectedGames.includes(id))
      if (gamesToRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from('user_game_preferences')
          .delete()
          .eq('user_id', user.id)
          .in('game_id', gamesToRemove)
        if (deleteError) console.error('Error removing game preferences:', deleteError)
      }

      if (selectedGames.length > 0) {
        const gamePreferences = selectedGames.map(gameId => ({
          user_id: user.id,
          game_id: gameId,
          in_game_id: gameIds[gameId] || null,
          is_favorite: false
        }))
        const { error: gameError } = await supabase
          .from('user_game_preferences')
          .upsert(gamePreferences, { onConflict: 'user_id,game_id' })
        if (gameError) console.error('Error updating game preferences:', gameError)
      }

      toast.success('Profile updated successfully!')
      router.push(`/profile/${user.id}`)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#18181b] flex items-center justify-center">
        <div className="text-orange-400 text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const usernameValue = watch('username')

  return (
    <div className="min-h-screen bg-[#18181b] pt-20 pb-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href={`/profile/${user.id}`}
              className="text-gray-400 hover:text-orange-400 transition-colors"
            >
              <FaArrowLeft className="text-xl" />
            </Link>
            <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-[#222] rounded-xl shadow-2xl p-6 border border-orange-400/20">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FaUser className="text-orange-400" />
              Profile Information
            </h2>

            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Profile Picture</label>
                  <ProfilePictureUpload
                    currentImageUrl={profile?.profile_picture_url}
                    className="w-24 h-24"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-400">Upload a profile picture. JPG/PNG up to 5MB.</p>
                </div>
              </div>

              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <input
                  {...register('username')}
                  id="username"
                  type="text"
                  className="w-full px-4 py-3 rounded-lg bg-[#18181b] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                  placeholder="Choose a username"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-400">{errors.username.message}</p>
                )}
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                <textarea
                  {...register('bio')}
                  id="bio"
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-[#18181b] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all resize-none"
                  placeholder="Tell us about your gaming journey..."
                />
                {errors.bio && (
                  <p className="mt-1 text-sm text-red-400">{errors.bio.message}</p>
                )}
              </div>

              {/* Twitter Handle */}
              <div>
                <label htmlFor="twitter" className="block text-sm font-medium text-gray-300 mb-2">Twitter Handle</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaTwitter className="text-gray-400" />
                  </div>
                  <input
                    {...register('twitter_handle')}
                    type="text"
                    id="twitter"
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#18181b] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                    placeholder="@yourusername"
                  />
                </div>
                {errors.twitter_handle && (
                  <p className="mt-1 text-sm text-red-400">{errors.twitter_handle.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Game Preferences */}
          <div className="bg-[#222] rounded-xl shadow-2xl p-6 border border-orange-400/20">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FaGamepad className="text-orange-400" />
              Game Preferences
            </h2>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Select Games</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {games.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    isSelected={selectedGames.includes(game.id)}
                    onClick={() => toggleGame(game.id)}
                  />
                ))}
              </div>
            </div>

            {selectedGames.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">In-Game IDs</h3>
                <div className="space-y-4">
                  {selectedGames.map(gameId => {
                    const game = games.find(g => g.id === gameId)
                    return (
                      <div key={gameId} className="bg-[#18181b] rounded-lg p-4 border border-gray-600">
                        <div className="flex items-center gap-3 mb-3">
                          <FaGamepad className="text-orange-400" />
                          <h4 className="font-semibold text-white">{game?.name}</h4>
                        </div>
                        <input
                          type="text"
                          value={gameIds[gameId] || ''}
                          onChange={(e) => updateGameId(gameId, e.target.value)}
                          placeholder={`${game?.name} ID`}
                          className="w-full px-4 py-3 rounded-lg bg-[#18181b] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Link
              href={`/profile/${user.id}`}
              className="flex-1 bg-transparent hover:bg-gray-700 text-gray-300 font-semibold py-3 px-4 rounded-lg border border-gray-600 transition-all duration-200 text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <FaSave className="text-sm" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
