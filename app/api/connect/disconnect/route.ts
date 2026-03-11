import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from '@/lib/db';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { platform } = await req.json();

    const client = await pool.connect();
    await client.query(
      'DELETE FROM connected_accounts WHERE user_id = $1 AND platform = $2',
      [session.user.id, platform]
    );
    client.release();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Disconnect API Error:", error);
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
  }
}
