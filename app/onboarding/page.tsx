'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { FaGamepad, FaUser, FaCheck } from 'react-icons/fa'
import OnboardingStep1 from '@/components/onboarding/OnboardingStep1'
import OnboardingStep2 from '@/components/onboarding/OnboardingStep2'
// OnboardingStep3 (game IDs) removed — game IDs are now handled in profile settings
import OnboardingStep4 from '@/components/onboarding/OnboardingStep4'

export type OnboardingData = {
  bio: string
  twitter_handle: string
  profile_picture_url?: string
  selectedGames: string[]
  hasCompletedTour: boolean
}

export default function OnboardingPage() {
  const { user, profile, loading, saveOnboardingData } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    bio: '',
    twitter_handle: '',
    selectedGames: [],
    hasCompletedTour: false
  })

  // Redirect if not authenticated or already completed onboarding
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/signin')
        return
      }
      
      // Check if user has already completed onboarding (has bio or selected games)
      if (profile?.bio || profile?.twitter_handle) {
        router.push('/')
        return
      }
    }
  }, [user, profile, loading, router])

  const updateOnboardingData = (updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeOnboarding = async () => {
    try {
      const { error } = await saveOnboardingData(onboardingData)
      
      if (error) {
        console.error('Error saving onboarding data:', error)
        // You could show a toast error here
        return
      }
      
      router.push('/')
    } catch (error) {
      console.error('Error completing onboarding:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#18181b] flex items-center justify-center">
        <div className="text-orange-400 text-xl">Loading...</div>
      </div>
    )
  }

  const steps = [
    { number: 1, title: 'Profile Setup', icon: FaUser },
    { number: 2, title: 'Game Selection', icon: FaGamepad },
    { number: 3, title: 'Welcome Tour', icon: FaCheck }
  ]

  return (
    <div className="min-h-screen bg-[#18181b] pt-20 pb-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FaGamepad className="text-4xl text-orange-400 mr-3" />
            <h1 className="text-3xl font-bold text-orange-400">Welcome to Sign Gamers!</h1>
          </div>
          <p className="text-gray-400">Let's get you set up in just a few steps</p>
        </div>

        {/* Progress Bar */}
        <div className="bg-[#222] rounded-xl shadow-2xl p-6 mb-8 border border-orange-400/20">
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  currentStep >= step.number 
                    ? 'bg-orange-500 border-orange-500 text-white' 
                    : 'border-gray-600 text-gray-400'
                }`}>
                  {currentStep > step.number ? (
                    <FaCheck className="text-sm" />
                  ) : (
                    <step.icon className="text-sm" />
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-white' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 transition-all ${
                    currentStep > step.number ? 'bg-orange-500' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          {/* Step Progress */}
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-[#222] rounded-xl shadow-2xl p-8 border border-orange-400/20">
          {currentStep === 1 && (
            <OnboardingStep1 
              data={onboardingData}
              updateData={updateOnboardingData}
              onNext={nextStep}
            />
          )}
          
          {currentStep === 2 && (
            <OnboardingStep2 
              data={onboardingData}
              updateData={updateOnboardingData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          
          {currentStep === 3 && (
            <OnboardingStep4 
              data={onboardingData}
              updateData={updateOnboardingData}
              onComplete={completeOnboarding}
              onPrev={prevStep}
            />
          )}
        </div>

        {/* Skip Option */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-orange-400 transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
