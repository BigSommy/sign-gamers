'use client'

import React from 'react'
import { FaGamepad, FaCheck } from 'react-icons/fa'
import { Game } from '@/types/database'
import { games as staticGames } from '@/app/gamesData'

interface GameCardProps {
  game: Game
  isSelected?: boolean
  onClick?: () => void
  showDescription?: boolean
  subText?: string
  className?: string
}

export default function GameCard({ 
  game, 
  isSelected = false, 
  onClick, 
  showDescription = true,
  subText,
  className = ''
}: GameCardProps) {
  const staticMatch = staticGames.find(g => g.id === game.id)
  const bannerUrl = game.banner_url || staticMatch?.banner || null
  const description = game.description || staticMatch?.description || null

  return (
    <div
      onClick={onClick}
      className={`relative rounded-lg border-2 transition-all duration-200 transform hover:scale-105 overflow-hidden ${
        isSelected
          ? 'border-orange-400 bg-orange-400/10'
          : 'border-gray-600 bg-[#18181b] hover:border-gray-500'
      } ${onClick ? 'cursor-pointer' : 'cursor-default'} ${className}`}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center z-10">
          <FaCheck className="text-white text-sm" />
        </div>
      )}

      {bannerUrl ? (
        <div className="relative h-32 w-full">
          <img
            src={bannerUrl}
            alt={game.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              if (target.parentElement) target.parentElement.style.backgroundColor = '#374151'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      ) : (
        <div className="relative h-32 w-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
          <FaGamepad className="text-4xl text-gray-400" />
        </div>
      )}

      <div className="p-4">
        <div className="text-center">
          <h3 className="font-semibold text-white mb-1">{game.name}</h3>
          {subText && (
            <p className="text-xs text-gray-300 mb-2">{subText}</p>
          )}
          {showDescription && description && (
            <p className="text-gray-400 text-xs mb-2 line-clamp-2">
              {description}
          </p>
        )}
          {game.requires_id && (
            <span className="inline-block bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
              Requires ID
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
