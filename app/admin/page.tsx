'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import LeaderboardAdmin from './leaderboard'
import MediaUpload from './MediaUpload'
import BlogAdmin from './BlogAdmin'
import LoserAdmin from './LoserAdmin';
import { games } from '../gamesData'


type Tournament = {
  id: string
  title: string
  description: string
  status: 'upcoming' | 'ongoing' | 'past'
  banner_url: string | null
  register_link: string | null
  registration_deadline?: string | null
  game_id: string;
}

type Registration = {
  id: string;
  username: string;
  game_id: string;
  x_handle?: string;
  created_at: string;
};
type BracketMatch = {
  player1: { username: string };
  player2: { username: string } | null;
  winner: string | null;
};

export default function AdminPage() {
  const [auth, setAuth] = useState(false)
  const [passInput, setPassInput] = useState('')
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'upcoming',
    banner_url: '',
    register_link: '',
    registration_deadline: '', // new field
    game_id: '', // new field for game selection
  })
  const [loading, setLoading] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const loadTournaments = async () => {
    const { data } = await supabase.from('tournaments').select('*').order('created_at', { ascending: false })
    console.log('Fetched tournaments:', data)
    setTournaments(data || [])
  }

  const handleSubmit = async () => {
    setLoading(true);
    // Convert registration_deadline to UTC ISO string if present
    let deadline = form.registration_deadline;
    if (deadline) {
      const localDate = new Date(deadline);
      deadline = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000).toISOString();
    }
    const { error } = await supabase.from('tournaments').insert([{ ...form, status: 'upcoming', registration_deadline: deadline }])
    if (!error) {
      alert('Tournament added!')
      setForm({ title: '', description: '', status: '', banner_url: '', register_link: '', registration_deadline: '', game_id: '' })
      loadTournaments()
    } else {
      alert('Error: ' + error.message)
    }
    setLoading(false);
  }

  const deleteTournament = async (id: string) => {
    if (confirm('Are you sure?')) {
      await supabase.from('tournaments').delete().eq('id', id)
      loadTournaments()
    }
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileExt = file.name.split('.').pop();
    const filePath = `banners/${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage.from('banners').upload(filePath, file);
    if (error) {
      alert('Upload failed: ' + error.message);
      return;
    }
    const { data: urlData } = supabase.storage.from('banners').getPublicUrl(filePath);
    setForm({ ...form, banner_url: urlData.publicUrl });
  };

  useEffect(() => {
    if (auth) loadTournaments();
  }, [auth]);

  // Always load tournaments on mount, regardless of auth
  useEffect(() => {
    loadTournaments();
  }, []);

  // Persist admin auth in localStorage
  useEffect(() => {
    const storedAuth = localStorage.getItem('sg_admin_auth');
    if (storedAuth === 'true') setAuth(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('sg_admin_auth', auth ? 'true' : 'false');
  }, [auth]);

  const checkAuth = () => {
    if (passInput === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setAuth(true);
      localStorage.setItem('sg_admin_auth', 'true');
    } else {
      alert('Wrong password');
    }
  }

  // Bracket management for tournaments
  function BracketAdmin({ tournament }: { tournament: { id: string; title: string; status: string; registration_deadline?: string } }) {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [bracket, setBracket] = useState<BracketMatch[]>([]);
    const [round, setRound] = useState(1);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(tournament.status);
    const [bracketId, setBracketId] = useState<string | null>(null);

    // Fetch registrations and bracket state
    useEffect(() => {
      if (!tournament?.id) return;
      const fetchData = async () => {
        const { data: regs } = await supabase.from('registrations').select('*').eq('tournament_id', tournament.id);
        setRegistrations(regs || []);
        // Fetch bracket state
        const { data: bracketRows } = await supabase.from('tournament_brackets').select('*').eq('tournament_id', tournament.id).single();
        if (bracketRows) {
          setBracket(bracketRows.bracket_json || []);
          setRound(bracketRows.round || 1);
          setBracketId(bracketRows.id);
        } else if (regs && regs.length > 0) {
          // Generate and save new bracket if none exists
          const shuffled = [...regs].sort(() => Math.random() - 0.5);
          const pairs: BracketMatch[] = [];
          for (let i = 0; i < shuffled.length; i += 2) {
            pairs.push({
              player1: { username: shuffled[i].username },
              player2: shuffled[i + 1] ? { username: shuffled[i + 1].username } : null,
              winner: null,
            });
          }
          const { data: insertData } = await supabase.from('tournament_brackets').insert({
            tournament_id: tournament.id,
            bracket_json: pairs,
            round: 1
          }).select().single();
          setBracket(pairs);
          setRound(1);
          setBracketId(insertData?.id || null);
        }
        setLoading(false);
      };
      fetchData();
    }, [tournament]);

    // Move tournament to 'ongoing' when registration deadline passes
    useEffect(() => {
      if (status === 'upcoming' && tournament.registration_deadline) {
        const deadline = new Date(tournament.registration_deadline).getTime();
        const now = Date.now();
        if (now >= deadline) {
          supabase.from('tournaments').update({ status: 'ongoing' }).eq('id', tournament.id);
          setStatus('ongoing');
        }
      }
    }, [status, tournament]);

    // Save bracket state to Supabase
    const saveBracket = async (nextBracket: BracketMatch[], nextRound: number) => {
      if (!bracketId) return;
      await supabase.from('tournament_brackets').update({ bracket_json: nextBracket, round: nextRound }).eq('id', bracketId);
    };

    const pickWinner = async (matchIdx: number, winnerUsername: string) => {
      const updated = [...bracket];
      updated[matchIdx].winner = winnerUsername;
      setBracket(updated);
      await saveBracket(updated, round);
      // Add to leaderboard if final round
      if (updated.length === 1 && updated[0].winner) {
        await supabase.from('leaderboard').upsert(
          { username: updated[0].winner, score: 100, tournament_id: tournament.id },
          { onConflict: 'username,tournament_id' }
        );
        // Move tournament to 'past'
        await supabase.from('tournaments').update({ status: 'past' }).eq('id', tournament.id);
        setStatus('past');
      }
    };

    const advanceRound = async () => {
      const winners = bracket.map((m) => m.winner).filter((w): w is string => !!w);
      const nextPairs: BracketMatch[] = [];
      for (let i = 0; i < winners.length; i += 2) {
        nextPairs.push({
          player1: { username: winners[i] },
          player2: winners[i + 1] ? { username: winners[i + 1] } : null,
          winner: null,
        });
      }
      setBracket(nextPairs);
      setRound(r => r + 1);
      await saveBracket(nextPairs, round + 1);
    };

    if (loading) return <div>Loading bracket...</div>;
    if (!registrations.length) return <div>No registrations for this tournament.</div>;

    return (
      <div className="mb-10 super-glass p-6 md:p-8 rounded-2xl shadow-xl border border-orange-300/20">
        <h2 className="text-2xl font-bold text-orange-400 mb-3 font-['Exo_2'] drop-shadow">Bracket for <span className="text-orange-200">{tournament.title}</span></h2>
        <div className="mb-4 text-lg font-semibold text-orange-300">Round <span className="bg-orange-900 text-orange-200 px-3 py-1 rounded-full">{round}</span></div>
        <ul className="space-y-4">
          {bracket.map((match, i) => (
            <li key={i} className="flex flex-col md:flex-row gap-3 md:gap-6 items-center bg-black/30 border border-orange-400/10 rounded-xl px-4 py-3 shadow-md transition-all">
              <div className="flex-1 flex flex-col md:flex-row gap-2 md:gap-4 items-center">
                <span className="font-bold text-base md:text-lg text-orange-300 bg-orange-900/40 px-3 py-1 rounded-lg shadow">{match.player1.username}</span>
                <span className="text-gray-400 font-bold text-lg">vs</span>
                {match.player2 ? (
                  <span className="font-bold text-base md:text-lg text-orange-300 bg-orange-900/40 px-3 py-1 rounded-lg shadow">{match.player2.username}</span>
                ) : (
                  <span className="italic text-gray-500">(bye)</span>
                )}
              </div>
              <div className="flex gap-2 items-center">
                {!match.winner && match.player2 && (
                  <>
                    <button onClick={() => pickWinner(i, match.player1.username)} className="super-btn bg-green-600/90 hover:bg-green-400 text-white font-bold px-4 py-2 rounded-lg shadow transition-all">✔ {match.player1.username}</button>
                    <button onClick={() => pickWinner(i, match.player2!.username)} className="super-btn bg-green-600/90 hover:bg-green-400 text-white font-bold px-4 py-2 rounded-lg shadow transition-all">✔ {match.player2.username}</button>
                  </>
                )}
                {match.winner && (
                  <span className="ml-2 text-green-400 font-bold text-base flex items-center gap-1">🏅 Winner: <span className="underline underline-offset-4">{match.winner}</span></span>
                )}
              </div>
            </li>
          ))}
        </ul>
        {bracket.every(m => m.winner || !m.player2) && bracket.length > 1 && (
          <button onClick={advanceRound} className="super-btn mt-6 bg-orange-500 hover:bg-gradient-to-r hover:from-orange-400 hover:to-yellow-400 text-black px-6 py-3 text-lg shadow-lg">Advance to Next Round</button>
        )}
        {bracket.length === 1 && bracket[0].winner && (
          <div className="mt-8 text-3xl md:text-4xl text-orange-400 font-extrabold flex items-center gap-3 animate-super-float">
            🏆 <span className="drop-shadow-xl">Winner: <span className="text-yellow-300 underline underline-offset-4">{bracket[0].winner}</span></span>
          </div>
        )}
      </div>
    );
  }

  // Add a helper to get game data by id
  function getGameById(id: string) {
    return games.find(g => g.id === id);
  }

  // Helper function to format date in UTC+1
  function formatUTCDate(dateString: string | null): string {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    // Add 1 hour to convert from UTC to UTC+1
    const utcPlusOne = new Date(date.getTime() + (60 * 60 * 1000));
    return utcPlusOne.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC' // Keep in UTC since we've already added the hour
    });
  }

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto text-white super-fade-in">
      <h1 className="text-3xl md:text-4xl font-extrabold text-orange-400 mb-8 tracking-tight font-['Exo_2'] drop-shadow-lg">Admin Dashboard</h1>
      {/* Media upload for admins */}
      <MediaUpload />
      <BlogAdmin />
      {/* Tournament creation form */}
      <div className="super-glass p-6 md:p-8 mb-8 shadow-xl border border-orange-400/20">
        <h2 className="text-lg font-bold mb-2 text-orange-400">Create Tournament</h2>
        {/* Game selection dropdown only */}
        <select
          className="w-full p-2 mb-2 rounded bg-[#222]"
          value={form.game_id || ''}
          onChange={e => {
            const selected = games.find(g => g.id === e.target.value);
            if (selected) {
              setForm({
                ...form,
                game_id: selected.id,
                title: selected.name,
                description: selected.description,
                banner_url: selected.banner,
                // Optionally set other fields
              });
            } else {
              setForm({ ...form, game_id: '' });
            }
          }}
        >
          <option value="">Select Game</option>
          {games.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
        {/* Show other fields only after game is selected */}
        {form.game_id && (
          <>
            <div className="flex items-center gap-4 mb-4">
              <img src={getGameById(form.game_id)?.logo} alt="logo" className="w-14 h-14 rounded-xl bg-black border-2 border-orange-400 shadow-lg" />
              <img src={getGameById(form.game_id)?.banner} alt="banner" className="w-40 h-16 rounded-xl bg-black border-2 border-orange-400 object-cover shadow-md" />
            </div>
            <input
              placeholder="Title"
              className="w-full p-2 mb-2 rounded bg-[#222]"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <textarea
              placeholder="Description"
              className="w-full p-2 mb-2 rounded bg-[#222]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            {/* If game type is 'room', require room code/link */}
            {getGameById(form.game_id)?.type === 'room' && (
              <input
                placeholder="Room Link or Code (required)"
                className="w-full p-2 mb-2 rounded bg-[#222]"
                value={form.register_link}
                onChange={(e) => setForm({ ...form, register_link: e.target.value })}
                required
              />
            )}
            {/* If game type is 'pvp', allow optional register link */}
            {getGameById(form.game_id)?.type === 'pvp' && (
              <input
                placeholder="Register Link (optional)"
                className="w-full p-2 mb-2 rounded bg-[#222]"
                value={form.register_link}
                onChange={(e) => setForm({ ...form, register_link: e.target.value })}
              />
            )}
            <input
              type="datetime-local"
              className="w-full p-2 mb-2 rounded bg-[#222]"
              value={form.registration_deadline}
              onChange={(e) => setForm({ ...form, registration_deadline: e.target.value })}
              required
              placeholder="Registration Deadline"
            />
            <button
              onClick={handleSubmit}
              className="super-btn bg-orange-500 hover:bg-gradient-to-r hover:from-orange-400 hover:to-yellow-400 text-black px-6 py-3 text-lg mt-2 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Tournament'}
            </button>
          </>
        )}
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl md:text-3xl font-bold text-orange-400 mb-4 font-['Exo_2'] drop-shadow">🗂 Existing Tournaments</h2>
        {tournaments.map((t) => (
          <div key={t.id} className="super-glass p-5 md:p-7 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between mb-6 transition-transform duration-300 hover:scale-[1.02] hover:shadow-orange-400/40 border border-orange-400/20 group shadow-lg">
            <div className="flex-1">
              <p className="font-bold text-xl md:text-2xl text-orange-400 mb-1 font-['Exo_2']">{t.title}</p>
              <div className="flex flex-wrap gap-2 items-center mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${t.status === 'upcoming' ? 'bg-orange-900 text-orange-300' : t.status === 'ongoing' ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'}`}>{t.status.toUpperCase()}</span>
                <span className="text-xs text-gray-400">Deadline: <span className="text-orange-300 font-semibold">{formatUTCDate(t.registration_deadline ?? null)} (UTC+1)</span></span>
                <span className="text-xs text-gray-400">Game: <span className="text-orange-200 font-semibold">{t.game_id}</span></span>
              </div>
              <p className="text-sm text-gray-300 mb-2">{t.description}</p>
              <p className="text-xs text-gray-400 mb-2">Reg Link: <span className="text-blue-300 break-all">{t.register_link}</span></p>
            </div>
            <div className="flex flex-col gap-2 items-end min-w-[120px]">
              {(t.status === 'upcoming' || t.status === 'ongoing') && (
                <button
                  onClick={() => setForm({
                    title: t.title,
                    description: t.description,
                    status: t.status,
                    banner_url: t.banner_url || '',
                    register_link: t.register_link || '',
                    registration_deadline: t.registration_deadline || '',
                    game_id: t.game_id || '',
                  })}
                  className="super-btn text-xs text-blue-700 hover:text-white bg-blue-200/30 hover:bg-blue-400/80 px-4 py-2 mb-1"
                  title="Edit"
                >
                  Edit
                </button>
              )}
              <button
                onClick={() => deleteTournament(t.id)}
                className="super-btn text-xs text-red-500 hover:text-white bg-red-200/30 hover:bg-red-400/80 px-4 py-2"
                title="Delete"
              >
                ✕
              </button>
            </div>
            {/* Bracket admin for this tournament */}
            <BracketAdmin tournament={t} />
          </div>
        ))}
      </div>

      <LoserAdmin />
      <LeaderboardAdmin />
    </main>
  )
  
}
