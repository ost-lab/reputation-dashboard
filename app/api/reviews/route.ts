import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await pool.connect();
    try {
      // ✅ FIX: Changed 'ORDER BY date' to 'ORDER BY created_at'
      const result = await client.query(
        `SELECT * FROM reviews 
         WHERE user_id = $1 
         ORDER BY created_at DESC`, 
        [session.user.id]
      );

      return NextResponse.json(result.rows);
    } finally {
      client.release();
    }

  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}