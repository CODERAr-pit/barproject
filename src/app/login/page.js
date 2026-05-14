"use client"
import React, { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from 'next/navigation'

export default function LogIn() {
  const { data: session, status } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Debug: Log session data
  useEffect(() => {
    console.log('Session status:', status)
    console.log('Session data:', session)
  }, [session, status])

  // Redirect to home page after successful login - IMPROVED
  useEffect(() => {
    if (status === 'authenticated' && session) {
      console.log('User logged in, redirecting to home...')
      // Use replace instead of push to avoid back button issues
      router.replace('/')
    }
  }, [session, status, router])

  // Show loading state while session is being fetched
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is authenticated, show loading screen instead of welcome screen
  if (status === 'authenticated' && session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
        <div className="bg-[#111827] p-8 rounded-lg w-full max-w-md shadow-lg text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-bold mb-2">Redirecting...</h2>
          <p className="text-sm text-gray-400">Taking you to the home page</p>
          
          {/* Fallback button in case redirect doesn\u0027t work */}
          <button 
            onClick={() => router.replace('/')}
            className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-md"
          >
            Go to Home
          </button>
          
          <button 
            onClick={() => signOut()}
            className="mt-2 w-full bg-red-500 hover:bg-red-600 text-white font-medium py-1 rounded-md text-sm"
          >
            Sign out instead
          </button>
        </div>
      </div>
    )
  }

  // Handle form submission for credentials login
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        role: "customer"
      })
      
      if (result?.error) {
        setError('Login failed: ' + result.error)
      } else if (result?.ok) {
        console.log('Credentials login successful')
        // Session will update automatically, useEffect will handle redirect
      }
    } catch (error) {
      setError('An error occurred during login')
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle OAuth login - IMPROVED
  const handleOAuthLogin = async (provider) => {
    setError('')
    
    try {
      console.log(`Attempting ${provider} login...`)
      
      // For OAuth, let NextAuth handle the redirect completely
      await signIn(provider, { 
        callbackUrl: '/' 
      })
      
      // This line might not execute due to redirect
      console.log('OAuth login initiated')
    } catch (error) {
      setError('Login failed: ' + error.message)
      console.error('OAuth error:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
      <div className="bg-[#111827] p-8 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-center text-2xl font-bold mb-6">
          Sign in to your account
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-[#1f2937] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="demo@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-[#1f2937] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="password123"
              required
            />
          </div>

          <div className="text-xs text-gray-400">
            Demo credentials: demo@example.com / password123
          </div>

          {/* Sign in Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium py-2 rounded-md"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-700" />
          <span className="px-2 text-sm text-gray-400">Or continue with</span>
          <hr className="flex-grow border-gray-700" />
        </div>

        {/* Social Buttons */}
        <div className="flex gap-4">
          <button 
            onClick={() => handleOAuthLogin('google')}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 w-1/2 bg-[#1f2937] hover:bg-[#374151] disabled:opacity-50 border border-gray-700 rounded-md py-2"
          >
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Google
          </button>
          <button 
            onClick={() => handleOAuthLogin('github')}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 w-1/2 bg-[#1f2937] hover:bg-[#374151] disabled:opacity-50 border border-gray-700 rounded-md py-2"
          >
            <img
              src="https://www.svgrepo.com/show/475654/github-color.svg"
              alt="GitHub"
              className="w-5 h-5"
            />
            GitHub
          </button>
        </div>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-400">
            Don&apos;t have an account?{' '}
            <a href="/signup" className="text-indigo-400 hover:text-indigo-300">
              Sign up
            </a>
          </p>
          <p className="text-sm text-gray-400">
            Are you a barber?{' '}
            <a href="/barberLogin" className="text-green-400 hover:text-green-300">
              Barber Login
            </a>
            {' '}or{' '}
            <a href="/barberSignUp" className="text-green-400 hover:text-green-300">
              Barber Signup
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}