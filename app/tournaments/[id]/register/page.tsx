// app/tournaments/[id]/page.tsx

"use client";
import { useEffect, useState, useRef } from "react";
import { games } from '@/app/gamesData';
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import html2canvas from 'html2canvas';

interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  tournament_id: string;
  x_handle?: string;
}

type Tournament = {
  id: string;
  title: string;
  description: string;
  status: "upcoming" | "ongoing" | "past";
  banner_url: string | null;
  register_link: string | null;
  created_at?: string;
  rules?: string | null;
  game_id?: string;
};

interface Registration {
  id: string;
  username: string;
  game_id: string;
  x_handle?: string;
  created_at: string;
}

export default function TournamentDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined;
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [registrationDeadline, setRegistrationDeadline] = useState<string | null>(null);
  const [registrationTimeLeft, setRegistrationTimeLeft] = useState<string>("");
  const [registered, setRegistered] = useState(false);
  const [regForm, setRegForm] = useState({
    secret_code: "",
    x_handle: "",
  });
  const [userData, setUserData] = useState<{
    username: string;
    game_id: string;
  } | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  // Bracket logic
  const [bracket, setBracket] = useState<any[]>([]);
  const [round, setRound] = useState(1);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [loser, setLoser] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      const { data: t } = await supabase.from("tournaments").select("*").eq("id", id).single();
      setTournament(t);
      setRegistrationDeadline(t?.registration_deadline || null);
      const { data: lb } = await supabase.from("leaderboard").select("*").eq("tournament_id", id).order("score", { ascending: false });
      setLeaderboard(lb || []);
      // Fetch registrations
      const { data: regs } = await supabase.from("registrations").select("*").eq("tournament_id", id);
      setRegistrations(regs || []);

      setLoading(false);
    };
    fetchData();
  }, [id]);

  // Timer logic
  useEffect(() => {
    if (!registrationDeadline) return;
    const interval = setInterval(() => {
      const diff = new Date(registrationDeadline).getTime() - Date.now();
      if (diff <= 0) {
        setRegistrationTimeLeft("Registration closed");
        clearInterval(interval);
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setRegistrationTimeLeft(`${mins}m ${secs}s left`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [registrationDeadline]);

  const lookupUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingUser(true);
    setCodeError("");
    
    try {
      // First get the user's identity
      const { data: identity, error: identityError } = await supabase
        .from('player_identities')
        .select('id, username, twitter')
        .eq('secret_code', regForm.secret_code.trim())
        .single();

      if (identityError || !identity) {
        setCodeError("Invalid secret code. Please check and try again.");
        setLoadingUser(false);
        return;
      }

      // Then get the user's game ID for this tournament's game
      const { data: gameData, error: gameError } = await supabase
        .from('player_game_ids')
        .select('game_id, player_game_id')
        .eq('user_id', identity.id)
        .eq('game_id', tournament?.game_id)
        .single();

      if (gameError || !gameData) {
        setCodeError(`You haven't registered a game ID for this tournament's game.`);
        setLoadingUser(false);
        return;
      }

      setUserData({
        username: identity.username,
        game_id: gameData.player_game_id
      });
      
      // Auto-fill Twitter handle if not already set
      if (identity.twitter && !regForm.x_handle) {
        setRegForm(prev => ({ ...prev, x_handle: identity.twitter }));
      }
      
    } catch (err) {
      console.error('Error looking up user:', err);
      setCodeError('An error occurred. Please try again.');
    }
    
    setLoadingUser(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;
    
    const { error } = await supabase.from("registrations").insert([{ 
      username: userData.username,
      game_id: userData.game_id,
      x_handle: regForm.x_handle,
      tournament_id: id 
    }]);
    
    if (!error) {
      setRegistered(true);
      setRegistrations([...registrations, { 
        username: userData.username, 
        game_id: userData.game_id, 
        x_handle: regForm.x_handle,
        id: "", 
        created_at: new Date().toISOString() 
      }]);
    } else {
      alert("Registration failed: " + error.message);
    }
  };

  // Bracket logic: fetch from tournament_brackets table and subscribe to updates
  useEffect(() => {
    if (!id) return;
    let subscription: any;
    const fetchBracket = async () => {
      const { data: bracketRow } = await supabase
        .from('tournament_brackets')
        .select('*')
        .eq('tournament_id', id)
        .single();
      if (bracketRow) {
        setBracket(bracketRow.bracket_json || []);
        setRound(bracketRow.round || 1);
      } else if (registrationTimeLeft === "Registration closed" && registrations.length > 0) {
        // Only generate if no bracket exists in DB
        const shuffled = [...registrations].sort(() => Math.random() - 0.5);
        const pairs = [];
        for (let i = 0; i < shuffled.length; i += 2) {
          pairs.push({
            player1: shuffled[i],
            player2: shuffled[i + 1] || null,
            winner: null,
          });
        }
        setBracket(pairs);
        setRound(1);
      }
    };
    fetchBracket();

    // Subscribe to bracket updates
    subscription = supabase
      .channel('public:tournament_brackets')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tournament_brackets',
        filter: `tournament_id=eq.${id}`
      }, (payload: any) => {
        if (payload.new) {
          setBracket(payload.new.bracket_json || []);
          setRound(payload.new.round || 1);
        }
      })
      .subscribe();

    return () => {
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe();
      } else if (supabase.removeChannel) {
        supabase.removeChannel(subscription);
      }
    };
  }, [id, registrationTimeLeft, registrations]);

  // Simple admin check (client-side only)
  const checkAdmin = () => {
    if (adminPass === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) setIsAdmin(true);
    else alert('Wrong password');
  };

  // Advance to next round
  const advanceRound = () => {
    const winners = bracket.map((m: any) => m.winner).filter(Boolean);
    const nextPairs = [];
    for (let i = 0; i < winners.length; i += 2) {
      nextPairs.push({
        player1: { username: winners[i] },
        player2: winners[i + 1] ? { username: winners[i + 1] } : null,
        winner: null,
      });
    }
    setBracket(nextPairs);
    setRound(r => r + 1);
  };

  // Automatically add the winner and top 3 to the leaderboard when the bracket is finished, without admin input.
  useEffect(() => {
    // Removed automatic addition of 2nd and 3rd place to leaderboard. Now handled manually.
  }, [bracket, id, supabase]);

  useEffect(() => {
    if (!id) return;
    const fetchLoser = async () => {
      const { data } = await supabase.from('losers').select('*').eq('tournament_id', id).single();
      setLoser(data || null);
    };
    fetchLoser();
  }, [id]);

  // Helper to get x_handle from registrations
  function getXHandle(username: string) {
    const reg = registrations.find(r => r.username === username);
    return reg?.x_handle || '';
  }

  // Download handler for podium
  const downloadPodium = async () => {
    const node = document.getElementById('podium-card');
    if (!node) return;
    const canvas = await html2canvas(node, { useCORS: true });
    const link = document.createElement('a');
    link.download = 'podium.png';
    link.href = canvas.toDataURL();
    link.click();
  };
  // Download handler for loser SBT
  const downloadLoser = async () => {
    const node = document.getElementById('loser-sbt-card');
    if (!node) return;
    const canvas = await html2canvas(node, { useCORS: true });
    const link = document.createElement('a');
    link.download = 'loser-sbt.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  if (loading) return <main className="min-h-screen p-6 text-white">Loading...</main>;
  if (!tournament) return <main className="min-h-screen p-6 text-white">Tournament not found.</main>;

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto text-white">
      {tournament.banner_url && (
        <img src={tournament.banner_url} alt="Banner" className="w-full h-56 object-cover rounded-xl mb-4" />
      )}
      <h1 className="text-3xl font-bold mb-2 text-orange-400 font-['Exo_2']">{tournament.title}</h1>
      <p className="mb-4 text-gray-300">{tournament.description}</p>
      {/* Only show registered gamers for PvP games */}
      {(() => {
        const gameMeta = games.find(g => g.id === tournament?.game_id);
        if (registrationTimeLeft !== 'Registration closed' && gameMeta?.type === 'pvp') {
          return (
            <div className="mb-6 bg-[#18181b] relative z-10 p-4 rounded-xl">
              <h3 className="text-xl font-bold mb-2 text-orange-400 font-['Exo_2']">Registered Gamers</h3>
              {registrations.length === 0 ? (
                <p className="text-gray-400">No one has registered yet.</p>
              ) : (
                <ul className="list-disc pl-6">
                  {registrations.map((r) => (
                    <li key={r.id} className="mb-1">
                      <span className="font-semibold">{r.username}</span> <span className="text-gray-400">({r.game_id})</span>
                      {r.x_handle && (
                        <a href={`https://x.com/${r.x_handle.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-400 hover:underline">@{r.x_handle.replace(/^@/, '')}</a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        } else if (registrationTimeLeft === 'Registration closed') {
          // bracket logic
          return (
            <div className="mb-6 bg-[#18181b] relative z-10 p-4 rounded-xl">
              <h3 className="text-xl font-bold mb-2 text-orange-400 font-['Exo_2']">Elimination Bracket</h3>
              {bracket.length === 0 ? (
                <p className="text-gray-400">Bracket will be generated soon.</p>
              ) : (
                <ul className="space-y-2">
                  {bracket.map((match, i) => {
                    // Helper to get registration info
                    const getReg = (username: string) => registrations.find(r => r.username === username);
                    const p1 = getReg(match.player1.username) || { username: match.player1.username, game_id: undefined, x_handle: undefined };
                    const p2 = match.player2 ? (getReg(match.player2.username) || { username: match.player2.username, game_id: undefined, x_handle: undefined }) : null;
                    return (
                      <li key={i} className="flex gap-4 items-center">
                        <span className="font-semibold flex items-center gap-1">
                          {p1.username}
                          {p1.game_id && <span className="text-gray-400 text-xs">({p1.game_id})</span>}
                          {p1.x_handle && (
                            <a href={`https://x.com/${p1.x_handle.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-400 hover:underline" title={`@${p1.x_handle.replace(/^@/, '')}`}>
                              <svg className="inline w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            </a>
                          )}
                        </span>
                        <span className="text-gray-400">vs</span>
                        {p2 ? (
                          <span className="font-semibold flex items-center gap-1">
                            {p2.username}
                            {p2.game_id && <span className="text-gray-400 text-xs">({p2.game_id})</span>}
                            {p2.x_handle && (
                              <a href={`https://x.com/${p2.x_handle.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-400 hover:underline" title={`@${p2.x_handle.replace(/^@/, '')}`}>
                                <svg className="inline w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                              </a>
                            )}
                          </span>
                        ) : (
                          <span className="italic text-gray-500">(bye)</span>
                        )}
                        {match.winner && (
                          <span className="ml-4 text-green-400">Winner: {match.winner}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        }
        return null;
      })()}
      {/* Show more info if available */}
      {tournament.created_at && (
        <p className="mb-2 text-gray-400 text-sm">Created: {new Date(tournament.created_at).toLocaleString()}</p>
      )}
      {tournament.rules && (
        <div className="mb-4">
          <h3 className="font-semibold text-lg mb-1">Rules</h3>
          <div className="prose prose-invert text-gray-200" dangerouslySetInnerHTML={{ __html: tournament.rules }} />
        </div>
      )}
      {/* Show leaderboard only after bracket, not at the same time as bracket */}
      {registrationTimeLeft === 'Registration closed' && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-orange-400 mb-6 text-center font-['Exo_2']">Tournament Leaderboard</h2>
          
          {/* Enhanced Podium Card */}
          {leaderboard.length > 0 && (
            <div className="flex flex-col items-center mb-6">
              <div id="podium-card" className="relative w-full max-w-xs h-52 sm:h-60 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-orange-500/30 rounded-2xl shadow-xl p-1 sm:p-2 backdrop-blur-sm flex flex-col justify-between">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-10 rounded-xl"></div>
                {/* Podium Title */}
                <div className="text-center mb-1 relative z-10">
                  <h3 className="text-base font-bold text-orange-400 font-['Exo_2']">TOURNAMENT CHAMPIONS</h3>
                  {tournament && (
                    <p className="text-xs text-gray-300 mt-0.5">{tournament.title}</p>
                  )}
                </div>
                {/* Podium Places */}
                <div className="flex flex-row justify-center items-end gap-1 md:gap-2 relative z-10 h-20 sm:h-24 w-full">
                  {/* 2nd Place */}
                  {leaderboard[1] && (
                    <div className="flex-1 flex flex-col items-center justify-end transform transition-all duration-300 hover:scale-105 min-w-0">
                      <div className="relative mb-2">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-silver-500 to-gray-400 rounded-full blur opacity-40"></div>
                        <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full border border-slate-400 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
                          <img 
                            src={leaderboard[1].x_handle ? `/api/proxy-avatar?handle=${encodeURIComponent(leaderboard[1].x_handle.replace('@',''))}` : '/default-pfp.png'} 
                            alt="2nd Place" 
                            className="w-full h-full object-cover" 
                            onError={e => { e.currentTarget.src = '/default-pfp.png'; }} 
                          />
                        </div>
                      </div>
                      <div className="text-center px-1">
                        <div className="text-[10px] font-bold text-white mb-0.5 truncate max-w-[60px]">{leaderboard[1].username}</div>
                        <div className="text-[9px] text-gray-300 mb-1">2nd</div>
                        {leaderboard[1].x_handle && (
                          <a 
                            href={`https://x.com/${leaderboard[1].x_handle.replace('@','')}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-orange-400 hover:text-orange-300 transition-colors text-xs flex items-center justify-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                            {leaderboard[1].x_handle.replace('@','')}
                          </a>
                        )}
                        <div className="mt-0.5 text-yellow-300 font-bold text-[10px]">{leaderboard[1].score} pts</div>
                      </div>
                      <div className="w-8 h-1 bg-gradient-to-r from-slate-500 to-slate-400 mt-1 rounded-b-lg"></div>
                    </div>
                  )}

                  {/* 1st Place - Champion */}
                  {leaderboard[0] && (
                    <div className="flex-1 flex flex-col items-center justify-end transform transition-all duration-300 hover:scale-105 min-w-0">
                      <div className="relative mb-2">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full blur opacity-40 animate-pulse"></div>
                        <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-yellow-400 bg-gradient-to-br from-yellow-600 to-yellow-800 flex items-center justify-center overflow-hidden">
                          <img 
                            src={leaderboard[0].x_handle ? `/api/proxy-avatar?handle=${encodeURIComponent(leaderboard[0].x_handle.replace('@',''))}` : '/default-pfp.png'} 
                            alt="1st Place" 
                            className="w-full h-full object-cover" 
                            onError={e => { e.currentTarget.src = '/default-pfp.png'; }} 
                          />
                        </div>
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black text-[9px] font-bold px-1 py-0.5 rounded-full whitespace-nowrap">
                          🏆 CHAMP
                        </div>
                      </div>
                      <div className="text-center px-1">
                        <div className="text-xs font-bold text-white mb-0.5 truncate max-w-[60px]">{leaderboard[0].username}</div>
                        <div className="text-[10px] text-yellow-300 mb-1">1st</div>
                        {leaderboard[0].x_handle && (
                          <a 
                            href={`https://x.com/${leaderboard[0].x_handle.replace('@','')}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-yellow-400 hover:text-yellow-300 transition-colors text-xs flex items-center justify-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                            {leaderboard[0].x_handle.replace('@','')}
                          </a>
                        )}
                        <div className="mt-0.5 text-yellow-300 font-bold text-[10px]">{leaderboard[0].score} pts</div>
                      </div>
                      <div className="w-10 h-1 bg-gradient-to-r from-yellow-500 to-yellow-300 mt-1 rounded-b-lg"></div>
                    </div>
                  )}

                  {/* 3rd Place */}
                  {leaderboard[2] && (
                    <div className="flex-1 flex flex-col items-center justify-end transform transition-all duration-300 hover:scale-105 min-w-0">
                      <div className="relative mb-2">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-600 to-amber-800 rounded-full blur opacity-40"></div>
                        <div className="relative w-7 h-7 md:w-8 md:h-8 rounded-full border border-amber-600 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
                          <img 
                            src={leaderboard[2].x_handle ? `/api/proxy-avatar?handle=${encodeURIComponent(leaderboard[2].x_handle.replace('@',''))}` : '/default-pfp.png'} 
                            alt="3rd Place" 
                            className="w-full h-full object-cover" 
                            onError={e => { e.currentTarget.src = '/default-pfp.png'; }} 
                          />
                        </div>
                      </div>
                      <div className="text-center px-1">
                        <div className="text-[10px] font-bold text-white mb-0.5 truncate max-w-[60px]">{leaderboard[2].username}</div>
                        <div className="text-[9px] text-gray-300 mb-1">3rd</div>
                        {leaderboard[2].x_handle && (
                          <a 
                            href={`https://x.com/${leaderboard[2].x_handle.replace('@','')}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-amber-400 hover:text-amber-300 transition-colors text-xs flex items-center justify-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                            {leaderboard[2].x_handle.replace('@','')}
                          </a>
                        )}
                        <div className="mt-0.5 text-amber-300 font-bold text-[10px]">{leaderboard[2].score} pts</div>
                      </div>
                      <div className="w-7 h-1 bg-gradient-to-r from-amber-600 to-amber-800 mt-1 rounded-b-lg"></div>
                    </div>
                  )}
                </div>
              </div>
              {/* Download Button OUTSIDE the podium card */}
              <div className="flex justify-center mt-4">
                <button 
                  onClick={downloadPodium}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                  Save Podium
                </button>
              </div>
            </div>
          )}
          {leaderboard.length === 0 ? (
            <p className="text-gray-400">No entries yet.</p>
          ) : (
            <table className="w-full bg-[#222] rounded-xl overflow-hidden">
              <thead>
                <tr className="text-left bg-[#18181b]">
                  <th className="py-2 px-4">#</th>
                  <th className="py-2 px-4">Username</th>
                  <th className="py-2 px-4">Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.slice(3).map((entry, i) => (
                  <tr key={entry.id} className="border-t border-[#333]">
                    <td className="py-2 px-4">{i + 4}</td>
                    <td className="py-2 px-4">{entry.username}</td>
                    <td className="py-2 px-4">{entry.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {/* Loser SBT Card */}
          {loser && (
            <div className="mt-8 flex flex-col items-center">
              <div id="loser-sbt-card" className="bg-gradient-to-br from-red-900 via-orange-900 to-black border-4 border-red-700 rounded-2xl shadow-2xl p-6 flex flex-col items-center max-w-xs animate-fade-in-up relative">
                <button onClick={downloadLoser} title="Download Loser SBT" className="absolute top-2 right-2 p-1 rounded-full bg-red-500 hover:bg-red-600 text-white shadow flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 6-6M12 18.75V3" />
                  </svg>
                </button>
                <img src={loser.x_handle ? `/api/proxy-avatar?handle=${encodeURIComponent(loser.x_handle.replace('@',''))}` : (loser.pfp_url || '/default-pfp.png')} alt="Loser PFP" className="w-24 h-24 rounded-full border-4 border-red-500 object-cover bg-black mb-4" onError={e => { e.currentTarget.src = '/default-pfp.png'; }} />
                <h3 className="text-2xl font-extrabold text-red-400 mb-2 drop-shadow">LOSER SBT</h3>
                <div className="text-lg font-bold text-orange-200 mb-1">{loser.username}</div>
                <a href={`https://x.com/${loser.x_handle.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="text-orange-400 underline text-base mb-2">@{loser.x_handle.replace('@','')}</a>
                <div className="text-xs text-gray-400 italic">Awarded for finishing last in this tournament</div>
              </div>
            </div>
          )}
        </div>
      )}
      {tournament.status === "upcoming" && registrationDeadline && registrationTimeLeft !== "Registration closed" && !registered && (() => {
        const gameMeta = games.find(g => g.id === tournament.game_id);
        if (gameMeta && gameMeta.type === 'room') {
          return (
            <div className="mb-6 bg-[#18181b] relative z-10 p-4 rounded-xl">
              <h3 className="text-lg font-semibold mb-2">Room Link / Code</h3>
              <p className="mb-2 text-orange-400">Registration closes in: {registrationTimeLeft}</p>
              {tournament.register_link ? (
                (() => {
                  // Simple URL check
                  const isUrl = /^https?:\/\//i.test(tournament.register_link.trim());
                  if (isUrl) {
                    return (
                      <a
                        href={tournament.register_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xl text-blue-400 break-all font-mono border border-blue-400 rounded p-3 bg-black/30 text-center underline hover:text-blue-300"
                      >
                        {tournament.register_link}
                      </a>
                    );
                  } else {
                    return (
                      <div className="text-xl text-blue-400 break-all font-mono border border-blue-400 rounded p-3 bg-black/30 text-center">
                        {tournament.register_link}
                      </div>
                    );
                  }
                })()
              ) : (
                <span className="text-gray-400">No room link/code provided yet.</span>
              )}
              {gameMeta.external_link && (
                <div className="mt-4">
                  <span className="font-semibold text-orange-400">Game Site:</span> <a href={gameMeta.external_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">{gameMeta.external_link}</a>
                </div>
              )}
            </div>
          );
        }
        // Otherwise, show registration form for PvP games
        return (
          <div className="mb-6 bg-[#18181b] relative z-10 p-4 rounded-xl">
            <h3 className="text-lg font-semibold mb-2">Register for this tournament</h3>
            <p className="mb-2 text-orange-400">Registration closes in: {registrationTimeLeft}</p>
            
            {!userData ? (
              <form onSubmit={lookupUser} className="flex flex-col gap-2 mb-4">
                <div className="relative">
                  <input
                    placeholder="Enter your secret code"
                    className="p-2 rounded bg-[#18181b] relative z-10 w-full"
                    value={regForm.secret_code}
                    onChange={(e) => setRegForm({ ...regForm, secret_code: e.target.value })}
                    required
                  />
                  {codeError && (
                    <p className="text-red-400 text-sm mt-1">{codeError}</p>
                  )}
                </div>
                <button 
                  type="submit" 
                  className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 flex items-center justify-center"
                  disabled={loadingUser}
                >
                  {loadingUser ? 'Looking up...' : 'Verify Code'}
                </button>
              </form>
            ) : (
              <div className="mb-4 p-3 bg-green-900/30 border border-green-500/50 rounded">
                <p className="text-green-300">Welcome back, <span className="font-semibold">{userData.username}</span>!</p>
                <p className="text-sm text-green-200 mt-1">Game ID: {userData.game_id}</p>
                <button 
                  onClick={() => setUserData(null)} 
                  className="text-xs text-orange-300 hover:text-orange-400 mt-2"
                >
                  Not you? Use a different code
                </button>
              </div>
            )}
            
            <form onSubmit={handleRegister} className="flex flex-col gap-2">
              <input
                placeholder="X / Twitter handle (optional)"
                className="p-2 rounded bg-[#18181b]"
                value={regForm.x_handle}
                onChange={(e) => setRegForm({ ...regForm, x_handle: e.target.value })}
              />
              <button 
                type="submit" 
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
                disabled={!userData || loading}
              >
                {loading ? 'Registering...' : 'Complete Registration'}
              </button>
            </form>
          </div>
        );
      })()}
    </main>
  );
}
