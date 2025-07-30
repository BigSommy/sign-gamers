'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

function generateSecretCode() {
  // Example: SGC-XXXX-XXXX
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `SGC-${part()}-${part()}`;
}

export default function RegisterIdentity() {
  const [form, setForm] = useState({
    username: '',
    twitter: '',
  });
  const [gameIds, setGameIds] = useState<{ [gameId: string]: string }>({});
  const [games, setGames] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    // Fetch games that require ID from backend
    supabase
      .from('games')
      .select('id, name')
      .eq('requires_id', true)
      .then(({ data }) => {
        setGames(data || []);
      });
  }, []);
  const [loading, setLoading] = useState(false);
  const [secret, setSecret] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const secret_code = generateSecretCode();
    // Insert user info
    const { data: userData, error: userError } = await supabase
      .from('player_identities')
      .insert({
        username: form.username,
        twitter: form.twitter,
        secret_code,
      })
      .select('id')
      .single();

    if (userError || !userData) {
      setLoading(false);
      toast.error('Error saving identity');
      return;
    }

    // Insert game IDs
    const user_id = userData.id;
    const gameIdRows = Object.entries(gameIds)
      .filter(([_, value]) => value.trim() !== '')
      .map(([game_id, player_game_id]) => ({ user_id, game_id, player_game_id }));
    let gameError = null;
    if (gameIdRows.length > 0) {
      const { error } = await supabase.from('player_game_ids').insert(gameIdRows);
      gameError = error;
    }
    setLoading(false);
    if (gameError) {
      toast.error('Error saving game IDs');
    } else {
      setSecret(secret_code);
      toast.success('Identity registered!');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18181b] via-[#1a1a22] to-[#23232b] flex items-center justify-center px-2 md:px-4">
      <div className="w-full max-w-xl mx-auto py-8 px-0 md:px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-orange-400 mb-6 text-center font-['Exo_2']">Register Your Player Identity</h1>
        <form className="bg-[#18181b] rounded-xl shadow-xl p-4 md:p-6 flex flex-col gap-2 md:gap-4 w-full" onSubmit={handleSubmit}>
          <input required type="text" placeholder="Username" className="px-4 py-3 rounded bg-black/40 text-white w-full text-base" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
          <input required type="text" placeholder="X (Twitter) Handle" className="px-4 py-3 rounded bg-black/40 text-white w-full text-base" value={form.twitter} onChange={e => setForm(f => ({ ...f, twitter: e.target.value }))} />
          {/* Dynamically render game ID fields */}
          {games.map((game) => (
            <input
              key={game.id}
              type="text"
              placeholder={`${game.name} ID`}
              className="px-4 py-3 rounded bg-black/40 text-white w-full text-base"
              value={gameIds[game.id] || ''}
              onChange={e => setGameIds(ids => ({ ...ids, [game.id]: e.target.value }))}
            />
          ))}
          <button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg mt-2 md:mt-4 transition-all text-base md:text-lg">{loading ? 'Registering...' : 'Register Identity'}</button>
        </form>
        {secret && (
          <div className="mt-8 bg-black/60 rounded-xl p-4 md:p-6 text-center border border-orange-400">
            <h2 className="text-xl font-bold text-orange-400 mb-2 font-['Exo_2']">Your Secret Code</h2>
            <div className="text-xl md:text-2xl font-mono text-orange-300 mb-2">{secret}</div>
            <p className="text-gray-300 text-sm md:text-base">Save this code! You’ll need it to register for tournaments and edit your info.</p>
          </div>
        )}
      </div>
    </div>
  );
}
