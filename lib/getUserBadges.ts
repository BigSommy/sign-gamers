import { supabase } from './supabase';

export type UserBadge = {
  tournament_id: string;
  tournament_title: string;
  date: string;
  position: 1 | 2 | 3 | 'loser';
};

export async function getUserBadges(user_id: string): Promise<UserBadge[]> {
  // Get all results for this user
  const { data: results, error } = await supabase
    .from('tournament_results')
    .select('tournament_id,position,created_at,tournaments(title)')
    .eq('user_id', user_id);
  if (error || !results) return [];

  // For each tournament, find the max position (last place)
  const tournamentIds = Array.from(new Set(results.map(r => r.tournament_id)));
  const { data: allResults } = await supabase
    .from('tournament_results')
    .select('tournament_id,position')
    .in('tournament_id', tournamentIds);

  const lastPlaceMap: Record<string, number> = {};
  (allResults || []).forEach(r => {
    if (!lastPlaceMap[r.tournament_id] || r.position > lastPlaceMap[r.tournament_id]) {
      lastPlaceMap[r.tournament_id] = r.position;
    }
  });

  // Filter for 1st, 2nd, 3rd, or last
  return results
    .map(r => {
      let pos: 1 | 2 | 3 | 'loser' | null = null;
      if (r.position === 1) pos = 1;
      else if (r.position === 2) pos = 2;
      else if (r.position === 3) pos = 3;
      else if (r.position === lastPlaceMap[r.tournament_id]) pos = 'loser';
      if (!pos) return null;
      // In some setups, Supabase returns joined relations as arrays.
      // Handle both object and array shapes for r.tournaments
      const tournamentsAny = (r as any).tournaments;
      const tournamentTitle: string = Array.isArray(tournamentsAny)
        ? tournamentsAny[0]?.title ?? ''
        : tournamentsAny?.title ?? '';
      return {
        tournament_id: r.tournament_id,
        tournament_title: tournamentTitle,
        date: r.created_at?.slice(0, 10) || '',
        position: pos,
      };
    })
    .filter(Boolean) as UserBadge[];
}
