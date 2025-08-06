
"use client";
import React, { useState, useEffect } from "react";
import { games } from "../gamesData";
import { supabase } from "@/lib/supabase";

// Reuse the points logic
const calculatePoints = (position: number): number => {
  switch(position) {
    case 1: return 100;
    case 2: return 75;
    case 3: return 50;
    default: return 10;
  }
};

export default function GlobalLeaderboardPage() {
  const [selectedGame, setSelectedGame] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("all");
  const [customRange, setCustomRange] = useState<{from: string, to: string}>({from: "", to: ""});
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      let query = supabase.from("tournaments").select("id, title, game_id, created_at");
      if (selectedGame !== "all") query = query.eq("game_id", selectedGame);
      if (timeRange === "week") {
        const from = new Date();
        from.setDate(from.getDate() - 7);
        query = query.gte("created_at", from.toISOString());
      } else if (timeRange === "month") {
        const from = new Date();
        from.setMonth(from.getMonth() - 1);
        query = query.gte("created_at", from.toISOString());
      } else if (timeRange === "custom" && customRange.from && customRange.to) {
        query = query.gte("created_at", customRange.from).lte("created_at", customRange.to);
      }
      const { data: tournaments } = await query;
      if (!tournaments) { setLeaderboard([]); setLoading(false); return; }
      // Fetch leaderboard entries for all tournaments
      let allEntries: any[] = [];
      for (const tournament of tournaments) {
        const { data: entries } = await supabase
          .from("leaderboard")
          .select("id, username, score, x_handle")
          .eq("tournament_id", tournament.id)
          .order("score", { ascending: false });
        if (entries) {
          const entriesWithPosition = entries.map((entry, idx) => ({
            ...entry,
            position: idx + 1,
            tournament_id: tournament.id,
            tournament_title: tournament.title || "Unknown Tournament",
            game_id: tournament.game_id
          }));
          allEntries.push(...entriesWithPosition);
        }
      }
      // Calculate global leaderboard
      const globalScores: {[key: string]: any} = {};
      allEntries.forEach(entry => {
        if (!globalScores[entry.username]) {
          globalScores[entry.username] = {
            username: entry.username,
            totalScore: 0,
            tournamentsPlayed: 0,
            x_handle: entry.x_handle
          };
        }
        globalScores[entry.username].totalScore += calculatePoints(entry.position);
        globalScores[entry.username].tournamentsPlayed++;
      });
      const sortedLeaderboard = Object.values(globalScores).sort((a: any, b: any) => b.totalScore - a.totalScore);
      setLeaderboard(sortedLeaderboard);
      setLoading(false);
    }
    fetchLeaderboard();
  }, [selectedGame, timeRange, customRange]);

  return (
    <main className="min-h-screen p-2 max-w-xl mx-auto text-white">
      <div className="bg-[#18181b] relative z-10 rounded-xl p-2 shadow-lg">
        <h1 className="text-xl font-bold mb-1 text-orange-400 font-['Exo_2']">Global Leaderboard</h1>
        <div className="flex flex-wrap gap-2 mb-4">
          <select value={selectedGame} onChange={e => setSelectedGame(e.target.value)} className="bg-[#222] text-white rounded px-2 py-1">
            <option value="all">All Games</option>
            {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <select value={timeRange} onChange={e => setTimeRange(e.target.value)} className="bg-[#222] text-white rounded px-2 py-1">
            <option value="all">All Time</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom</option>
          </select>
          {timeRange === "custom" && (
            <>
              <input type="date" value={customRange.from} onChange={e => setCustomRange(r => ({...r, from: e.target.value}))} className="bg-[#222] text-white rounded px-2 py-1" />
              <input type="date" value={customRange.to} onChange={e => setCustomRange(r => ({...r, to: e.target.value}))} className="bg-[#222] text-white rounded px-2 py-1" />
            </>
          )}
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : leaderboard.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No leaderboard entries yet.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-800">
            <table className="w-full bg-[#222] rounded-xl overflow-hidden text-xs">
              <thead>
                <tr className="bg-[#18181b] text-left">
                  <th className="py-1 px-2 font-semibold text-gray-300">#</th>
                  <th className="py-1 px-2 font-semibold text-gray-300">Player</th>
                  <th className="py-1 px-2 font-semibold text-gray-300 text-right">Total Points</th>
                  <th className="py-1 px-2 font-semibold text-gray-300 text-center">Tournaments</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <tr key={entry.username} className={`border-t border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors ${index < 3 ? 'bg-gradient-to-r from-yellow-900/20 to-transparent' : ''}`}>
                    <td className="py-1 px-2">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full mr-1.5 ${
                          index === 0 ? 'bg-yellow-500 text-black' : 
                          index === 1 ? 'bg-gray-400 text-black' : 
                          index === 2 ? 'bg-amber-700 text-white' : 'bg-gray-700 text-white'
                        } font-bold`}>
                          {index + 1}
                        </span>
                        {index < 3 && (
                          <span className="ml-1">
                            {index === 0 ? '🏆' : index === 1 ? '🥈' : '🥉'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-1 px-2 font-medium">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-gray-700 mr-1.5 overflow-hidden">
                          {entry.x_handle && (
                            <img 
                              src={`/api/proxy-avatar?handle=${encodeURIComponent(entry.x_handle.replace('@',''))}`} 
                              alt={entry.username}
                              className="w-full h-full object-cover"
                              onError={e => { (e.target as HTMLImageElement).src = '/default-pfp.png'; }}
                            />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-xs">{entry.username}</div>
                          {entry.x_handle && (
                            <a 
                              href={`https://x.com/${entry.x_handle.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-gray-400 hover:text-orange-400 flex items-center gap-1"
                              onClick={e => e.stopPropagation()}
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                              </svg>
                              {entry.x_handle}
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-1 px-2 text-right font-bold text-sm">
                      {entry.totalScore}
                    </td>
                    <td className="py-1 px-2 text-center">
                      <div className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-800 text-gray-300">
                        {entry.tournamentsPlayed} {entry.tournamentsPlayed === 1 ? 'tournament' : 'tournaments'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}


