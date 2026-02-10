import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams, host } = new URL(req.url);
  const code = searchParams.get("code");
  const stateUserId = searchParams.get("state");

  if (!code || !stateUserId) {
    return NextResponse.json({ error: "Invalid Request: Missing Code or State" }, { status: 400 });
  }

  // ✅ FIX 1: Force HTTPS on Vercel (Vercel sometimes reports 'http' internally)
  const protocol = host.includes("localhost") ? "http" : "https";
  const redirectUri = `${protocol}://${host}/api/connect/google/callback`;

  console.log(`🔵 TRACE: Exchanging code for tokens using redirect_uri: ${redirectUri}`);

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
        redirect_uri: redirectUri,
      }),
    });

    const tokens = await tokenResponse.json();

    // 🛑 DEBUGGING: If Google refuses, log exactly why
    if (tokens.error) {
        console.error("❌ Google Token Error:", tokens);
        throw new Error(`Google Refused: ${tokens.error_description || tokens.error}`);
    }

    // 2. Get User Info (Email)
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    const userData = await userRes.json();
    const connectedEmail = userData.email || "Unknown Google Account";

    // 3. Save to DB
    const client = await pool.connect();
    try {
        console.log(`🔵 TRACE: Saving connection for User ${stateUserId} / Email ${connectedEmail}`);

        // ✅ FIX 2: Ensure User ID exists to prevent Foreign Key Crash
        // (Use a dummy name/email since we only need the ID to exist)
        await client.query(`
            INSERT INTO users (id, name, email, created_at)
            VALUES ($1, 'Admin User', 'admin@placeholder.com', NOW())
            ON CONFLICT (id) DO NOTHING
        `, [stateUserId]);

        // ✅ FIX 3: Save the connection
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
            tokens.refresh_token || null, // Handle missing refresh token gracefully
            Date.now() + (tokens.expires_in * 1000),
            connectedEmail
        ]);
        
        console.log("✅ SUCCESS: Google Account Linked!");

    } finally {
        client.release();
    }

    // 4. Redirect to Dashboard
    return NextResponse.redirect(`${protocol}://${host}/dashboard?platform=google&success=true`);

  } catch (error: any) {
    console.error("❌ CRITICAL CONNECTION ERROR:", error.message);
    // Return the actual error message so we can see it in the browser
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}