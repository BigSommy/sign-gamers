'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { FaGamepad, FaEnvelope, FaArrowLeft, FaCheck } from 'react-icons/fa'

const resendSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ResendForm = z.infer<typeof resendSchema>

export default function ResendVerificationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResendForm>({
    resolver: zodResolver(resendSchema),
  })

  const onSubmit = async (data: ResendForm) => {
    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: data.email,
      })
      
      if (error) {
        toast.error(error.message || 'Failed to resend verification email')
      } else {
        setEmailSent(true)
        toast.success('Verification email sent!')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#18181b] relative z-10">
        <div className="w-full max-w-md mx-auto p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <FaGamepad className="text-4xl text-orange-400 mr-3" />
              <h1 className="text-3xl font-bold text-orange-400">Sign Gamers</h1>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Email Sent!</h2>
            <p className="text-gray-400">Check your inbox for the verification link</p>
          </div>

          {/* Success Card */}
          <div className="bg-[#222] rounded-xl shadow-2xl p-8 border border-orange-400/20 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheck className="text-2xl text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Verification Email Sent</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                We've sent a new verification link to your email address. 
                Check your inbox and click the link to verify your account.
              </p>
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
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#18181b] relative z-10">
      <div className="w-full max-w-md mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FaGamepad className="text-4xl text-orange-400 mr-3" />
            <h1 className="text-3xl font-bold text-orange-400">Sign Gamers</h1>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Resend Verification</h2>
          <p className="text-gray-400">Get a new verification email</p>
        </div>

        {/* Resend Form */}
        <div className="bg-[#222] rounded-xl shadow-2xl p-6 border border-orange-400/20">
          <div className="mb-6 text-center">
            <div className="w-16 h-16 bg-orange-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaEnvelope className="text-2xl text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Need a New Link?</h3>
            <p className="text-gray-400 text-sm">
              Enter your email address and we'll send you a new verification link.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className="w-full px-4 py-3 rounded-lg bg-[#18181b] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                placeholder="Enter your email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send Verification Email'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-600"></div>
            <span className="px-4 text-gray-400 text-sm">or</span>
            <div className="flex-1 border-t border-gray-600"></div>
          </div>

          {/* Alternative Actions */}
          <div className="space-y-3">
            <Link
              href="/auth/signin"
              className="w-full bg-transparent hover:bg-gray-700 text-gray-300 font-semibold py-3 px-4 rounded-lg border border-gray-600 transition-all duration-200 inline-flex items-center justify-center"
            >
              Back to Sign In
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
            Still having trouble?{' '}
            <Link href="/support" className="text-orange-400 hover:text-orange-300">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
