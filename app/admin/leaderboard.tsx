'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LeaderboardAdmin() {
  const [tournaments, setTournaments] = useState<any[]>([])
  const [form, setForm] = useState({ tournament_id: '', username: '', score: '', x_handle: '' });
  const [entries, setEntries] = useState<any[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ username: '', score: '', x_handle: '' });

  useEffect(() => {
    supabase.from('tournaments').select('*').then(({ data }) => {
      if (data) setTournaments(data)
    })
  }, [])

  useEffect(() => {
    if (form.tournament_id) {
      supabase.from('leaderboard').select('*').eq('tournament_id', form.tournament_id).then(({ data }) => {
        setEntries(data || []);
      });
    } else {
      setEntries([]);
    }
  }, [form.tournament_id]);

  const addEntry = async () => {
    if (!form.tournament_id || !form.username || !form.score) return alert('All fields required');
    const { error } = await supabase.from('leaderboard').insert({
      tournament_id: form.tournament_id,
      username: form.username,
      score: parseInt(form.score),
      x_handle: form.x_handle,
    });
    if (error) alert('Error adding entry');
    else {
      alert('Entry added!');
      setForm({ ...form, username: '', score: '', x_handle: '' });
      supabase.from('leaderboard').select('*').eq('tournament_id', form.tournament_id).then(({ data }) => setEntries(data || []));
    }
  };

  const startEdit = (entry: any) => {
    setEditId(entry.id);
    setEditForm({ username: entry.username, score: entry.score.toString(), x_handle: entry.x_handle || '' });
  };

  const saveEdit = async () => {
    if (!editId) return;
    const { error } = await supabase.from('leaderboard').update({
      username: editForm.username,
      score: parseInt(editForm.score),
      x_handle: editForm.x_handle,
    }).eq('id', editId);
    if (error) alert('Error updating entry');
    else {
      setEditId(null);
      setEditForm({ username: '', score: '', x_handle: '' });
      supabase.from('leaderboard').select('*').eq('tournament_id', form.tournament_id).then(({ data }) => setEntries(data || []));
    }
  };

  const deleteEntry = async (id: string) => {
    if (!window.confirm('Delete this entry?')) return;
    const { error } = await supabase.from('leaderboard').delete().eq('id', id);
    if (error) alert('Error deleting entry');
    else supabase.from('leaderboard').select('*').eq('tournament_id', form.tournament_id).then(({ data }) => setEntries(data || []));
  };

  return (
    <div className="bg-[#1a1a1a] p-4 mt-6 rounded-xl">
      <h2 className="text-xl font-semibold mb-2">Add Leaderboard Entry</h2>
      <select
        className="w-full p-2 mb-2 rounded bg-[#222]"
        value={form.tournament_id}
        onChange={(e) => setForm({ ...form, tournament_id: e.target.value })}
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
        placeholder="Score"
        type="number"
        className="w-full p-2 mb-2 rounded bg-[#222]"
        value={form.score}
        onChange={e => setForm({ ...form, score: e.target.value })}
      />
      <input
        placeholder="X (Twitter) handle (without @)"
        className="w-full p-2 mb-2 rounded bg-[#222]"
        value={form.x_handle}
        onChange={e => setForm({ ...form, x_handle: e.target.value })}
      />
      <button onClick={addEntry} className="bg-green-600 px-4 py-2 rounded text-white hover:bg-green-700">
        Add Entry
      </button>
      {/* List and edit leaderboard entries */}
      {entries.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Entries</h3>
          <table className="w-full bg-[#222] rounded-xl overflow-hidden mb-2">
            <thead>
              <tr className="text-left bg-[#18181b]">
                <th className="py-2 px-4">Username</th>
                <th className="py-2 px-4">X Handle</th>
                <th className="py-2 px-4">Score</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry: any) => (
                <tr key={entry.id} className="border-t border-[#333]">
                  <td className="py-2 px-4">
                    {editId === entry.id ? (
                      <input value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value })} className="bg-[#18181b] rounded p-1" />
                    ) : (
                      entry.username
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {editId === entry.id ? (
                      <input value={editForm.x_handle} onChange={e => setEditForm({ ...editForm, x_handle: e.target.value })} className="bg-[#18181b] rounded p-1" />
                    ) : (
                      entry.x_handle || ''
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {editId === entry.id ? (
                      <input type="number" value={editForm.score} onChange={e => setEditForm({ ...editForm, score: e.target.value })} className="bg-[#18181b] rounded p-1" />
                    ) : (
                      entry.score
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {editId === entry.id ? (
                      <>
                        <button onClick={saveEdit} className="text-green-400 mr-2">Save</button>
                        <button onClick={() => setEditId(null)} className="text-gray-400">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(entry)} className="text-blue-400 mr-2">Edit</button>
                        <button onClick={() => deleteEntry(entry.id)} className="text-red-400">Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
