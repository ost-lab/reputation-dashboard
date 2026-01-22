import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import pool from "@/lib/db";

const handler = NextAuth({
  session: {
    strategy: 'jwt',
  },
  providers: [
    // 1. Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    
    // 2. Email/Password Provider
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        // Find user in DB
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [credentials.email]);
        const user = result.rows[0];

        if (!user || !user.password) {
          throw new Error("User not found or using Google login");
        }

        // Verify Password
        const isValid = await compare(credentials.password, user.password);
        
        if (!isValid) {
          throw new Error("Invalid password");
        }

        return { id: user.id, name: user.name, email: user.email };
      }
    })
  ],
  callbacks: {
    // This runs when a user logs in (Google OR Credentials)
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const { email, name, image } = user;
          
          // Check if user exists
          const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
          
          if (userCheck.rows.length === 0) {
            // Create new Google user in our DB
            await pool.query(
              "INSERT INTO users (name, email, image, provider) VALUES ($1, $2, $3, 'google')",
              [name, email, image]
            );
          }
          return true;
        } catch (error) {
          console.error("Google Login Error:", error);
          return false;
        }
      }
      return true; // Credentials login allows passage
    },
    
    async session({ session, token }) {
      if (session.user) {
         // @ts-ignore
        session.user.id = token.sub; // Add ID to session
      }
      return session;
    }
  }
});

export { handler as GET, handler as POST };