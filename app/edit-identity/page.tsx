'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function EditIdentity() {
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: '',
    twitter: '',
  });
  const [gameIds, setGameIds] = useState<{ [gameId: string]: string }>({});
  const [games, setGames] = useState<{ id: string; name: string }[]>([]);
  const [found, setFound] = useState(false);

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

  async function handleFetch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    // Fetch player identity
    const { data: identityData, error: identityError } = await supabase
      .from('player_identities')
      .select('*')
      .eq('secret_code', secret)
      .single();
    
    if (identityError || !identityData) {
      setLoading(false);
      toast.error('Identity not found');
      setFound(false);
      return;
    }
    
    // Fetch player's game IDs
    const { data: gameIdsData } = await supabase
      .from('player_game_ids')
      .select('game_id, player_game_id')
      .eq('user_id', identityData.id);
    
    // Convert game IDs array to object
    const gameIdsObj: Record<string, string> = {};
    if (gameIdsData) {
      gameIdsData.forEach(item => {
        gameIdsObj[item.game_id] = item.player_game_id;
      });
    }
    
    setForm({
      username: identityData.username || '',
      twitter: identityData.twitter || '',
    });
    setGameIds(gameIdsObj);
    setFound(true);
    setLoading(false);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    // Update user info
    const { data: userData, error: userError } = await supabase
      .from('player_identities')
      .update({
        username: form.username,
        twitter: form.twitter,
      })
      .eq('secret_code', secret)
      .select('id')
      .single();
    
    if (userError || !userData) {
      setLoading(false);
      toast.error('Error updating identity');
      return;
    }
    
    // Delete existing game IDs
    await supabase
      .from('player_game_ids')
      .delete()
      .eq('user_id', userData.id);
    
    // Insert/update game IDs
    const gameIdRows = Object.entries(gameIds)
      .filter(([_, value]) => value.trim() !== '')
      .map(([game_id, player_game_id]) => ({
        user_id: userData.id,
        game_id,
        player_game_id
      }));
    
    if (gameIdRows.length > 0) {
      const { error: gameError } = await supabase
        .from('player_game_ids')
        .insert(gameIdRows);
      
      if (gameError) {
        setLoading(false);
        toast.error('Error updating game IDs');
        return;
      }
    }
    
    setLoading(false);
    toast.success('Identity updated!');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18181b] via-[#1a1a22] to-[#23232b] flex items-center justify-center">
      <div className="w-full max-w-xl mx-auto py-8 px-2 md:px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-orange-400 mb-6 text-center font-['Exo_2']">Edit Your Player Identity</h1>
      <form className="bg-[#18181b] rounded-xl shadow-xl p-6 flex flex-col gap-4 mb-6" onSubmit={handleFetch}>
        <input 
          required 
          type="text" 
          placeholder="Enter Your Secret Code" 
          className="px-4 py-3 rounded bg-black/40 text-white w-full text-base" 
          value={secret} 
          onChange={e => setSecret(e.target.value)} 
        />
        <button 
          type="submit" 
          disabled={loading} 
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg mt-2 transition-all text-base md:text-lg"
        >
          {loading ? 'Checking...' : 'Fetch Identity'}
        </button>
      </form>
      {found && (
        <form className="bg-[#18181b] rounded-xl shadow-xl p-6 flex flex-col gap-4" onSubmit={handleUpdate}>
          <input 
            required 
            type="text" 
            placeholder="Username" 
            className="px-4 py-3 rounded bg-black/40 text-white w-full text-base" 
            value={form.username} 
            onChange={e => setForm(f => ({...f, username: e.target.value}))} 
          />
          <input 
            required 
            type="text" 
            placeholder="X (Twitter) Handle" 
            className="px-4 py-3 rounded bg-black/40 text-white w-full text-base" 
            value={form.twitter} 
            onChange={e => setForm(f => ({...f, twitter: e.target.value}))} 
          />
          
          {/* Dynamically render game ID fields */}
          {games.map((game) => (
            <input
              key={game.id}
              type="text"
              placeholder={`${game.name} ID (optional)`}
              className="px-4 py-3 rounded bg-black/40 text-white w-full text-base"
              value={gameIds[game.id] || ''}
              onChange={e => setGameIds(ids => ({ ...ids, [game.id]: e.target.value }))}
            />
          ))}
          
          <button 
            type="submit" 
            disabled={loading} 
            className="bg-orange-700 hover:bg-orange-800 text-white font-bold py-3 rounded-lg mt-4 transition-all text-base md:text-lg"
          >
            {loading ? 'Updating...' : 'Update Identity'}
          </button>
        </form>
      )}
      </div>
    </div>
  );
}
