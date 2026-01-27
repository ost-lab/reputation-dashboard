import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) return NextResponse.redirect('/login');

    // 1. Get Code from URL
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    if (!code) return NextResponse.json({ error: "No code provided" });

    // 2. Swap Code for Tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/integrations/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokens.access_token) throw new Error("Failed to retrieve tokens");

    // 3. Save to Database
    await pool.query(`
      INSERT INTO connected_accounts (user_id, platform, access_token, refresh_token, expires_at)
      VALUES ($1, 'google', $2, $3, $4)
      ON CONFLICT (user_id, platform) 
      DO UPDATE SET 
        access_token = $2, 
        refresh_token = COALESCE($3, connected_accounts.refresh_token), -- Keep old refresh token if new one isn't sent
        expires_at = $4,
        created_at = NOW()
    `, [
      session.user.id,
      tokens.access_token,
      tokens.refresh_token, // Only sent on first consent!
      Date.now() + tokens.expires_in * 1000
    ]);

    // 4. Trigger Initial Sync (Optional but recommended)
    // await syncGoogleReviews(session.user.id);

    // 5. Redirect back to Dashboard
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?success=google_connected`);

  } catch (error) {
    console.error(error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?error=connection_failed`);
  }
}