import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import pool from "@/lib/db"; // Note: We don't need 'compare' or 'bcryptjs' here anymore

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/login' },

  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    
    CredentialsProvider({
      name: "Credentials",
      // ✅ CHANGE 1: We now expect 'email' and 'code' (Password is checked in pre-login)
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Code", type: "text" } 
      },
      
      async authorize(credentials) {
        // 1. Validate Inputs
        if (!credentials?.email || !credentials?.code) {
          throw new Error("Missing email or verification code");
        }

        const { email, code } = credentials;

        // 2. Validate Code Logic
        // We check if the code exists, matches the email, and hasn't expired.
        // We use 'new Date()' to ensure timezone safety.
        const codeResult = await pool.query(
          "SELECT * FROM verification_codes WHERE email = $1 AND code = $2 AND expires_at > $3",
          [email, code, new Date()]
        );

        if (codeResult.rows.length === 0) {
          throw new Error("Invalid or expired verification code");
        }

        // 3. Code is Valid! Now Find the User.
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
          throw new Error("User not found");
        }

        // 4. Update Verification Status
        // Since they just proved they own the email (by having the code), 
        // we mark them verified and update their last login.
        await pool.query("UPDATE users SET email_verified = NOW() WHERE email = $1", [email]);

        // 5. Cleanup (Delete the used code so it can't be reused)
        await pool.query("DELETE FROM verification_codes WHERE email = $1", [email]);

        // 6. Return User to create session
        return { 
          id: String(user.id), 
          name: user.name, 
          email: user.email 
        };
      }
    })
  ],

  callbacks: {
    async signIn({ user, account }) {
      // 1. Google Login Logic
      if (account?.provider === "google") {
        try {
          const { email, name, image } = user;
          const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
          
          if (userCheck.rows.length === 0) {
            await pool.query(
              "INSERT INTO users (name, email, image, provider, email_verified) VALUES ($1, $2, $3, 'google', NOW())",
              [name, email, image]
            );
          }
        } catch (error) {
          console.error("Google Login Error:", error);
          return false;
        }
      }

      // 2. Credentials Logic
      // Since 'authorize' successfully returned a user, we allow the login.
      if (account?.provider === "credentials") {
        return true;
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
         // @ts-ignore
        session.user.id = String(token.id);
      }
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };