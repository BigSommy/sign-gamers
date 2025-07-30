// This file has been moved to /register-identity/page.tsx for Next.js 14 app routing.
// Please use that file for the Register Identity page implementation.

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

function generateSecretCode() {
  // Example: SGC-XXXX-XXXX
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part = () => Array.from({length: 4}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `SGC-${part()}-${part()}`;
}

export default function RegisterIdentity() {
  const [form, setForm] = useState({
    username: '',
    twitter: '',
    codm_id: '',
    valorant_id: '',
    pubg_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [secret, setSecret] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const secret_code = generateSecretCode();
    const { error } = await supabase.from('player_identities').insert({
      username: form.username,
      twitter: form.twitter,
      codm_id: form.codm_id,
      valorant_id: form.valorant_id,
      pubg_id: form.pubg_id,
      secret_code,
    });
    setLoading(false);
    if (error) {
      toast.error('Error saving identity');
    } else {
      setSecret(secret_code);
      toast.success('Identity registered!');
    }
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-orange-400 mb-6 text-center">Register Your Player Identity</h1>
      <form className="bg-[#18181b] rounded-xl shadow-xl p-6 flex flex-col gap-4" onSubmit={handleSubmit}>
        <input required type="text" placeholder="Username" className="px-4 py-2 rounded bg-black/40 text-white" value={form.username} onChange={e => setForm(f => ({...f, username: e.target.value}))} />
        <input required type="text" placeholder="X (Twitter) Handle" className="px-4 py-2 rounded bg-black/40 text-white" value={form.twitter} onChange={e => setForm(f => ({...f, twitter: e.target.value}))} />
        <input type="text" placeholder="CODM ID (optional)" className="px-4 py-2 rounded bg-black/40 text-white" value={form.codm_id} onChange={e => setForm(f => ({...f, codm_id: e.target.value}))} />
        <input type="text" placeholder="Valorant ID (optional)" className="px-4 py-2 rounded bg-black/40 text-white" value={form.valorant_id} onChange={e => setForm(f => ({...f, valorant_id: e.target.value}))} />
        <input type="text" placeholder="PUBG ID (optional)" className="px-4 py-2 rounded bg-black/40 text-white" value={form.pubg_id} onChange={e => setForm(f => ({...f, pubg_id: e.target.value}))} />
        <button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg mt-4 transition-all">{loading ? 'Registering...' : 'Register Identity'}</button>
      </form>
      {secret && (
        <div className="mt-8 bg-black/60 rounded-xl p-6 text-center border border-orange-400">
          <h2 className="text-xl font-bold text-orange-400 mb-2">Your Secret Code</h2>
          <div className="text-2xl font-mono text-orange-300 mb-2">{secret}</div>
          <p className="text-gray-300">Save this code! You’ll need it to register for tournaments and edit your info.</p>
        </div>
      )}
    </div>
  );
}
