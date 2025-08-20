// lib/auth.js - With MongoDB integration
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { MongoClient } from "mongodb"

// MongoDB connection
const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017/barber-app")
const clientPromise = client.connect()

export const authOptions = {
  // Use MongoDB adapter to save users/sessions/accounts to database
  adapter: MongoDBAdapter(clientPromise),
  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { 
          label: 'Email', 
          type: 'email',
          placeholder: 'Enter your email'
        },
        password: { 
          label: 'Password', 
          type: 'password',
          placeholder: 'Enter your password'
        }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Demo credentials for testing
        if (credentials.email === "demo@example.com" && credentials.password === "password123") {
          return {
            id: "demo-user",
            email: credentials.email,
            name: "Demo User",
          }
        }

        // Add your real authentication logic here
        // You can query your User model here if needed
        return null
      }
    })
  ],
  
  pages: {
    signIn: '/login',
  },
  
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('🔐 Sign in attempt:', { 
        user: user.email, 
        provider: account?.provider 
      })
      return true
    },
    
    async session({ session, user }) {
      // Add user ID from database to session
      if (user) {
        session.user.id = user.id
        session.user.role = user.role || null
      }
      
      console.log('📱 Session created:', {
        userId: session.user.id,
        email: session.user.email,
        role: session.user.role
      })
      
      return session
    },
    
    async redirect({ url, baseUrl }) {
      console.log('🔄 Redirecting:', { url, baseUrl })
      
      // Handle undefined values safely
      if (!url) return baseUrl
      if (!baseUrl) return '/'
      
      // Allow relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      
      // Allow callback URLs on the same origin
      try {
        const urlObj = new URL(url)
        const baseUrlObj = new URL(baseUrl)
        if (urlObj.origin === baseUrlObj.origin) return url
      } catch (error) {
        console.error('Redirect URL error:', error)
      }
      
      return baseUrl
    }
  },
  
  events: {
    async createUser({ user }) {
      console.log('👤 New user created in database:', {
        id: user.id,
        email: user.email,
        name: user.name
      })
    },
    
    async signIn({ user, account, profile }) {
      console.log(`✅ User ${user.email} signed in with ${account?.provider}`)
    },
    
    async signOut({ session }) {
      console.log(`👋 User signed out`)
    },
  },
  
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
  debug: process.env.NODE_ENV === 'development',
}