// app/tournaments/page.tsx

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

type Tournament = {
  id: string
  title: string
  description: string
  status: 'upcoming' | 'ongoing' | 'past'
  banner_url: string | null
  register_link: string | null
  prize?: string | null
  mode?: 'bracket' | 'room' | null
  starts_at?: string | null
  room_code?: string | null
  created_at?: string | null
  registration_deadline?: string // ISO string, optional
  end_date?: string // ISO string, optional
}

type InsertTournamentPayload = {
  title: string
  description: string
  mode: 'bracket' | 'room'
  prize: string | null
  starts_at: string
  registration_deadline: string
  room_code?: string | null
  banner_url?: string | null
}

export default function TournamentsPage() {
  const auth = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [mode, setMode] = useState<'bracket' | 'room'>('bracket')
  const [roomCode, setRoomCode] = useState('')
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [prize, setPrize] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

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

  const canCreate = !auth.loading && (auth.isAdmin() || auth.isGameHost());

  

  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto text-white animate-fade-in relative z-0">
      <h1 className="text-3xl font-bold mb-6 text-orange-400 drop-shadow-lg transition-colors duration-200 hover:text-orange-300 cursor-pointer font-['Exo_2']">
        Tournaments
      </h1>
      {/* Create button for Admins/Game Hosts */}
  {canCreate && (
        <button
              onClick={() => setShowCreate(true)}
          aria-label="Create tournament"
          className="fixed bottom-24 sm:bottom-8 right-6 sm:right-8 z-50 bg-orange-500 hover:bg-orange-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
        >
          <span className="text-2xl">+</span>
        </button>
      )}
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
                    <div className="flex items-center gap-4 w-full">
                      {t.banner_url && (
                        <img
                          src={t.banner_url}
                          alt="Banner"
                          className="w-20 h-20 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105 group-hover:brightness-90 border-2 border-orange-400"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            href={`/tournaments/${t.id}`}
                            className="font-semibold text-lg hover:underline drop-shadow-lg transition-colors duration-200 group-hover:text-orange-400 cursor-pointer font-['Exo_2']"
                          >
                            {t.title}
                          </Link>
                          {t.prize && (
                            <span className="ml-2 px-2 py-0.5 rounded bg-yellow-400 text-black text-xs font-bold shadow border border-yellow-500 animate-pulse">
                              🏆 {t.prize}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mb-1 line-clamp-2">{t.description}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                          {t.mode && <span className="bg-gray-800 px-2 py-0.5 rounded">Mode: {t.mode}</span>}
                          {(() => {
                            const dateStr = t.end_date ?? t.registration_deadline;
                            return dateStr ? (
                              <span>Ends: {new Date(dateStr).toLocaleString()}</span>
                            ) : null;
                          })()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 md:mt-0 md:ml-4">
                      <Link
                        href={`/tournaments/${t.id}`}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-bold transition-transform duration-300 hover:scale-105 hover:shadow-orange-500/30"
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
                        {(() => {
                          const dateStr = t.end_date ?? t.registration_deadline;
                          return dateStr ? (
                            <p className="text-xs text-gray-500">Ended: {new Date(dateStr).toLocaleString()}</p>
                          ) : null;
                        })()}
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

      {/* Inline Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-[#111] rounded-lg p-6 w-full max-w-xl text-white max-h-[calc(100vh-140px)] overflow-y-auto">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Create Tournament</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setFormError(null);
                if (!(auth.isAdmin() || auth.isGameHost())) {
                  setFormError('You do not have permission to create tournaments');
                  return;
                }
                if (!title) {
                  setFormError('Title is required');
                  return;
                }
                // validate startsAt
                if (!startsAt) {
                  setFormError('Start date/time is required');
                  return;
                }
                const startsDate = new Date(startsAt);
                if (isNaN(startsDate.getTime())) {
                  setFormError('Invalid start date/time');
                  return;
                }
                setCreating(true);
                let bannerUrl: string | null = null;
                try {
                  // Upload banner if provided
                  if (bannerFile) {
                    setUploadingBanner(true);
                    const fileExt = bannerFile.name.split('.').pop();
                    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
                    const { data: uploadData, error: uploadError } = await supabase.storage
                      .from('tournament-banners')
                      .upload(fileName, bannerFile, { cacheControl: '3600', upsert: false });
                    if (uploadError) throw uploadError;
                    // Get public URL
                    const { data: publicData } = supabase.storage.from('tournament-banners').getPublicUrl(uploadData.path);
                    bannerUrl = publicData.publicUrl;
                  }

                  // compute registration deadline 5 minutes before start
                  const registrationDeadlineDate = new Date(startsDate.getTime() - 5 * 60 * 1000);
                  const payload: InsertTournamentPayload = {
                    title,
                    description,
                    mode,
                    prize: prize || null,
                    starts_at: startsDate.toISOString(),
                    registration_deadline: registrationDeadlineDate.toISOString(),
                    ...(mode === 'room' ? { room_code: roomCode || null } : {}),
                    ...(bannerUrl ? { banner_url: bannerUrl } : {}),
                  };
                  const { data, error } = await supabase.from('tournaments').insert(payload).select().single();
                  if (error) throw error;
                  setTournaments((prev) => [data, ...prev]);
                  setShowCreate(false);
                  setTitle(''); setDescription(''); setRoomCode(''); setMode('bracket'); setBannerFile(null); setPrize('');
                } catch (err: any) {
                  setFormError(err.message || 'Error creating tournament');
                } finally {
                  setCreating(false);
                  setUploadingBanner(false);
                }
              }}
            >
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-300">Title</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 rounded bg-gray-800" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 rounded bg-gray-800" />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-300">Prize</label>
                  <input value={prize} onChange={(e) => setPrize(e.target.value)} placeholder="e.g. $100 + Discord Nitro" className="w-full p-2 rounded bg-gray-800" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Upload Banner</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBannerFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full text-sm text-gray-300"
                  />
                  {bannerFile && <div className="text-xs text-gray-400 mt-2">Selected: {bannerFile.name}</div>}
                </div>
                <div>
                  <label className="block text-sm text-gray-300">Mode</label>
                  <select value={mode} onChange={(e) => setMode(e.target.value as any)} className="w-full p-2 rounded bg-gray-800">
                    <option value="bracket">1v1 (Bracket)</option>
                    <option value="room">Room (Battle Royale)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300">Starts At</label>
                  <input
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="w-full p-2 rounded bg-gray-800"
                  />
                  <p className="text-xs text-gray-500 mt-1">Registrations will close 5 minutes before the start time.</p>
                </div>
                {mode === 'room' && (
                  <div>
                    <label className="block text-sm text-gray-300">Room Code / Link</label>
                    <input value={roomCode} onChange={(e) => setRoomCode(e.target.value)} className="w-full p-2 rounded bg-gray-800" />
                  </div>
                )}
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded bg-gray-700">Cancel</button>
                  <button type="submit" disabled={creating || uploadingBanner} className="px-4 py-2 rounded bg-orange-500">{creating || uploadingBanner ? 'Creating...' : 'Create'}</button>
                </div>
                {formError && <div className="text-red-400">{formError}</div>}
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
