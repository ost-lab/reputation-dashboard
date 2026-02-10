import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  // If not logged in, clearly not connected
  if (!session?.user?.id) {
      return NextResponse.json({ connected: false });
  }

  const { searchParams } = new URL(req.url);
  const platform = searchParams.get("platform");

  if (!platform) {
      return NextResponse.json({ error: "Missing platform param" }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    // Check if we have a record for this user + platform
    const res = await client.query(
        "SELECT connected_email FROM connected_accounts WHERE user_id = $1 AND platform = $2", 
        [session.user.id, platform]
    );

    if (res.rows.length > 0) {
        return NextResponse.json({ 
            connected: true, 
            email: res.rows[0].connected_email 
        });
    }
    
    return NextResponse.json({ connected: false });
  } catch (error) {
      console.error("Status Check Error:", error);
      return NextResponse.json({ error: "DB Error" }, { status: 500 });
  } finally {
    client.release();
  }
}