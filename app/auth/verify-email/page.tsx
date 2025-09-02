'use client'

import React from 'react'
import Link from 'next/link'
import { FaGamepad, FaEnvelope, FaArrowLeft } from 'react-icons/fa'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#18181b] relative z-10">
      <div className="w-full max-w-md mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FaGamepad className="text-4xl text-orange-400 mr-3" />
            <h1 className="text-3xl font-bold text-orange-400">Sign Gamers</h1>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
          <p className="text-gray-400">We've sent you a verification link</p>
        </div>

        {/* Verification Card */}
        <div className="bg-[#222] rounded-xl shadow-2xl p-8 border border-orange-400/20 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-orange-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaEnvelope className="text-2xl text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Verify Your Email</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              We've sent a verification link to your email address. 
              Click the link in the email to verify your account and start your gaming journey!
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-[#18181b] rounded-lg p-4 mb-6 text-left">
            <h4 className="font-semibold text-white mb-2">What to do next:</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Check your email inbox (and spam folder)</li>
              <li>• Click the verification link in the email</li>
              <li>• Return here to sign in to your account</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/auth/signin"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 inline-block"
            >
              Go to Sign In
            </Link>
            
            <Link
              href="/"
              className="w-full bg-transparent hover:bg-gray-700 text-gray-300 font-semibold py-3 px-4 rounded-lg border border-gray-600 transition-all duration-200 inline-flex items-center justify-center"
            >
              <FaArrowLeft className="mr-2" />
              Back to Home
            </Link>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Didn't receive the email?{' '}
            <Link href="/auth/resend-verification" className="text-orange-400 hover:text-orange-300">
              Resend verification email
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

