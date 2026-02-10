import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from "@/lib/db";

// ✅ Fix: Type params as a Promise
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Fix: Await the params before accessing .id
    const { id } = await params;

    const client = await pool.connect();
    try {
      // Ensure the competitor belongs to the logged-in user
      const result = await client.query(
        "DELETE FROM competitors WHERE id = $1 AND user_id = $2 RETURNING *",
        [id, session.user.id]
      );

      if (result.rowCount === 0) {
        return NextResponse.json({ error: "Competitor not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}