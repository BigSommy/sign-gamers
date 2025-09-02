'use client'

import React, { useState } from 'react'
import { FaCheck, FaGamepad, FaUsers, FaTrophy, FaComments } from 'react-icons/fa'
import { OnboardingData } from '@/app/onboarding/page'

interface OnboardingStep4Props {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
  onComplete: () => void
  onPrev: () => void
}

export default function OnboardingStep4({ data, updateData, onComplete, onPrev }: OnboardingStep4Props) {
  const [currentTourStep, setCurrentTourStep] = useState(0)

  const tourSteps = [
    {
      icon: FaGamepad,
      title: 'Tournaments',
      description: 'Join competitive tournaments, track your progress, and climb the leaderboards.',
      color: 'text-blue-400'
    },
    {
      icon: FaUsers,
      title: 'Community Hub',
      description: 'Connect with other gamers in real-time chat and voice channels.',
      color: 'text-green-400'
    },
    {
      icon: FaTrophy,
      title: 'Achievements',
      description: 'Earn trophies, badges, and recognition for your gaming achievements.',
      color: 'text-yellow-400'
    },
    {
      icon: FaComments,
      title: 'Live Streams',
      description: 'Watch and share live streams with the community.',
      color: 'text-purple-400'
    }
  ]

  const handleComplete = () => {
    updateData({ hasCompletedTour: true })
    onComplete()
  }

  const nextTourStep = () => {
    if (currentTourStep < tourSteps.length - 1) {
      setCurrentTourStep(currentTourStep + 1)
    } else {
      handleComplete()
    }
  }

  const skipTour = () => {
    handleComplete()
  }

  const renderIcon = () => {
    const step = tourSteps[currentTourStep]
    switch (currentTourStep) {
      case 0:
        return <FaGamepad className="text-2xl text-blue-400" />
      case 1:
        return <FaUsers className="text-2xl text-green-400" />
      case 2:
        return <FaTrophy className="text-2xl text-yellow-400" />
      case 3:
        return <FaComments className="text-2xl text-purple-400" />
      default:
        return <FaGamepad className="text-2xl text-blue-400" />
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-orange-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaCheck className="text-2xl text-orange-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Welcome to Sign Gamers!</h2>
        <p className="text-gray-400">Let's take a quick tour of what you can do here</p>
      </div>

      <div className="bg-[#18181b] rounded-lg p-6 border border-gray-600 mb-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            {renderIcon()}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {tourSteps[currentTourStep].title}
          </h3>
          <p className="text-gray-400 mb-6">
            {tourSteps[currentTourStep].description}
          </p>
          
          <div className="flex justify-center gap-2 mb-6">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index <= currentTourStep ? 'bg-orange-400' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

        <div className="bg-[#18181b] rounded-lg p-4 border border-gray-600 mb-6">
        <h3 className="text-white font-semibold mb-3">Your Setup Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Games Selected:</span>
            <span className="text-white">{data.selectedGames.length} games</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Bio:</span>
            <span className="text-white">
              {data.bio ? `${data.bio.length} characters` : 'Not added'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Twitter:</span>
            <span className="text-white">
              {data.twitter_handle || 'Not connected'}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-400 mt-3">You can add your in-game IDs later in your profile settings.</p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onPrev}
          className="flex-1 bg-transparent hover:bg-gray-700 text-gray-300 font-semibold py-3 px-4 rounded-lg border border-gray-600 transition-all duration-200"
        >
          Back
        </button>
        <button
          onClick={nextTourStep}
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          {currentTourStep < tourSteps.length - 1 ? 'Next' : 'Complete Setup'}
        </button>
      </div>

      <div className="text-center mt-4">
        <button
          onClick={skipTour}
          className="text-gray-400 hover:text-orange-400 transition-colors text-sm"
        >
          Skip tour and complete setup
        </button>
      </div>
    </div>
  )
}
