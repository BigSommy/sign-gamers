"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoserAdmin() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [form, setForm] = useState({ tournament_id: '', username: '', x_handle: '' });
  const [pfpUrl, setPfpUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [currentLoser, setCurrentLoser] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    supabase.from('tournaments').select('*').then(({ data }) => {
      if (data) setTournaments(data);
    });
  }, []);

  useEffect(() => {
    if (form.x_handle) {
      setPfpUrl(`https://unavatar.io/twitter/${form.x_handle.replace('@','')}`);
    } else {
      setPfpUrl('');
    }
  }, [form.x_handle]);

  useEffect(() => {
    if (form.tournament_id) {
      supabase.from('losers').select('*').eq('tournament_id', form.tournament_id).single().then(({ data }) => {
        setCurrentLoser(data || null);
        if (data) {
          setForm({
            tournament_id: data.tournament_id,
            username: data.username,
            x_handle: data.x_handle,
          });
        }
      });
    } else {
      setCurrentLoser(null);
    }
  }, [form.tournament_id]);

  const addLoser = async () => {
    if (!form.tournament_id || !form.username || !form.x_handle) return setMessage('All fields required');
    setSaving(true);
    setMessage('');
    const { error } = await supabase.from('losers').upsert({
      tournament_id: form.tournament_id,
      username: form.username,
      x_handle: form.x_handle,
      pfp_url: pfpUrl,
    }, { onConflict: 'tournament_id' });
    setSaving(false);
    if (error) setMessage('Error saving loser: ' + error.message);
    else setMessage('Loser saved!');
  };

  const updateLoser = async () => {
    if (!currentLoser) return;
    setSaving(true);
    setMessage('');
    const { error } = await supabase.from('losers').update({
      username: form.username,
      x_handle: form.x_handle,
      pfp_url: pfpUrl,
    }).eq('id', currentLoser.id);
    setSaving(false);
    if (error) setMessage('Error updating loser: ' + error.message);
    else setMessage('Loser updated!');
    setEditMode(false);
  };

  const deleteLoser = async () => {
    if (!currentLoser) return;
    if (!window.confirm('Delete this loser?')) return;
    setSaving(true);
    setMessage('');
    const { error } = await supabase.from('losers').delete().eq('id', currentLoser.id);
    setSaving(false);
    if (error) setMessage('Error deleting loser: ' + error.message);
    else {
      setMessage('Loser deleted!');
      setCurrentLoser(null);
      setForm({ tournament_id: form.tournament_id, username: '', x_handle: '' });
    }
  };

  return (
    <div className="bg-[#1a1a1a] p-4 mt-6 rounded-xl">
      <h2 className="text-xl font-semibold mb-2">Set Tournament Loser</h2>
      <select
        className="w-full p-2 mb-2 rounded bg-[#222]"
        value={form.tournament_id}
        onChange={e => setForm({ ...form, tournament_id: e.target.value })}
      >
        <option value="">-- Select Tournament --</option>
        {tournaments.map(t => (
          <option key={t.id} value={t.id}>
            {t.title} {t.created_at ? `(${new Date(t.created_at).toLocaleString()})` : ''}
          </option>
        ))}
      </select>
      <input
        placeholder="Username"
        className="w-full p-2 mb-2 rounded bg-[#222]"
        value={form.username}
        onChange={e => setForm({ ...form, username: e.target.value })}
      />
      <input
        placeholder="X (Twitter) handle (without @)"
        className="w-full p-2 mb-2 rounded bg-[#222]"
        value={form.x_handle}
        onChange={e => setForm({ ...form, x_handle: e.target.value })}
      />
      {pfpUrl && (
        <div className="flex items-center gap-3 mb-2">
          <img src={pfpUrl} alt="pfp" className="w-12 h-12 rounded-full border-2 border-orange-400 object-cover bg-black" onError={e => { e.currentTarget.src = '/default-pfp.png'; }} />
          <span className="text-gray-400">Preview</span>
        </div>
      )}
      <button onClick={addLoser} className="bg-red-600 px-4 py-2 rounded text-white hover:bg-red-700" disabled={saving}>
        {saving ? 'Saving...' : 'Set Loser'}
      </button>
      {currentLoser && !editMode && (
        <div className="mt-4 p-3 bg-[#18181b] rounded-xl flex flex-col items-center">
          <div className="font-bold text-orange-300 mb-1">Current Loser</div>
          <div className="mb-1">{currentLoser.username} <span className="text-gray-400">(@{currentLoser.x_handle})</span></div>
          <div className="flex gap-2">
            <button onClick={() => setEditMode(true)} className="text-blue-400">Edit</button>
            <button onClick={deleteLoser} className="text-red-400">Delete</button>
          </div>
        </div>
      )}
      {editMode && (
        <div className="mt-4 flex flex-col gap-2">
          <button onClick={updateLoser} className="bg-green-600 px-4 py-2 rounded text-white hover:bg-green-700" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button onClick={() => setEditMode(false)} className="bg-gray-600 px-4 py-2 rounded text-white hover:bg-gray-700">Cancel</button>
        </div>
      )}
      {message && <div className="mt-2 text-sm text-orange-400">{message}</div>}
    </div>
  );
} 