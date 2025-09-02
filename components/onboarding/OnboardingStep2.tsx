'use client'

import React, { useState, useEffect } from 'react'
import { FaGamepad, FaCheck } from 'react-icons/fa'
import { OnboardingData } from '@/app/onboarding/page'
import { supabase } from '@/lib/supabase'
import { Game } from '@/types/database'
import GameCard from '@/components/GameCard'

interface OnboardingStep2Props {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
  onNext: () => void
  onPrev: () => void
}

export default function OnboardingStep2({ data, updateData, onNext, onPrev }: OnboardingStep2Props) {
  const [games, setGames] = useState<Game[]>([])
  const [selectedGames, setSelectedGames] = useState<string[]>(data.selectedGames)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGames()
  }, [])

  const fetchGames = async () => {
    try {
      const { data: gamesData, error } = await supabase
        .from('games')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching games:', error)
        return
      }

      setGames(gamesData || [])
    } catch (error) {
      console.error('Error fetching games:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleGame = (gameId: string) => {
    setSelectedGames(prev => 
      prev.includes(gameId) 
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId]
    )
  }

  const handleNext = () => {
    updateData({ selectedGames })
    onNext()
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-orange-400 text-xl">Loading games...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-orange-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaGamepad className="text-2xl text-orange-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">What games do you play?</h2>
        <p className="text-gray-400">Select the games you're interested in (you can change this later)</p>
      </div>

             {/* Game Selection Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
         {games.map((game) => (
           <GameCard
             key={game.id}
             game={game}
             isSelected={selectedGames.includes(game.id)}
             onClick={() => toggleGame(game.id)}
           />
         ))}
       </div>

      {/* Selection Summary */}
      {selectedGames.length > 0 && (
        <div className="bg-[#18181b] rounded-lg p-4 mb-6">
          <h3 className="text-white font-semibold mb-2">Selected Games ({selectedGames.length})</h3>
          <div className="flex flex-wrap gap-2">
            {selectedGames.map(gameId => {
              const game = games.find(g => g.id === gameId)
              return (
                <span
                  key={gameId}
                  className="bg-orange-500 text-white text-sm px-3 py-1 rounded-full"
                >
                  {game?.name}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onPrev}
          className="flex-1 bg-transparent hover:bg-gray-700 text-gray-300 font-semibold py-3 px-4 rounded-lg border border-gray-600 transition-all duration-200"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={selectedGames.length === 0}
          className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
        >
          Continue ({selectedGames.length} selected)
        </button>
      </div>

      {selectedGames.length === 0 && (
        <p className="text-center text-gray-400 mt-4">
          Please select at least one game to continue
        </p>
      )}
    </div>
  )
}
