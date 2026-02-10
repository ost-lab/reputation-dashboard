import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams, protocol, host } = new URL(req.url);
  const code = searchParams.get("code");
  const stateUserId = searchParams.get("state");

  if (!code || !stateUserId) {
    return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
  }

  // ✅ FIX: Generate the exact same redirect URI dynamically
  const baseUrl = `${protocol}//${host}`;
  const redirectUri = `${baseUrl}/api/connect/google/callback`;

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri, // 👈 Must match the Start Route exactly
      }),
    });

    const tokens = await tokenResponse.json();
    if (tokens.error) throw new Error(tokens.error_description);

    // Get User Info
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    const userData = await userRes.json();
    const connectedEmail = userData.email || "Unknown Google Account";

    // Save to DB
    const client = await pool.connect();
    try {
        await client.query(`
            INSERT INTO connected_accounts 
            (user_id, platform, provider_account_id, access_token, refresh_token, expires_at, connected_email, updated_at)
            VALUES ($1, 'google', 'linked_business_profile', $2, $3, $4, $5, NOW())
            ON CONFLICT (user_id, platform) 
            DO UPDATE SET 
            access_token = $2, 
            refresh_token = $3,
            expires_at = $4,
            connected_email = $5, 
            updated_at = NOW()
        `, [
            stateUserId, 
            tokens.access_token, 
            tokens.refresh_token, 
            Date.now() + (tokens.expires_in * 1000),
            connectedEmail
        ]);
    } finally {
        client.release();
    }

    return NextResponse.redirect(`${baseUrl}/dashboard?platform=google&success=true`);

  } catch (error) {
    console.error("Connection Error:", error);
    return NextResponse.json({ error: "Connection Failed" }, { status: 500 });
  }
}