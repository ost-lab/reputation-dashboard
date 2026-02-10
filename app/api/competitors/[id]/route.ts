import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from '@/lib/db';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const client = await pool.connect();
        await client.query(
            'DELETE FROM competitors WHERE id = $1 AND user_id = $2',
            [id, session.user.id] // Ensure user owns the record
        );
        client.release();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Competitors DELETE Error:", error);
        return NextResponse.json({ error: "Failed to delete competitor" }, { status: 500 });
    }
}
