'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TeamDirectory() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlayers() {
      setLoading(true);
      const { data, error } = await supabase.from('player_identities').select('*');
      if (!error && data) setPlayers(data);
      setLoading(false);
    }
    fetchPlayers();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-orange-400 mb-8 text-center font-['Exo_2']">Cabal Members</h1>
      {loading ? (
        <div className="text-center text-gray-400">Loading...</div>
      ) : players.length === 0 ? (
        <div className="text-center text-gray-400">No members found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-[#18181b] rounded-xl shadow-xl border border-orange-900/20">
            <thead>
              <tr className="text-orange-400 text-left font-['Exo_2']">
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">X (Twitter)</th>
                <th className="py-3 px-4">CODM ID</th>
                <th className="py-3 px-4">Valorant ID</th>
                <th className="py-3 px-4">PUBG ID</th>
                <th className="py-3 px-4">Discord</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p) => (
                <tr key={p.id || p.secret_code} className="border-t border-orange-900/10 hover:bg-orange-900/10 transition">
                  <td className="py-2 px-4 font-semibold text-orange-400 flex items-center gap-3">
                    {p.twitter ? (
                      <img
                        src={`https://unavatar.io/twitter/${p.twitter.replace('@','')}`}
                        alt={p.username}
                        className="w-8 h-8 rounded-full border-2 border-orange-700 object-cover bg-black/40"
                        onError={e => { e.currentTarget.src = '/default-pfp.png'; }}
                      />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-gray-800 border-2 border-orange-900 inline-block" />
                    )}
                    {p.username}
                  </td>
                  <td className="py-2 px-4">
                    {p.twitter ? (
                      <a href={`https://x.com/${p.twitter.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="text-orange-400 underline">@{p.twitter.replace('@','')}</a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-2 px-4 text-gray-200">{p.codm_id || <span className="text-gray-400">—</span>}</td>
                  <td className="py-2 px-4 text-gray-200">{p.valorant_id || <span className="text-gray-400">—</span>}</td>
                  <td className="py-2 px-4 text-gray-200">{p.pubg_id || <span className="text-gray-400">—</span>}</td>
                  <td className="py-2 px-4">
                    <a href="https://discord.gg/vsw8nm7qtk" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">Join</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
