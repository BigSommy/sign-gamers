// This component used to collect in-game IDs during onboarding.
// The flow was changed: collection of in-game IDs was removed from onboarding
// so users can add them later in Profile Settings (/profile/edit).

'use client'

import React from 'react'
import Link from 'next/link'

export default function OnboardingStep3() {
  return (
    <div className="max-w-2xl mx-auto text-center p-8">
      <h2 className="text-2xl font-bold text-white mb-4">Add your in-game IDs (moved)</h2>
      <p className="text-gray-400 mb-6">We no longer collect in-game IDs during onboarding. You can add them anytime from your profile settings.</p>
      <div className="flex justify-center gap-4">
        <Link href="/profile/edit" className="px-6 py-3 bg-orange-500 text-white rounded-lg">Go to Profile Settings</Link>
      </div>
    </div>
  )
}

