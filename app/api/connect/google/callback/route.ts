import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const stateUserId = searchParams.get("state"); // This is YOUR Admin ID

  if (!code || !stateUserId) {
    return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
  }

  try {
    // 1. Exchange Code for Tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/connect/google/callback`,
      }),
    });

    const tokens = await tokenResponse.json();

    if (tokens.error) throw new Error(tokens.error_description);

    // 2. Save Tokens to the "stateUserId" (The Admin)
    // We don't care what email logged in at Google. We link it to the Admin.
    const client = await pool.connect();
    try {
        await client.query(`
            INSERT INTO connected_accounts 
            (user_id, platform, provider_account_id, access_token, refresh_token, expires_at, updated_at)
            VALUES ($1, 'google', 'linked_business_profile', $2, $3, $4, NOW())
            ON CONFLICT (user_id, platform) 
            DO UPDATE SET 
            access_token = $2, 
            refresh_token = $3,
            expires_at = $4,
            updated_at = NOW()
        `, [
            stateUserId, 
            tokens.access_token, 
            tokens.refresh_token, 
            Date.now() + (tokens.expires_in * 1000)
        ]);
    } finally {
        client.release();
    }

    // 3. Success! Go back to Dashboard
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?platform=google&success=true`);

  } catch (error) {
    console.error("Connection Error:", error);
    return NextResponse.json({ error: "Connection Failed" }, { status: 500 });
  }
}