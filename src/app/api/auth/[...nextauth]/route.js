// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
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
            image: null,
          }
        }
         
        // Add your real authentication logic here

        // You can connect to your database and verify credentials
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
    
    async session({ session, token }) {
      // Add any additional user data to session
      if (token) {
        session.user.id = token.sub
      }
      
      console.log('📱 Session created:', {
        userId: session.user.id,
        email: session.user.email
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
    async signIn({ user, account }) {
      console.log(`✅ User ${user.email} signed in with ${account?.provider}`)
    },
    
    async signOut() {
      console.log(`👋 User signed out`)
    },
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
})

export { handler as GET, handler as POST }