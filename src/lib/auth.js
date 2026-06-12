import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { clientPromise } from "@/lib/db";
import User from "@/models/User";       
import Barber from "@/models/Barber";   
import dbConnect from "@/lib/db";
import bcrypt from "bcryptjs";
import { LoginValidation } from "@/lib/validations"; 
import { hashids } from "@/lib/hash";

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" } //
      },
      async authorize(credentials) {
        const result = LoginValidation.safeParse(credentials);
        if (!result.success) throw new Error("Invalid format"); 
        
        const { email, password, role } = result.data;
        await dbConnect();
        // ROUTE A: BARBER LOGIN
        if (role === "barber") {
          const barber = await Barber.findOne({ email });
          if (!barber) throw new Error("No barber account found.");
          
          const isValid = await bcrypt.compare(password, barber.password); 
          if (!isValid) throw new Error("Invalid password");

          return {
            id: barber._id.toString(),
            email: barber.email,
            name: barber.shopName || barber.firstName,
            role: "barber",
          };
        } 
        // ROUTE B: CUSTOMER LOGIN
        else if (role === "customer") {
          const user = await User.findOne({ email });
          if (!user) throw new Error("No customer account found.");
          if (!user.password) throw new Error("Please sign in with Google.");
          
          const isValid = await user.comparePassword(password);
          if (!isValid) throw new Error("Invalid password");

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.username,
            role: "customer",
          };
        }

        throw new Error("Invalid login type specified");
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      //since we are using adpter we can remove the below code,no need for it , next will itself create if needed
      await dbConnect();
      if (account.provider === "credentials") return true;

      let existingUser = await User.findOne({ email: user.email });
      if (!existingUser) {
        existingUser = await User.create({
          email: user.email,
          username: user.name,
          role: "customer", 
          image: user.image || null,
        });
      }

      user.id = existingUser._id.toString();
      user.role = "customer";
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const rawId = user.id || user._id?.toString();
        token.id = hashids.encodeHex(rawId); 
        token.role = user.role; 
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  
  session: { strategy: "jwt" },
};