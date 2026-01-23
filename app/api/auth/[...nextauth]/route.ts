import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import pool from "@/lib/db";

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/login' },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Code", type: "text" } 
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.code) {
          throw new Error("Missing email or code");
        }
        const { email, code } = credentials;

        // 1. Verify Code
        const codeResult = await pool.query(
          "SELECT * FROM verification_codes WHERE email = $1 AND code = $2 AND expires_at > $3",
          [email, code, new Date()]
        );

        if (codeResult.rows.length === 0) {
          throw new Error("Invalid or expired code");
        }

        // 2. Get User
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) throw new Error("User not found");

        // 3. Mark Verified & Cleanup
        await pool.query("UPDATE users SET email_verified = NOW() WHERE email = $1", [email]);
        await pool.query("DELETE FROM verification_codes WHERE email = $1", [email]);

        // 4. Return User (Include account_type here!)
        return { 
          id: String(user.id), 
          name: user.name, 
          email: user.email,
          // ✅ FIX: Map DB column 'account_type' to session property 'accountType'
          // If your DB column is named differently, update this (e.g., user.accounttype)
          accountType: user.account_type || "personal" 
        };
      }
    })
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") return true;
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // @ts-ignore
        token.accountType = user.accountType; // ✅ Persist to Token
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
         // @ts-ignore
        session.user.id = String(token.id);
         // @ts-ignore
        session.user.accountType = token.accountType; // ✅ Persist to Session
      }
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };