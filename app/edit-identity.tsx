// This file has been moved to /edit-identity/page.tsx for Next.js 14 app routing.
// Please use that file for the Edit Identity page implementation.

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function EditIdentity() {
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: '',
    twitter: '',
    codm_id: '',
    valorant_id: '',
    pubg_id: '',
  });
  const [found, setFound] = useState(false);

  async function handleFetch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase
      .from('player_identities')
      .select('*')
      .eq('secret_code', secret)
      .single();
    setLoading(false);
    if (error || !data) {
      toast.error('Identity not found');
      setFound(false);
    } else {
      setForm({
        username: data.username || '',
        twitter: data.twitter || '',
        codm_id: data.codm_id || '',
        valorant_id: data.valorant_id || '',
        pubg_id: data.pubg_id || '',
      });
      setFound(true);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from('player_identities')
      .update({
        username: form.username,
        twitter: form.twitter,
        codm_id: form.codm_id,
        valorant_id: form.valorant_id,
        pubg_id: form.pubg_id,
      })
      .eq('secret_code', secret);
    setLoading(false);
    if (error) {
      toast.error('Error updating identity');
    } else {
      toast.success('Identity updated!');
    }
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-orange-400 mb-6 text-center">Edit Your Player Identity</h1>
      <form className="bg-[#18181b] rounded-xl shadow-xl p-6 flex flex-col gap-4 mb-6" onSubmit={handleFetch}>
        <input required type="text" placeholder="Enter Your Secret Code" className="px-4 py-2 rounded bg-black/40 text-white" value={secret} onChange={e => setSecret(e.target.value)} />
        <button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg mt-2 transition-all">{loading ? 'Checking...' : 'Fetch Identity'}</button>
      </form>
      {found && (
        <form className="bg-[#18181b] rounded-xl shadow-xl p-6 flex flex-col gap-4" onSubmit={handleUpdate}>
          <input required type="text" placeholder="Username" className="px-4 py-2 rounded bg-black/40 text-white" value={form.username} onChange={e => setForm(f => ({...f, username: e.target.value}))} />
          <input required type="text" placeholder="X (Twitter) Handle" className="px-4 py-2 rounded bg-black/40 text-white" value={form.twitter} onChange={e => setForm(f => ({...f, twitter: e.target.value}))} />
          <input type="text" placeholder="CODM ID (optional)" className="px-4 py-2 rounded bg-black/40 text-white" value={form.codm_id} onChange={e => setForm(f => ({...f, codm_id: e.target.value}))} />
          <input type="text" placeholder="Valorant ID (optional)" className="px-4 py-2 rounded bg-black/40 text-white" value={form.valorant_id} onChange={e => setForm(f => ({...f, valorant_id: e.target.value}))} />
          <input type="text" placeholder="PUBG ID (optional)" className="px-4 py-2 rounded bg-black/40 text-white" value={form.pubg_id} onChange={e => setForm(f => ({...f, pubg_id: e.target.value}))} />
          <button type="submit" disabled={loading} className="bg-orange-700 hover:bg-orange-800 text-white font-bold py-3 rounded-lg mt-4 transition-all">{loading ? 'Updating...' : 'Update Identity'}</button>
        </form>
      )}
    </div>
  );
}
