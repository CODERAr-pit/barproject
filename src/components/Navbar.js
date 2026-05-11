"use client"
import React from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"

const Navbar = () => {
  const { data: session } = useSession()

  return (
    <nav className="sticky top-0 z-40 bg-black/30 backdrop-blur-md border-b border-gray-800/30">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">X</span>
          </div>
          <span className="text-xl font-bold text-white">Xenum Services</span>
        </Link>

        {/* Links + Auth */}
        <div className="flex items-center space-x-6">
          {/* Navigation Links */}
          <ul className="hidden md:flex space-x-6 text-gray-300 font-medium">
            <li>
              <Link href="/" className="hover:text-blue-400 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="/find" className="hover:text-blue-400 transition-colors">
                Find Barbers
              </Link>
            </li>
            
            <li>
              <Link href="/barberLogin" className="hover:text-blue-400 transition-colors">
              My Shop
              </Link>
            </li>
            <li>
              <Link href="/history" className="hover:text-blue-400 transition-colors">
              History
              </Link>
            </li>
          </ul>

          {/* Auth Buttons */}
          {!session ? (
            <Link href="/login">
              <button className="px-4 py-2 text-gray-300 hover:text-white rounded-lg hover:bg-gray-800/60 transition-colors border border-transparent hover:border-gray-700">
                Sign In
              </button>
            </Link>
          ) : (
            <button
              onClick={() => signOut()}
              className="px-4 py-2 text-gray-300 hover:text-white rounded-lg hover:bg-gray-800/60 transition-colors border border-transparent hover:border-gray-700"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
