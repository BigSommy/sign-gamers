'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { UserProfile, UserGamePreference, Game } from '@/types/database'
import { FaUser, FaGamepad, FaTrophy, FaImage, FaEdit, FaCrown, FaShieldAlt } from 'react-icons/fa'

import { getUserBadges } from '@/lib/getUserBadges'
import TrophyBadge from '@/components/TrophyBadge'

import Link from 'next/link'
import GameCard from '@/components/GameCard'

export default function UserProfilePage() {
  const params = useParams()
  const { user: currentUser } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [gamePreferences, setGamePreferences] = useState<UserGamePreference[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [roles, setRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [activeTab, setActiveTab] = useState<'games' | 'trophies' | 'media'>('games')

  const userId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined

  const [badges, setBadges] = useState<any[]>([]);
  useEffect(() => {
    if (!userId) return;
    getUserBadges(userId).then(setBadges);
  }, [userId]);

  useEffect(() => {
    if (!userId) return

    const fetchProfileData = async () => {
      try {
  setIsOwnProfile(currentUser?.id === userId)

        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single()
        setProfile(profileData)

        const { data: gamePrefsData } = await supabase
          .from('user_game_preferences')
          .select('*')
          .eq('user_id', userId)
        setGamePreferences(gamePrefsData || [])

        // Fetch roles for this user from the server endpoint (uses service role key)
        try {
          const rolesRes = await fetch(`/api/profile/roles?user_id=${encodeURIComponent(userId)}`)
          const rolesJson = await rolesRes.json()
          if (rolesRes.ok) {
            setRoles(rolesJson.roles || [])
          } else {
            console.error('Error fetching roles from server:', rolesJson)
            setRoles([])
          }
        } catch (err) {
          console.error('Error fetching user roles:', err)
          setRoles([])
        }

        const { data: gamesData } = await supabase
          .from('games')
          .select('*')
        setGames(gamesData || [])
      } catch (error) {
        console.error('Error fetching profile data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [userId, currentUser])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#18181b] flex items-center justify-center">
        <div className="text-orange-400 text-xl">Loading profile...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#18181b] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">Profile not found</div>
          <Link href="/" className="text-orange-400 hover:text-orange-300">
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  const getGame = (gameId: string) => games.find(g => g.id === gameId)

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <FaCrown className="text-yellow-400" />
      case 'moderator':
        return <FaShieldAlt className="text-blue-400" />
      case 'game_host':
        return <FaGamepad className="text-green-400" />
      default:
        return <FaUser className="text-gray-400" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-500 text-white'
      case 'moderator':
        return 'bg-blue-500 text-white'
      case 'game_host':
        return 'bg-green-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  return (
    <div className="min-h-screen bg-[#18181b] pt-20 pb-8">
      <div className="max-w-4xl relative z-10 mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-[#222] rounded-xl shadow-2xl p-6 mb-6 border border-orange-400/20">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-orange-400/20 rounded-full flex items-center justify-center border-4 border-orange-400/30">
                {profile.profile_picture_url ? (
                  <img 
                    src={profile.profile_picture_url} 
                    alt={profile.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <FaUser className="text-4xl md:text-5xl text-orange-400" />
                )}
              </div>
              {isOwnProfile && (
                <button className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full shadow-lg transition-all">
                  <FaEdit className="text-sm" />
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-white">{profile.username}</h1>
                {roles.length > 0 ? (
                  <div className="flex items-center gap-2">
                    {roles.map((r) => (
                      <span key={r} className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(r)}`}>
                        {getRoleIcon(r)}
                        <span className="ml-2 capitalize">{r.replace('_', ' ')}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  isOwnProfile && (
                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                      You
                    </span>
                  )
                )}
              </div>
              
              {profile.bio && (
                <p className="text-gray-300 mb-3">{profile.bio}</p>
              )}
              
              {profile.twitter_handle && (
                <a 
                  href={`https://twitter.com/${profile.twitter_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-400 hover:text-orange-300 text-sm font-medium"
                >
                  @{profile.twitter_handle}
                </a>
              )}
            </div>

            {/* Edit Profile Button (if own profile) */}
            {isOwnProfile && (
              <Link
                href="/profile/edit"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Edit Profile
              </Link>
            )}
          </div>
        </div>

        

        {/* Profile Content Tabs */}
        <div className="bg-[#222] rounded-xl shadow-2xl p-4 border border-orange-400/20">
          <div className="flex items-center gap-4 mb-4 px-2">
            <button
              onClick={() => setActiveTab('games')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md ${activeTab === 'games' ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-white/5'}`}
            >
              <FaGamepad />
              Games
            </button>
            <button
              onClick={() => setActiveTab('trophies')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md ${activeTab === 'trophies' ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-white/5'}`}
            >
              <FaTrophy />
              Trophies
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md ${activeTab === 'media' ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-white/5'}`}
            >
              <FaImage />
              Media
            </button>
          </div>

          <div className="p-4">
            {activeTab === 'games' && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaGamepad className="text-orange-400" />
                  <h2 className="text-xl font-bold text-white">Games</h2>
                </div>

                {gamePreferences.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gamePreferences.map((pref) => {
                      const game = getGame(pref.game_id)
                      if (!game) return null
                      return (
                        <GameCard key={pref.id} game={game} showDescription={false} subText={pref.in_game_id || undefined} />
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-gray-400">No games added yet.</p>
                )}
              </div>
            )}

            {activeTab === 'trophies' && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaTrophy className="text-orange-400" />
                  <h2 className="text-xl font-bold text-white">Trophies</h2>
                </div>
                {badges.length === 0 ? (
                  <p className="text-gray-400 text-sm">Tournament achievements will appear here.</p>
                ) : (
                  <div className="flex flex-wrap gap-4">
                    {badges.map((badge, i) => (
                      <TrophyBadge
                        key={badge.tournament_id + '-' + badge.position}
                        username={profile.username}
                        place={badge.position}
                        tournamentTitle={badge.tournament_title}
                        date={badge.date}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'media' && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaImage className="text-orange-400" />
                  <h2 className="text-xl font-bold text-white">Media</h2>
                </div>
                <p className="text-gray-400 text-sm">Uploaded screenshots and clips will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
