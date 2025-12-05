import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { clientPromise } from "@/lib/db";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import dbConnect from "@/lib/db";

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development-only",

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        await dbConnect();
        
        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error("No user found with this email");
        }

        if (!user.password) {
          throw new Error("Please sign in with your social account");
        }

        const isValid = await user.comparePassword(credentials.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.username,
          role: user.role,
        };
      },
    }),
  ],

callbacks: {
  async jwt({ token, user }) {
    // Persist user id and role on the token for session usage
    if (user) {
      token.id = user.id || user._id?.toString();
      if (user.role) token.role = user.role;
    }
    return token;
  },

  async session({ session, token }) {
    // Expose id (and role if available) on the client session
    if (token) {
      session.user.id = token.id || token.sub || session.user.id;
      if (token.role && !session.user.role) session.user.role = token.role;
    }
    return session;
  },

  async signIn({ user, account, profile }) {
    await dbConnect();

    let existingUser = await User.findOne({ email: user.email });

    if (!existingUser) {
      // Create a new user for first-time OAuth
      existingUser = await User.create({
        email: user.email,
        username: user.name,
        role: "customer",
        image: user.image || null,
      });
    } else {
      // Optional: update profile fields if missing
      let updated = false;

      if (!existingUser.username && user.name) {
        existingUser.username = user.name;
        updated = true;
      }
      if (!existingUser.image && user.image) {
        existingUser.image = user.image;
        updated = true;
      }
      if (!existingUser.role) {
        existingUser.role = "customer";
        updated = true;
      }

      if (updated) await existingUser.save();
    }

    // ✅ Always allow sign in for OAuth, even if email already exists
    return true;
  },
}
,

  pages: {
    signIn: '/login', // This matches your app/login/page.js structure
  },

  session: {
    strategy: "jwt",
  },

  events: {
    async signIn({ user, account }) {
      console.log("✅ User signed in:", user.email, "via", account.provider);
    },
  },
};