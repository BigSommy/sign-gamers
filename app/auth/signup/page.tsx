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

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be less than 20 characters')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SignUpForm = z.infer<typeof signUpSchema>

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { signUp } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
  })

  const onSubmit = async (data: SignUpForm) => {
    setIsLoading(true)
    
    try {
      const { error } = await signUp(data.email, data.password, data.username)
      
      if (error) {
        toast.error(error.message || 'Failed to create account')
      } else {
        toast.success('Account created! Please check your email to verify your account.')
        router.push('/auth/verify-email')
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
            <h1 className="text-3xl font-bold text-orange-400">Create Your Account</h1>
          </div>
          <p className="text-gray-400">Join the ultimate gaming community</p>
        </div>

        {/* Sign Up Form */}
        <div className="bg-[#222] rounded-xl shadow-2xl p-6 border border-orange-400/20">
          {/* Email Verification Notice */}
          <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <p className="text-sm text-orange-300">
              📧 <strong>Important:</strong> After creating your account, you'll need to verify your email address before you can sign in.
            </p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                {...register('username')}
                type="text"
                id="username"
                className="w-full px-4 py-3 rounded-lg bg-[#18181b] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                placeholder="Choose a username"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-400">{errors.username.message}</p>
              )}
            </div>

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
                  placeholder="Create a password"
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
                Confirm Password
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  className="w-full px-4 py-3 pr-12 rounded-lg bg-[#18181b] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                  placeholder="Confirm your password"
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
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-600"></div>
            <span className="px-4 text-gray-400 text-sm">or</span>
            <div className="flex-1 border-t border-gray-600"></div>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Terms and Privacy */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-orange-400 hover:text-orange-300">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-orange-400 hover:text-orange-300">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

