'use client';


import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { games } from '@/app/gamesData';

type Tournament = {
  id: string;
  name: string;
  description: string;
  status: string;
  banner_url?: string | null;
  register_link?: string | null;
  game_id: string;
};
type Player = {
  id: string;
  username: string;
  twitter?: string;
  [key: string]: any;
};
type GameMeta = {
  id: string;
  name: string;
  requires_id: boolean;
  external_link?: string | null;
  type: 'pvp' | 'room';
  platform: string;
};

interface Params {
  id: string;
}

export default function TournamentRegister({ params }: { params: Params }) {
  const router = useRouter();
  const [secret, setSecret] = useState<string>('');
  const [player, setPlayer] = useState<Player | null>(null);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [gameMeta, setGameMeta] = useState<GameMeta | null>(null);

  // Fetch tournament info
  import React, { useEffect } from 'react';
  useEffect(() => {
    async function fetchTournament() {
      const { data } = await supabase.from('tournaments').select('*').eq('id', params.id).single();
      setTournament(data);
      if (data && data.game_id) {
        const meta = games.find(g => g.id === data.game_id);
        setGameMeta(meta || null);
      }
    }
    fetchTournament();
  }, [params.id]);

  async function handleFetch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.from('player_identities').select('*').eq('secret_code', secret).single();
    setLoading(false);
    if (error || !data) {
      setPlayer(null);
      alert('Identity not found');
    } else {
      setPlayer(data);
    }
  }

  async function handleRegister() {
    if (!tournament || !player) return;
    setLoading(true);
    const { error } = await supabase.from('registrations').insert({
      tournament_id: tournament.id,
      player_id: player.id,
      username: player.username,
      twitter: player.twitter,
      codm_id: player.codm_id,
      valorant_id: player.valorant_id,
      pubg_id: player.pubg_id,
      eight_ball_id: player.eight_ball_id,
    });
    setLoading(false);
    if (error) {
      alert('Registration failed');
    } else {
      setRegistered(true);
    }
  }

  if (!tournament) return <div className="text-center py-12 text-gray-400">Loading tournament...</div>;

  // If game type is 'room', show only the external link or code, hide all registration fields
  if (gameMeta && gameMeta.type === 'room') {
    return (
      <div className="max-w-xl mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold text-orange-400 mb-6 text-center">Join {tournament.name}</h1>
        <div className="bg-[#18181b] rounded-xl shadow-xl p-6 flex flex-col gap-4 mb-6">
          <h2 className="text-lg font-bold text-orange-300 mb-2">Room Link / Code</h2>
          {tournament.register_link ? (
            <div className="text-xl text-blue-400 break-all font-mono border border-blue-400 rounded p-3 bg-black/30 text-center">
              {tournament.register_link}
            </div>
          ) : (
            <span className="text-gray-400">No room link/code provided yet.</span>
          )}
          {gameMeta.external_link && (
            <div className="mt-4">
              <span className="font-semibold text-orange-400">Game Site:</span> <a href={gameMeta.external_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">{gameMeta.external_link}</a>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Otherwise, show the normal registration flow for PvP games
  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold text-orange-400 mb-6 text-center">Register for {tournament.name}</h1>
      {!player && !registered && (
        <form className="bg-[#18181b] rounded-xl shadow-xl p-6 flex flex-col gap-4 mb-6" onSubmit={handleFetch}>
          <input required type="text" placeholder="Enter Your Secret Code" className="px-4 py-2 rounded bg-black/40 text-white" value={secret} onChange={e => setSecret(e.target.value)} />
          <button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg mt-2 transition-all">{loading ? 'Checking...' : 'Fetch Identity'}</button>
        </form>
      )}
      {player && !registered && (
        <div className="bg-[#18181b] rounded-xl shadow-xl p-6 flex flex-col gap-4 mb-6">
          <h2 className="text-lg font-bold text-orange-300 mb-2">Confirm Your Details</h2>
          <ul className="mb-4">
            <li className="text-white mb-1">
              <span className="font-semibold text-orange-400">Username:</span> {player.username}
            </li>
            <li className="text-white mb-1">
              <span className="font-semibold text-orange-400">X (Twitter):</span> {player.twitter || <span className="text-gray-400">—</span>}
            </li>
            {gameMeta && gameMeta.requires_id && (
              <li className="text-white mb-1">
                <span className="font-semibold text-orange-400">Game ID:</span> {player[`${gameMeta.id}_id`] || <span className="text-gray-400">—</span>}
              </li>
            )}
            {gameMeta && gameMeta.external_link && (
              <li className="text-white mb-1">
                <span className="font-semibold text-orange-400">Game Site:</span> <a href={gameMeta.external_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">{gameMeta.external_link}</a>
              </li>
            )}
          </ul>
          <button onClick={handleRegister} disabled={loading} className="bg-orange-700 hover:bg-orange-800 text-white font-bold py-3 rounded-lg mt-2 transition-all">{loading ? 'Registering...' : 'Confirm & Register'}</button>
        </div>
      )}
      {registered && (
        <div className="bg-black/60 rounded-xl p-6 text-center border border-orange-400 mt-8">
          <h2 className="text-xl font-bold text-orange-400 mb-2">Registration Complete!</h2>
          <p className="text-gray-300">You are now registered for {tournament.name}.</p>
        </div>
      )}
    </div>
  );
}
