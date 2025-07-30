'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface GlobalLeaderboardEntry {
  username: string;
  totalScore: number;
  tournamentsPlayed: number;
  x_handle?: string;
}

interface TournamentEntry {
  id: string;
  username: string;
  score: number;
  position: number;
  tournament_id: string;
  tournament_title: string;
  x_handle?: string;
}

// Function to calculate points based on position
const calculatePoints = (position: number): number => {
  switch(position) {
    case 1: return 100;
    case 2: return 75;
    case 3: return 50;
    default: return 10;
  }
};

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<GlobalLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tournamentHistory, setTournamentHistory] = useState<{[key: string]: TournamentEntry[]}>({});

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // First, get all tournaments
        const { data: tournaments } = await supabase
          .from('tournaments')
          .select('id, title');

        if (!tournaments) return;

        // Fetch leaderboard entries for all tournaments and process them
        const allEntries: TournamentEntry[] = [];
        
        for (const tournament of tournaments) {
          const { data: entries } = await supabase
            .from('leaderboard')
            .select('id, username, score, x_handle')
            .eq('tournament_id', tournament.id)
            .order('score', { ascending: false });

          if (entries) {
            // Add position to each entry
            const entriesWithPosition = entries.map((entry, index) => ({
              ...entry,
              position: index + 1,
              tournament_id: tournament.id,
              tournament_title: tournament.title || 'Unknown Tournament'
            }));
            
            allEntries.push(...entriesWithPosition);
          }
        }

        // Process to calculate global leaderboard
        const globalScores: {[key: string]: GlobalLeaderboardEntry} = {};
        
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

        // Convert to array and sort by total score
        const sortedLeaderboard = Object.values(globalScores).sort((a, b) => b.totalScore - a.totalScore);
        
        // Group entries by tournament for the tournament history
        const tournamentHistoryMap: {[key: string]: TournamentEntry[]} = {};
        allEntries.forEach(entry => {
          if (!tournamentHistoryMap[entry.username]) {
            tournamentHistoryMap[entry.username] = [];
          }
          tournamentHistoryMap[entry.username].push(entry);
        });

        setLeaderboard(sortedLeaderboard);
        setTournamentHistory(tournamentHistoryMap);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, []);

  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const toggleUserExpansion = (username: string) => {
    setExpandedUser(expandedUser === username ? null : username);
  };

  return (
    <main className="min-h-screen p-2 max-w-xl mx-auto text-white">
      <div className="bg-[#1a1a1a] rounded-xl p-2 shadow-lg">
        <h1 className="text-xl font-bold mb-1 text-orange-400 font-['Exo_2']">Global Leaderboard</h1>
        <p className="text-gray-400 mb-2 text-xs">Rankings based on tournament performances</p>
        
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
                  <>
                    <tr 
                      key={entry.username} 
                      className={`border-t border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors ${index < 3 ? 'bg-gradient-to-r from-yellow-900/20 to-transparent' : ''}`}
                      onClick={() => toggleUserExpansion(entry.username)}
                    >
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
                    {expandedUser === entry.username && tournamentHistory[entry.username] && (
                      <tr className="bg-gray-900/50">
                        <td colSpan={4} className="px-2 py-1">
                          <div className="pl-4 pr-1">
                            <h4 className="font-medium text-gray-300 mb-1 text-xs">Tournament History</h4>
                            <div className="grid gap-0.5">
                              {tournamentHistory[entry.username]
                                .sort((a, b) => b.position - a.position)
                                .map((tournament, idx) => (
                                  <div key={idx} className="flex justify-between items-center py-0.5 px-1.5 bg-gray-800/50 rounded-md text-[10px]">
                                    <div>
                                      <span className="text-orange-400 font-medium">
                                        {tournament.position === 1 ? '1st' : 
                                         tournament.position === 2 ? '2nd' : 
                                         tournament.position === 3 ? '3rd' : `${tournament.position}th`}
                                      </span>
                                      <span className="mx-2 text-gray-400">•</span>
                                      <span>{tournament.tournament_title}</span>
                                    </div>
                                    <div className="text-gray-400 text-sm">
                                      {calculatePoints(tournament.position)} pts
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
