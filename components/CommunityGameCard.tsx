"use client";

import React from "react";

export type CommunityGame = {
  id: string;
  title: string;
  creator: string;
  creatorHandle: string;
  description: string;
  imageUrl: string;
  playUrl: string;
};

type Props = {
  game: CommunityGame;
  className?: string;
};

export default function CommunityGameCard({ game, className = "" }: Props) {
  return (
    <a
      href={game.playUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`block relative rounded-lg border-2 transition-all duration-200 transform hover:scale-105 overflow-hidden border-gray-600 bg-[#18181b] hover:border-gray-500 ${className}`}
    >
      <div className="relative h-40 w-full">
        <img
          src={game.imageUrl}
          alt={game.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            if (target.parentElement)
              target.parentElement.style.backgroundColor = "#374151";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-white mb-1 line-clamp-1">{game.title}</h3>
        <p className="text-xs text-gray-300 mb-2 line-clamp-2">{game.description}</p>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="px-2 py-0.5 rounded bg-gray-700 text-gray-200">{game.creator}</span>
          <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300">@{game.creatorHandle}</span>
        </div>
      </div>
    </a>
  );
}
