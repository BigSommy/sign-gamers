'use client'

import React, { useState } from 'react'
import { FaUser, FaTwitter, FaCamera } from 'react-icons/fa'
import ProfilePictureUpload from '@/components/ProfilePictureUpload'

interface OnboardingStep1Props {
  data: {
    bio: string
    twitter_handle: string
  }
  updateData: (updates: { bio: string; twitter_handle: string }) => void
  onNext: () => void
}

export default function OnboardingStep1({ data, updateData, onNext }: OnboardingStep1Props) {
  const [bio, setBio] = useState(data.bio)
  const [twitterHandle, setTwitterHandle] = useState(data.twitter_handle)
  const [errors, setErrors] = useState<{ bio?: string; twitter?: string }>({})

  const handleNext = () => {
    // Validate inputs
    const newErrors: { bio?: string; twitter?: string } = {}
    
    if (!bio.trim()) {
      newErrors.bio = 'Bio is required'
    } else if (bio.length < 10) {
      newErrors.bio = 'Bio must be at least 10 characters'
    }
    
    if (twitterHandle && !twitterHandle.startsWith('@')) {
      newErrors.twitter = 'Twitter handle must start with @'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    // Update data and proceed
    updateData({ bio: bio.trim(), twitter_handle: twitterHandle.trim() })
    onNext()
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Tell Us About Yourself</h2>
        <p className="text-gray-400">Help the community get to know you better</p>
      </div>

      {/* Profile Picture Upload */}
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-4">Profile Picture</h3>
          <ProfilePictureUpload />
        </div>
      </div>

      {/* Bio Input */}
      <div className="space-y-2">
        <label htmlFor="bio" className="block text-sm font-medium text-gray-300">
          <FaUser className="inline mr-2" />
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself, your gaming interests, and what you're looking for in the community..."
          className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
            errors.bio ? 'border-red-500' : 'border-gray-600'
          }`}
          rows={4}
        />
        {errors.bio && (
          <p className="text-red-400 text-sm">{errors.bio}</p>
        )}
        <p className="text-gray-400 text-sm">
          {bio.length}/500 characters
        </p>
      </div>

      {/* Twitter Handle Input */}
      <div className="space-y-2">
        <label htmlFor="twitter" className="block text-sm font-medium text-gray-300">
          <FaTwitter className="inline mr-2" />
          Twitter Handle (Optional)
        </label>
        <input
          type="text"
          id="twitter"
          value={twitterHandle}
          onChange={(e) => setTwitterHandle(e.target.value)}
          placeholder="@yourusername"
          className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
            errors.twitter ? 'border-red-500' : 'border-gray-600'
          }`}
        />
        {errors.twitter && (
          <p className="text-red-400 text-sm">{errors.twitter}</p>
        )}
        <p className="text-gray-400 text-sm">
          Connect your Twitter account to share your gaming moments
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-6">
        <button
          onClick={handleNext}
          className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
        >
          Next Step
        </button>
      </div>
    </div>
  )
}
