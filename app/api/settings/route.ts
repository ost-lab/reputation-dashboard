import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from '@/lib/db';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const client = await pool.connect();
        const result = await client.query(
            'SELECT settings FROM users WHERE id = $1',
            [session.user.id]
        );
        client.release();
        // Return empty object if null
        return NextResponse.json(result.rows[0]?.settings || {});
    } catch (error) {
        console.error("Settings GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const newSettings = await req.json();

        const client = await pool.connect();
        // Update settings using JSONB merge (|| operator or jsonb_set, but || is easiest for merge)
        // Postgres '||' with jsonb merges keys.
        await client.query(
            'UPDATE users SET settings = settings || $1 WHERE id = $2',
            [JSON.stringify(newSettings), session.user.id]
        );
        client.release();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Settings PATCH Error:", error);
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}
