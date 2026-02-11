import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await pool.connect();

    try {
      // Fetch ALL reviews (Newest First)
      // We join with connected_accounts if you want platform metadata, 
      // but a simple SELECT is enough for now.
      const res = await client.query(`
          SELECT * FROM reviews 
          WHERE user_id = $1 
          ORDER BY created_at DESC
      `, [session.user.id]);

      return NextResponse.json({ reviews: res.rows });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Reviews API Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}