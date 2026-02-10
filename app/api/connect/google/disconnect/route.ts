import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from "@/lib/db";

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await pool.connect();
  try {
    // Delete the Google connection for this user
    await client.query(
      "DELETE FROM connected_accounts WHERE user_id = $1 AND platform = 'google'", 
      [session.user.id]
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  } finally {
    client.release();
  }
}