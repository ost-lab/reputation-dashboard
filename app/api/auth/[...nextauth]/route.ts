import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import pool from "@/lib/db";

export const authOptions: AuthOptions = {
  providers: [
    // 1. GOOGLE PROVIDER (Updated for Production)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          // Forces the account picker and asks for permission every time
          prompt: "consent select_account", 
          access_type: "offline",
          response_type: "code",
          // The scope needed to read Business Reviews
          scope: "openid email profile https://www.googleapis.com/auth/business.manage"
        }
      }
    }),
    
    // 2. EMAIL/PASSWORD PROVIDER (Your existing logic)
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
           // Make sure to map any custom fields you added to your User type
           // accountType: user.account_type 
        };
      }
    })
  ],
  callbacks: {
    // A. SESSION: Pass the user ID to the frontend session
    async session({ session, token }: any) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },

    // B. JWT: Keep the tokens secure in the encrypted cookie
    async jwt({ token, account }: any) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },

    // C. SIGN IN: The critical step to SAVE the connection to DB
    async signIn({ user, account, profile }: any) {
      // We only care about saving tokens if the user is logging in with Google
      if (account?.provider === 'google') {
        try {
          const client = await pool.connect();
          try {
            console.log("🔗 LINKING GOOGLE ACCOUNT FOR:", user.email);

            // 1. Check if this email already exists in our 'users' table
            // This prevents duplicate accounts if they signed up with password first
            const userCheck = await client.query(
              "SELECT id FROM users WHERE email = $1", 
              [user.email]
            );

            let targetUserId = user.id; // Default to the ID Google gave us
            
            // If the user exists in OUR db, use THAT id instead
            if (userCheck.rows.length > 0) {
               targetUserId = userCheck.rows[0].id;
            } else {
               // Optional: If user doesn't exist, we could insert them into 'users' table here
               // For now, we assume NextAuth handles the session user creation
            }

            // 2. Insert or Update the 'connected_accounts' table
            // This saves the Access Token & Refresh Token we need for fetching reviews
            await client.query(`
              INSERT INTO connected_accounts 
              (user_id, platform, provider_account_id, access_token, refresh_token, expires_at)
              VALUES ($1, 'google', $2, $3, $4, $5)
              ON CONFLICT (user_id, platform) 
              DO UPDATE SET 
                access_token = $3, 
                refresh_token = $4,
                expires_at = $5,
                updated_at = NOW()
            `, [
              targetUserId, 
              account.providerAccountId, 
              account.access_token, 
              account.refresh_token,
              account.expires_at
            ]);

            console.log("✅ GOOGLE LINKED SUCCESSFULLY!");
            return true; // Login Success

          } finally {
            client.release();
          }
        } catch (error) {
          console.error("❌ Google Link Database Error:", error);
          return false; // Fail the login if DB write fails
        }
      }
      
      // For Credentials login, just return true
      return true;
    }
  },
  session: { strategy: "jwt" as const },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };