"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation'
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { games } from "../gamesData";

// Helper to get X avatar
const getAvatar = (xHandle: string) => `https://unavatar.io/twitter/${xHandle}`;

// Helper to get game name from id
const getGameName = (id: string) => {
  const game = games.find((g) => g.id === id);
  return game ? game.name : id;
};

// Types
interface GameId {
  game_id: string;
  player_game_id: string;
}

interface Gamer {
  user_id: string;
  id: string | null;
  username: string;
  email?: string | null;
  profile_picture_url?: string | null;
  roles?: string[];
  game_ids?: GameId[];
  [key: string]: any;
}

interface GamerModalProps {
  open: boolean;
  onClose: () => void;
  gamer: Gamer | null;
}

const GamerModal: React.FC<GamerModalProps> = ({ open, onClose, gamer }) => {
  if (!open || !gamer) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        style={{
          background: "#18181b",
          borderRadius: "1rem",
          boxShadow: "0 0 32px 4px #f23900cc",
          border: "2px solid #f97316",
          padding: "1.5rem",
          width: "100%",
          maxWidth: "28rem",
          position: "relative",
        }}
      >
        <button
          type="button"
          className="absolute top-3 right-3 text-orange-400 hover:text-orange-600 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="flex flex-col items-center">
          <img
            src={getAvatar(gamer.twitter)}
            alt={gamer.username}
            className="w-20 h-20 rounded-full border-2 border-orange-400 mb-2 object-cover"
          />
          <h2 className="text-xl font-bold text-orange-400 mb-1">{gamer.username}</h2>
          <a
            href={`https://x.com/${gamer.twitter}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-300 underline mb-2"
          >
            @{gamer.twitter}
          </a>
          <div className="w-full mt-2">
            <h3 className="text-orange-400 font-semibold mb-1">Game IDs</h3>
            <ul className="text-white text-sm space-y-1">
              {gamer.game_ids?.length ? (
                gamer.game_ids.map((gid) => (
                  <li key={gid.game_id}>
                    <span className="font-bold text-orange-300">
                      {getGameName(gid.game_id)}:{" "}
                    </span>
                    {gid.player_game_id}
                  </li>
                ))
              ) : (
                <li className="text-gray-400">No game IDs</li>
              )}
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const GamersPage: React.FC = () => {
  const [gamers, setGamers] = useState<Gamer[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Gamer | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter()

  useEffect(() => {
    async function fetchGamers() {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/users')
        const json = await res.json()
        if (!res.ok) {
          console.error('Failed to load gamers:', json)
          setGamers([])
          return
        }

        const profiles: any[] = json.profiles || []
        const roles: any[] = json.roles || []

        // Group roles
        const rolesByUser: Record<string, string[]> = {}
        for (const r of roles) {
          if (!rolesByUser[r.user_id]) rolesByUser[r.user_id] = []
          rolesByUser[r.user_id].push(r.role)
        }

        const merged = profiles.map((p) => ({
          ...p,
          roles: rolesByUser[p.user_id] || [],
          game_ids: p.game_ids || []
        }))

        setGamers(merged)
      } catch (err) {
        console.error('Error fetching gamers:', err)
        setGamers([])
      } finally {
        setLoading(false)
      }
    }
    fetchGamers()
  }, []);

  const filtered = search
    ? gamers.filter(
        (g) =>
          g.username?.toLowerCase().includes(search.toLowerCase()) ||
          g.twitter?.toLowerCase().includes(search.toLowerCase())
      )
    : gamers;

  return (
    <div className="min-h-screen bg-[#18181b] py-12 px-4 relative z-20">
      <h1 className="text-3xl sm:text-5xl font-extrabold text-orange-400 text-center mb-8 font-['Exo_2']">
        Sign Gamers
      </h1>
      <div className="max-w-xl mx-auto mb-8">
        <input
          type="text"
          placeholder="Search by username or X handle..."
          className="w-full px-4 py-2 rounded-xl border border-orange-400 bg-[#111] text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <span className="text-orange-400 animate-pulse text-lg font-bold">
            Loading gamers...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-5xl mx-auto relative z-20">
          {filtered.map((gamer) => (
            <motion.button
              key={gamer.user_id}
              // @ts-expect-error: type is valid for button, but framer-motion types may not include it
              type="button"
              whileHover={{ scale: 1.05, boxShadow: "0 0 24px 2px #f23900cc" }}
              style={{
                background: "#18181b",
                border: "2px solid #f97316",
                borderRadius: "1rem",
                boxShadow: "0 0 24px 2px #f23900cc",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onClick={() => router.push(`/profile/${gamer.user_id}`)}
              className="focus:outline-none"
            >
              <img
                src={gamer.profile_picture_url || getAvatar(gamer.twitter || '')}
                alt={gamer.username}
                className="w-16 h-16 rounded-full border-2 border-orange-400 mb-2 object-cover"
              />
              <h2 className="text-lg font-bold text-orange-300 mb-1 text-center">
                {gamer.username}
              </h2>
              <div className="mt-2 flex gap-2">
                {(gamer.roles || []).map(r => (
                  <span key={r} className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${r === 'admin' ? 'bg-yellow-500 text-white' : r === 'moderator' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>
                    {r.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </motion.button>
          ))}
        </div>
      )}
      <AnimatePresence>
        {modalOpen && (
          <GamerModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            gamer={selected}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GamersPage;
