"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type Tournament = { id: string; title: string };
type LeaderRow = { user_id: string; username: string; profile_picture_url?: string | null; x_handle?: string | null; points: number; tournaments_completed: number; href: string };

const POSITION_POINTS: Record<number, number> = { 1: 100, 2: 75, 3: 50, 4: 30, 5: 10 };

export default function GlobalLeaderboardPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'all'|'weekly'|'monthly'|'custom'>('all');
  const [customFrom, setCustomFrom] = useState<string>('');
  const [customTo, setCustomTo] = useState<string>('');
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [rawResults, setRawResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('tournaments').select('id,title').order('created_at', { ascending: false });
      setTournaments((data as Tournament[]) || []);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true); setError('');
      try {
        let q: any = supabase.from('tournament_results').select('user_id,position,tournament_id,created_at');
        if (selectedTournament !== 'all') q = q.eq('tournament_id', selectedTournament);
        if (timeRange === 'weekly') q = q.gte('created_at', new Date(Date.now() - 7*24*60*60*1000).toISOString());
        if (timeRange === 'monthly') q = q.gte('created_at', new Date(Date.now() - 30*24*60*60*1000).toISOString());
        if (timeRange === 'custom' && customFrom) {
          q = q.gte('created_at', new Date(customFrom).toISOString());
          if (customTo) q = q.lte('created_at', new Date(customTo).toISOString());
        }
    const { data: results, error: resultsError } = await q;
        if (resultsError) throw resultsError;
    setRawResults(results || []);

        const stats: Record<string, { points: number; tournaments: Set<string> }> = {};
        (results || []).forEach((r: any) => {
          const u = r.user_id; if (!u) return;
          if (!stats[u]) stats[u] = { points: 0, tournaments: new Set() };
          stats[u].points += POSITION_POINTS[r.position] || 0;
          stats[u].tournaments.add(r.tournament_id);
        });


        const uids = Object.keys(stats);

        // Only match user_profiles by user_id
        let profiles: any[] = [];
        if (uids.length > 0) {
          const { data } = await supabase.from('user_profiles').select('user_id,username,profile_picture_url,twitter_handle').in('user_id', uids);
          profiles = data || [];
        }

        const mapByUserId = new Map((profiles as any[]).map((p: any) => [p.user_id, p]));

        const merged: LeaderRow[] = uids.map(u => {
          const p = mapByUserId.get(u) || null;
          const displayName = p?.username || u;
          const href = `/profile/${u}`;
          return {
            user_id: u,
            username: displayName,
            profile_picture_url: p?.profile_picture_url || null,
            x_handle: p?.twitter_handle || null,
            points: stats[u].points,
            tournaments_completed: stats[u].tournaments.size,
            href
          };
        }).sort((a,b) => b.points - a.points);

        setRows(merged);
      } catch (e: any) { console.error(e); setError(e?.message || String(e)); }
      finally { setLoading(false); }
    })();
  }, [selectedTournament, timeRange, customFrom, customTo]);

  return (
    <main className="min-h-screen p-6 text-white max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-orange-400">Global Leaderboard</h1>

      <div className="mb-4 relative z-10 flex gap-3 items-center">
        <select value={selectedTournament} onChange={e => setSelectedTournament(e.target.value)} className="bg-[#111] p-2 rounded">
          <option value="all">All tournaments ({tournaments.length})</option>
          {tournaments.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>

        <select value={timeRange} onChange={e => setTimeRange(e.target.value as any)} className="bg-[#111] p-2 rounded">
          <option value="all">All time</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="custom">Custom</option>
        </select>

        {timeRange === 'custom' && (
          <>
            <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="p-2 bg-[#111] rounded" />
            <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="p-2 bg-[#111] rounded" />
          </>
        )}
      </div>

  {/* ...existing code... */}

      {loading && <div className="text-gray-400">Loading...</div>}
      <div className="bg-[#18181b] relative z-10 rounded p-3 sm:p-4">
        <table className="w-full table-fixed">
          <colgroup>
            <col className="w-7 sm:w-10" />
            <col className="w-[47%] sm:w-[52%]" />
            <col className="w-[19%] sm:w-[18%]" />
            <col className="w-[19%] sm:w-[18%]" />
          </colgroup>
          <thead>
            <tr className="text-left text-gray-300 text-xs sm:text-sm">
              <th className="py-1 sm:py-2 font-medium">#</th>
              <th className="py-1 sm:py-2 font-medium">Player</th>
              <th className="py-1 sm:py-2 font-medium text-right">Points</th>
              <th className="py-1 sm:py-2 font-medium text-right">Tournaments</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.user_id} className="border-t border-[#222]">
                <td className="py-1.5 sm:py-2 align-middle text-[11px] sm:text-sm">{i+1}</td>
                <td className="py-2 sm:py-3 align-middle">
                  <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                    {r.profile_picture_url
                      ? <img src={r.profile_picture_url} alt={r.username} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-none" />
                      : <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-700 flex items-center justify-center flex-none text-xs sm:text-sm">{r.username?.[0]?.toUpperCase()}</div>}
                    <div className="break-words">
                      <div className="font-semibold leading-tight text-[13px] sm:text-base">{r.username}</div>
                      <div className="text-[10px] sm:text-xs leading-tight">
                        {r.x_handle
                          ? <a className="text-blue-400 hover:underline" href={`https://x.com/${r.x_handle.replace(/^@/, '')}`} target="_blank" rel="noreferrer">@{r.x_handle.replace(/^@/, '')}</a>
                          : <span className="text-gray-500">-</span>}
                      </div>
                      <Link href={r.href} className="text-[10px] sm:text-xs text-gray-400 hover:text-gray-300">View profile</Link>
                    </div>
                  </div>
                </td>
                <td className="py-1.5 sm:py-2 align-middle font-semibold text-orange-300 text-[11px] sm:text-sm whitespace-nowrap text-right pr-3 sm:pr-4">{r.points}</td>
                <td className="py-1.5 sm:py-2 align-middle text-[11px] sm:text-sm whitespace-nowrap text-right pl-1 sm:pl-2">{r.tournaments_completed}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && !loading && <div className="text-gray-400 mt-4">No leaderboard data for selected filters.</div>}
      </div>
    </main>
  );
}

