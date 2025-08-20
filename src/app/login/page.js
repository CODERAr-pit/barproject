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

  // Redirect to home page after successful login
  useEffect(() => {
    if (session) {
      console.log('User logged in, redirecting to home...')
      router.push('/') // Redirect to home page or dashboard
    }
  }, [session, router])

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

  // If user is already signed in, show their info
  if (session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
        <div className="bg-[#111827] p-8 rounded-lg w-full max-w-md shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Welcome!</h2>
          <div className="mb-4">
            {session.user.image && (
              <img 
                src={session.user.image} 
                alt="Profile" 
                className="w-16 h-16 rounded-full mx-auto mb-2"
              />
            )}
            <p className="text-lg">{session.user.name}</p>
            <p className="text-sm text-gray-400">{session.user.email}</p>
          </div>
          <button 
            onClick={() => signOut()}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-md"
          >
            Sign out
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

  // Handle OAuth login
  const handleOAuthLogin = async (provider) => {
    setError('')
    setIsLoading(true)
    
    try {
      console.log(`Attempting ${provider} login...`)
      const result = await signIn(provider, { 
        redirect: true,
        callbackUrl: '/' 
      })
      console.log('OAuth result:', result)
    } catch (error) {
      setError('Login failed')
      console.error('OAuth error:', error)
    } finally {
      setIsLoading(false)
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
      </div>
    </div>
  );
}