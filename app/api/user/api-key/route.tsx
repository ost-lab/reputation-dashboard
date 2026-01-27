import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from "@/lib/db";
import crypto from "crypto";

// Helper to check session
async function getUserId() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

// GET: Retrieve existing key
export async function GET() {
  try {
    const userId = await getUserId();
    const res = await pool.query("SELECT api_key FROM users WHERE id = $1", [userId]);
    
    // If no key exists, return null (UI handles this)
    return NextResponse.json({ apiKey: res.rows[0]?.api_key || "" });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// POST: Generate new key
export async function POST() {
  try {
    const userId = await getUserId();
    
    // Generate a secure random key
    const newKey = 'sk_live_' + crypto.randomBytes(24).toString('hex');
    
    await pool.query("UPDATE users SET api_key = $1 WHERE id = $2", [newKey, userId]);
    
    return NextResponse.json({ apiKey: newKey });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}