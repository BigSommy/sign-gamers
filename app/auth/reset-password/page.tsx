'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { FaGamepad, FaEye, FaEyeSlash, FaLock } from 'react-icons/fa'

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  })

  useEffect(() => {
    // Check if we have a valid session for password reset
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setIsValidSession(true)
      } else {
        // If no valid session, redirect to forgot password
        router.push('/auth/forgot-password')
      }
    }
    
    checkSession()
  }, [router])

  const onSubmit = async (data: ResetPasswordForm) => {
    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password
      })
      
      if (error) {
        toast.error(error.message || 'Failed to reset password')
      } else {
        toast.success('Password updated successfully!')
        router.push('/auth/signin')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#18181b] relative z-10">
        <div className="text-orange-400 text-xl">Loading...</div>
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
          <h2 className="text-2xl font-bold text-white mb-2">Set New Password</h2>
          <p className="text-gray-400">Enter your new password below</p>
        </div>

        {/* Reset Form */}
        <div className="bg-[#222] rounded-xl shadow-2xl p-6 border border-orange-400/20">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* New Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="w-full pl-10 pr-12 py-3 rounded-lg bg-[#18181b] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  className="w-full pl-10 pr-12 py-3 rounded-lg bg-[#18181b] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
            >
              {isLoading ? 'Updating...' : 'Update Password'}
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

