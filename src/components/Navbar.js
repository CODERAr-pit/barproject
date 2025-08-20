"use client"
import React from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"

const Navbar = () => {
  const { data: session } = useSession()

  return (
    <nav className="bg-transparent backdrop-blur-sm border-b border-gray-700/20">
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
              <Link href="/find-barbers" className="hover:text-blue-400 transition-colors">
                Find Barbers
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-blue-400 transition-colors">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-blue-400 transition-colors">
              Shop
              </Link>
            </li>
          </ul>

          {/* Auth Buttons */}
          {!session ? (
            <Link href="/login">
              <button className="px-4 py-2 text-gray-300 hover:text-white rounded-lg hover:bg-gray-800/50 transition-all">
                Sign In
              </button>
            </Link>
          ) : (
            <button
              onClick={() => signOut()}
              className="px-4 py-2 text-gray-300 hover:text-white rounded-lg hover:bg-gray-800/50 transition-all"
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
