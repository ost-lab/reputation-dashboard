import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google"; // ✅ IMPORT THIS
import { compare } from "bcryptjs";
import pool from "@/lib/db";

export const authOptions = {
  providers: [
    // ✅ ADD GOOGLE PROVIDER HERE
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          // This asks for permission to see their Business Reviews
          scope: "openid email profile https://www.googleapis.com/auth/business.manage",
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    
    // ... keep your existing CredentialsProvider below ...
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
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [credentials.email]);
        const user = result.rows[0];
        if (!user || !user.password) throw new Error("User not found");
        const isValid = await compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid password");
        
        return { 
            id: user.id, 
            name: user.name, 
            email: user.email,
            accountType: user.account_type // pass this if you have it
        };
      }
    })
  ],
  callbacks: {
    async session({ session, token }: any) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    // We can add logic here later to save the Google Access Token to the DB
    async jwt({ token, account }: any) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    }
  },
  session: { strategy: "jwt" as const },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };