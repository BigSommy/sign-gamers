// app/tournaments/page.tsx

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Tournament = {
  id: string
  title: string
  description: string
  status: 'upcoming' | 'ongoing' | 'past'
  banner_url: string | null
  register_link: string | null
  registration_deadline?: string // ISO string, optional
  end_date?: string // ISO string, optional
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')

  useEffect(() => {
    supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setTournaments(data || [])
        setLoading(false)
      })
  }, [])

  // Move tournaments to 'past' if their registration_deadline or end_date is in the past
  const now = new Date()
  const getStatus = (t: Tournament) => {
    // Prefer end_date, fallback to registration_deadline
    const dateStr = t.end_date || t.registration_deadline
    if (dateStr) {
      const end = new Date(dateStr)
      if (end < now) return 'past'
    }
    return t.status
  }

  const grouped = {
    upcoming: tournaments.filter((t) => getStatus(t) === 'upcoming'),
    past: tournaments.filter((t) => getStatus(t) === 'past'),
  }

  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto text-white animate-fade-in relative z-0">
      <h1 className="text-3xl font-bold mb-6 text-orange-400 drop-shadow-lg transition-colors duration-200 hover:text-orange-300 cursor-pointer font-['Exo_2']">
        Tournaments
      </h1>
      {loading ? (
        <div className="w-full max-w-2xl mx-auto p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-gray-800 rounded-lg mb-4" />
            <div className="h-8 bg-gray-700 rounded w-2/3" />
            <div className="h-4 bg-gray-700 rounded w-1/3" />
            <div className="h-32 bg-gray-800 rounded" />
          </div>
        </div>
      ) : (
        <>
          <div className="flex gap-4 mb-8">
            <button
              className={`px-4 py-2 rounded font-semibold transition-colors duration-200 focus:outline-none ${activeTab === 'upcoming' ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-orange-400 hover:text-white'}`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming
            </button>
            <button
              className={`px-4 py-2 rounded font-semibold transition-colors duration-200 focus:outline-none ${activeTab === 'past' ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-orange-400 hover:text-white'}`}
              onClick={() => setActiveTab('past')}
            >
              Past Tournaments
            </button>
          </div>
          {activeTab === 'upcoming' && (
            <div>
              <h2 className="text-2xl font-bold mb-4 capitalize font-['Exo_2'] text-orange-400">Upcoming</h2>
              <div className="space-y-4">
                {grouped.upcoming.length === 0 && (
                  <p className="text-gray-400">No upcoming tournaments.</p>
                )}
                {grouped.upcoming.map((t: Tournament) => (
                  <div
                    key={t.id}
                    className="bg-[#222] p-4 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between transition-transform duration-300 hover:scale-[1.02] hover:shadow-orange-500/30 group relative z-10"
                  >
                    <div className="flex items-center gap-4">
                      {t.banner_url && (
                        <img
                          src={t.banner_url}
                          alt="Banner"
                          className="w-16 h-16 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105 group-hover:brightness-90"
                        />
                      )}
                      <div>
                        <Link
                          href={`/tournaments/${t.id}`}
                          className="font-semibold text-lg hover:underline drop-shadow-lg transition-colors duration-200 group-hover:text-orange-400 cursor-pointer font-['Exo_2']"
                        >
                          {t.title}
                        </Link>
                        <p className="text-sm text-gray-400 mb-2">{t.description}</p>
                        {/* Show deadline/end date info */}
                        {(t.end_date || t.registration_deadline) && (
                          <p className="text-xs text-gray-500">Ends: {new Date(t.end_date || t.registration_deadline!).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2 md:mt-0">
                      <Link
                        href={`/tournaments/${t.id}`}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded transition-transform duration-300 hover:scale-105 hover:shadow-orange-500/30"
                      >
                        Register
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'past' && (
            <div>
              <h2 className="text-2xl font-bold mb-4 capitalize font-['Exo_2'] text-orange-400">Past Tournaments</h2>
              <div className="space-y-4">
                {grouped.past.length === 0 && (
                  <p className="text-gray-400">No past tournaments.</p>
                )}
                {grouped.past.map((t: Tournament) => (
                  <div
                    key={t.id}
                    className="bg-[#222] p-4 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between transition-transform duration-300 hover:scale-[1.02] hover:shadow-orange-500/30 group"
                  >
                    <div className="flex items-center gap-4">
                      {t.banner_url && (
                        <img
                          src={t.banner_url}
                          alt="Banner"
                          className="w-16 h-16 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105 group-hover:brightness-90"
                        />
                      )}
                      <div>
                        <Link
                          href={`/tournaments/${t.id}`}
                          className="font-semibold text-lg hover:underline drop-shadow-lg transition-colors duration-200 group-hover:text-orange-400 cursor-pointer font-['Exo_2']"
                        >
                          {t.title}
                        </Link>
                        <p className="text-sm text-gray-400 mb-2">{t.description}</p>
                        {/* Show deadline/end date info */}
                        {(t.end_date || t.registration_deadline) && (
                          <p className="text-xs text-gray-500">Ended: {new Date(t.end_date || t.registration_deadline!).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2 md:mt-0">
                      <Link
                        href={`/tournaments/${t.id}`}
                        className="bg-gray-700 hover:bg-orange-700 text-white px-3 py-1 rounded transition-transform duration-300 hover:scale-105 hover:shadow-orange-500/30"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  )
}
