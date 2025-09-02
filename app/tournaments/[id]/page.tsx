"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

type Tournament = {
  id: string;
  title: string;
  description: string;
  status: "upcoming" | "ongoing" | "past";
  banner_url: string | null;
  registration_deadline?: string;
  created_at?: string;
  rules?: string | null;
  game_id?: string;
  prize_pool?: string;
};

type Registration = {
  id: string;
  user_id: string;
  tournament_id: string;
  username: string;
  created_at: string;
  profile_picture_url?: string | null;
};

type TournamentResult = {
  id: string;
  tournament_id: string;
  user_id: string;
  position: number;
  prize?: string;
  player?: {
    username: string;
    profile_picture_url: string | null;
  };
};

export default function TournamentPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined;
  const { roles } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [leaderboard, setLeaderboard] = useState<TournamentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [showResultForm, setShowResultForm] = useState(false);
  const [submittingResults, setSubmittingResults] = useState(false);
  const isAdmin = roles?.includes('admin') || roles?.includes('game_host');
  // Filter out registrations that don't have a valid user_id to avoid uuid 'null' errors
  const validRegistrations = registrations.filter(r => !!r.user_id && r.user_id !== 'null');
  const invalidCount = registrations.length - validRegistrations.length;

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      // Fetch tournament details
      const { data: t } = await supabase
        .from("tournaments")
        .select("*")
        .eq("id", id)
        .single();
      setTournament(t);

      // Fetch registered players
      const { data: regs, error: regError } = await supabase
        .from("registrations")
        .select(`
          id,
          user_id,
          tournament_id,
          created_at,
          username,
          profile_picture_url
        `)
        .eq("tournament_id", id);

      console.log('Registered players:', regs, regError);
      
      setRegistrations(regs || []);

      // Fetch leaderboard with player details
      const { data: results } = await supabase
        .from("tournament_results")
        .select(`
          *,
          player:user_profiles(
            username,
            profile_picture_url
          )
        `)
        .eq("tournament_id", id)
        .order('position', { ascending: true });

      setLeaderboard(results || []);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleAddResult = () => {
    setShowResultForm(!showResultForm);
  };

  const handleSubmitResults = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id || submittingResults) return;

    try {
      setSubmittingResults(true);
      const form = e.currentTarget;
      const positions = new FormData(form);
      const results: { user_id: string; position: number; prize: string | null }[] = [];
      let hasError = false;
      const usedPositions = new Set<number>();

      // positions keys are like position_<regId>
      positions.forEach((value, key) => {
        if (key.startsWith('position_')) {
          const regId = key.replace('position_', '');
          const position = parseInt(value as string);
          const prize = positions.get(`prize_${regId}`) as string || null;
          const userId = positions.get(`user_id_${regId}`) as string || null;

          // Validate userId exists and looks like a UUID
          const uuidRegex = /^[0-9a-fA-F-]{36}$/;
          if (!userId || userId === 'null' || !uuidRegex.test(userId)) {
            hasError = true;
            console.warn(`Registration ${regId} missing valid user_id:`, userId);
            return;
          }

          if (position && !usedPositions.has(position)) {
            usedPositions.add(position);
            results.push({
              user_id: userId,
              position,
              prize
            });
          } else if (position) {
            hasError = true;
          }
        }
      });

      if (hasError) {
        alert('Each position must be unique. Please check your entries.');
        return;
      }

      // Sort by position to ensure order
      results.sort((a, b) => a.position - b.position);

      // If there was a validation error, inform the admin which entries failed
      if (hasError) {
        alert('One or more entries are invalid. Make sure each position is unique and every registration is linked to a valid user.');
        return;
      }

      // Delete existing results first
      console.log('Attempting to delete existing results...');
      const { error: delError } = await supabase
        .from('tournament_results')
        .delete()
        .eq('tournament_id', id);

      if (delError) {
        console.error('Error deleting existing results:', delError);
        alert('Failed to clear existing results.');
        return;
      }

      // Insert new results
      console.log('Attempting to insert new results...');

      // Resolve profile PKs (registrations.user_id currently stores profile.id) to auth user ids (user_profiles.user_id)
      const profileIds = results.map(r => r.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, user_id')
        .in('id', profileIds.filter(Boolean));

      if (profilesError) {
        console.error('Error fetching user_profiles mapping:', profilesError);
        alert('Failed to resolve profiles.');
        return;
      }

      const profileMap: Record<string, string> = {};
      (profiles || []).forEach((p: any) => { profileMap[p.id] = p.user_id; });

      // Build rows for insertion using auth user_id expected by tournament_results FK
      const insertRows = results.map(r => ({
        tournament_id: id,
        user_id: profileMap[r.user_id] || null,
        position: r.position,
        prize: r.prize
      }));

      // Ensure all rows have a resolved user_id
      const unresolved = insertRows.filter(r => !r.user_id);
      if (unresolved.length > 0) {
        console.error('Unresolved profile -> auth user_id for rows:', unresolved);
        alert('Some registrations could not be resolved to users. Resolve their profiles first.');
        return;
      }

      const { error: insertError } = await supabase
        .from('tournament_results')
        .insert(insertRows);

      if (insertError) {
        console.error('Error inserting results:', insertError);
        alert('Failed to insert new results: ' + (insertError.message || JSON.stringify(insertError)));
        return;
      }

      // Refresh leaderboard by fetching tournament_results then fetching profile info by auth user_id
      const { data: newResults, error: resultsError } = await supabase
        .from('tournament_results')
        .select('*')
        .eq('tournament_id', id)
        .order('position', { ascending: true });

      if (resultsError || !newResults) {
        console.error('Error fetching tournament_results:', resultsError);
      } else {
        // collect auth user_ids from results
        const authIds = Array.from(new Set(newResults.map((r: any) => r.user_id)));
        const { data: profileRows } = await supabase
          .from('user_profiles')
          .select('user_id, username, profile_picture_url')
          .in('user_id', authIds);

        const authMap: Record<string, any> = {};
        (profileRows || []).forEach((p: any) => { authMap[p.user_id] = p; });

        const leaderboardRows = newResults.map((r: any) => ({
          ...r,
          player: authMap[r.user_id] || null
        }));

        setLeaderboard(leaderboardRows as any);
        setShowResultForm(false);
      }
    } catch (err) {
      console.error('Error in handleSubmitResults:', err);
      alert('An error occurred while saving the results.');
    } finally {
      setSubmittingResults(false);
    }
  };

  if (loading) return <main className="min-h-screen p-6 text-white">Loading...</main>;
  if (!tournament) return <main className="min-h-screen p-6 text-white">Tournament not found.</main>;

  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto text-white">
      {tournament.banner_url && (
        <img 
          src={tournament.banner_url} 
          alt={tournament.title}
          className="w-full h-64 object-cover rounded-xl mb-6" 
        />
      )}

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-orange-400 font-['Exo_2']">{tournament.title}</h1>
        <p className="text-lg mb-4 text-gray-300">{tournament.description}</p>
        
        {tournament.prize_pool && (
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2 text-orange-300">Prize Pool</h3>
            <p className="text-white">{tournament.prize_pool}</p>
          </div>
        )}

        {tournament.rules && (
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2 text-orange-300">Rules</h3>
            <div className="prose prose-invert" dangerouslySetInnerHTML={{ __html: tournament.rules }} />
          </div>
        )}

        {tournament.registration_deadline && (
          <p className="text-sm text-orange-300">
            Registration closes: {new Date(tournament.registration_deadline).toLocaleString()}
          </p>
        )}

        <div className="mt-6">
          <Link 
            href={`/tournaments/${id}/register`}
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
          >
            Register Now
          </Link>
        </div>
      </div>

      <div className="bg-[#18181b] rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-orange-400 font-['Exo_2']">Tournament Leaderboard</h2>
          {isAdmin && (
            <button
              onClick={handleAddResult}
              className={`${showResultForm ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white p-2 rounded-full transition-colors`}
              title={showResultForm ? "Cancel" : "Add Result"}
            >
              {showResultForm ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              )}
            </button>
          )}
        </div>

        {showResultForm && (
          <form onSubmit={handleSubmitResults} className="mb-8 bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-orange-300">Arrange Tournament Results</h3>
            {invalidCount > 0 && (
              <div className="mb-4 p-3 bg-yellow-900/40 border border-yellow-700 rounded text-yellow-200">
                Warning: {invalidCount} registration(s) are missing a linked user profile and will be hidden from this form. Resolve them in the DB to include them.
              </div>
            )}
            <div className="space-y-4">
              {validRegistrations.map((reg) => (
                <div key={reg.id} className="flex items-center gap-4 bg-gray-800 p-3 rounded">
                  <div className="flex items-center gap-3 flex-1">
                    {reg.profile_picture_url ? (
                      <img 
                        src={reg.profile_picture_url} 
                        alt={reg.username}
                        className="w-10 h-10 rounded-full object-cover border-2 border-orange-400" 
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center border-2 border-orange-400">
                        <span className="text-lg text-gray-400">{reg.username[0].toUpperCase()}</span>
                      </div>
                    )}
                    <span className="font-semibold">{reg.username}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    {/* Use registration id as the suffix for stable form field names */}
                    <input type="hidden" name={`user_id_${reg.id}`} value={reg.user_id || ''} />
                    <input
                      type="number"
                      name={`position_${reg.id}`}
                      placeholder="Position"
                      className="w-20 bg-gray-700 text-white p-2 rounded"
                      min="1"
                    />
                    <input
                      type="text"
                      name={`prize_${reg.id}`}
                      placeholder="Prize (optional)"
                      className="w-40 bg-gray-700 text-white p-2 rounded"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={submittingResults}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                {submittingResults ? 'Saving...' : 'Save Results'}
              </button>
            </div>
          </form>
        )}

        {leaderboard.length === 0 ? (
          <p className="text-gray-400">No results yet.</p>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((result) => (
              <div 
                key={result.id} 
                className="flex items-center gap-4 bg-gray-900 p-4 rounded-lg"
              >
                <div className="text-2xl font-bold text-orange-400 w-8">
                  #{result.position}
                </div>
                
                <Link href={`/profile/${result.user_id}`} className="flex items-center gap-3 flex-1">
                  {result.player?.profile_picture_url ? (
                    <img 
                      src={result.player.profile_picture_url} 
                      alt={result.player.username}
                      className="w-12 h-12 rounded-full object-cover border-2 border-orange-400" 
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center border-2 border-orange-400">
                      <span className="text-xl text-gray-400">
                        {result.player?.username?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="font-semibold text-lg">{result.player?.username}</span>
                </Link>
                
                {result.prize && (
                  <div className="text-green-400 font-semibold">
                    {result.prize}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
