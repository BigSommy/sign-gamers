'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { FaGamepad, FaEnvelope, FaArrowLeft } from 'react-icons/fa'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      
      if (error) {
        toast.error(error.message || 'Failed to send reset email')
      } else {
        setEmailSent(true)
        toast.success('Password reset email sent!')
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
            <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
            <p className="text-gray-400">We've sent you a password reset link</p>
          </div>

          {/* Success Card */}
          <div className="bg-[#222] rounded-xl shadow-2xl p-8 border border-orange-400/20 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-orange-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaEnvelope className="text-2xl text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Reset Email Sent</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                We've sent a password reset link to your email address. 
                Click the link in the email to reset your password.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                href="/auth/signin"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 inline-block"
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
              Didn't receive the email?{' '}
              <button
                onClick={() => setEmailSent(false)}
                className="text-orange-400 hover:text-orange-300"
              >
                Try again
              </button>
            </p>
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
          <h2 className="text-2xl font-bold text-white mb-2">Reset Your Password</h2>
          <p className="text-gray-400">Enter your email to receive a reset link</p>
        </div>

        {/* Reset Form */}
        <div className="bg-[#222] rounded-xl shadow-2xl p-6 border border-orange-400/20">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#18181b] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                />
              </div>
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
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-600"></div>
            <span className="px-4 text-gray-400 text-sm">or</span>
            <div className="flex-1 border-t border-gray-600"></div>
          </div>

          {/* Back to Sign In */}
          <div className="text-center">
            <p className="text-gray-400">
              Remember your password?{' '}
              <Link href="/auth/signin" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Links */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-xs text-gray-500">
            Need help?{' '}
            <Link href="/auth/help" className="text-orange-400 hover:text-orange-300">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

