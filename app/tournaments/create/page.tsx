'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function CreateTournamentPage() {
  const auth = useAuth();
  const { user, roles } = auth;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [gameId, setGameId] = useState('');
  const [mode, setMode] = useState<'bracket' | 'room'>('bracket');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canCreate = auth.isAdmin() || auth.isGameHost();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate || !title || !gameId) return;
    setLoading(true);
    setError(null);
    try {
      const payload: any = {
        title,
        description,
        game_id: gameId,
        mode,
      };
      if (mode === 'room') payload.room_code = roomCode || null;

      const { data, error } = await supabase.from('tournaments').insert(payload).select().single();
      if (error) throw error;
      setSuccess('Tournament created');
      setTitle('');
      setDescription('');
      setGameId('');
      setRoomCode('');
    } catch (e: any) {
      setError(e.message || 'Error creating tournament');
    } finally {
      setLoading(false);
    }
  };

  if (!canCreate) {
    return (
      <div className="p-6 text-white">
        <div>You must be an Admin or Game Host to create tournaments.</div>
        <div className="mt-4 text-xs text-gray-400">Your roles: {JSON.stringify(roles)}</div>
      </div>
    );
  }

  return (
    <main className="p-6 text-white max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-orange-400 mb-4">Create Tournament</h1>
      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 rounded bg-gray-800" />
        </div>
        <div>
          <label className="block text-sm text-gray-300">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 rounded bg-gray-800" />
        </div>
        <div>
          <label className="block text-sm text-gray-300">Game ID</label>
          <input value={gameId} onChange={(e) => setGameId(e.target.value)} className="w-full p-2 rounded bg-gray-800" />
        </div>
        <div>
          <label className="block text-sm text-gray-300">Mode</label>
          <select value={mode} onChange={(e) => setMode(e.target.value as any)} className="w-full p-2 rounded bg-gray-800">
            <option value="bracket">1v1 (Bracket)</option>
            <option value="room">Room (Battle Royale)</option>
          </select>
        </div>
        {mode === 'room' && (
          <div>
            <label className="block text-sm text-gray-300">Room Code / Link</label>
            <input value={roomCode} onChange={(e) => setRoomCode(e.target.value)} className="w-full p-2 rounded bg-gray-800" />
          </div>
        )}

        <div>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-orange-500 rounded">
            {loading ? 'Creating...' : 'Create Tournament'}
          </button>
        </div>
        {error && <div className="text-red-400">{error}</div>}
        {success && <div className="text-green-400">{success}</div>}
      </form>
    </main>
  );
}
