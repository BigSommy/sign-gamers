'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { FaEye, FaEyeSlash, FaGamepad } from 'react-icons/fa'

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type SignInForm = z.infer<typeof signInSchema>

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { signIn } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (data: SignInForm) => {
    setIsLoading(true)
    
    try {
      const { error } = await signIn(data.email, data.password)
      
      if (error) {
        // Handle specific error cases with user-friendly messages
        if (error.message === 'Email not confirmed') {
          toast.error('Please verify your email before signing in. Check your inbox for a verification link.')
        } else {
          toast.error(error.message || 'Failed to sign in')
        }
      } else {
        toast.success('Welcome back!')
        // Don't redirect here - let the AuthContext handle it
        // The useEffect in the component will handle redirection based on user state
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
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
          <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400">Sign in to your account</p>
        </div>

        {/* Sign In Form */}
        <div className="bg-[#222] rounded-xl shadow-2xl p-6 border border-orange-400/20">
          {/* Email Verification Reminder */}
          <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <p className="text-sm text-orange-300">
              💡 <strong>New user?</strong> Make sure to verify your email after signing up before trying to sign in.
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
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="w-full px-4 py-3 pr-12 rounded-lg bg-[#18181b] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                  placeholder="Enter your password"
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

                      {/* Help Links */}
          <div className="flex items-center justify-between">
            <Link 
              href="/auth/forgot-password" 
              className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
            >
              Forgot your password?
            </Link>
            <Link 
              href="/auth/verify-email" 
              className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
            >
              Need to verify email?
            </Link>
          </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            {/* Forgot Password Link */}
            <div className="text-center">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-600"></div>
            <span className="px-4 text-gray-400 text-sm">or</span>
            <div className="flex-1 border-t border-gray-600"></div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Links */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-xs text-gray-500">
            Having trouble signing in?{' '}
            <Link href="/auth/help" className="text-orange-400 hover:text-orange-300">
              Get help
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
