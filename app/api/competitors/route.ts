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
            'SELECT * FROM competitors WHERE user_id = $1 ORDER BY created_at DESC',
            [session.user.id]
        );
        client.release();
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error("Competitors GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch competitors" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { name, url, platform } = await req.json();

        if (!name || !platform) {
            return NextResponse.json({ error: "Name and Platform are required" }, { status: 400 });
        }

        const client = await pool.connect();
        const result = await client.query(
            'INSERT INTO competitors (user_id, name, url, platform) VALUES ($1, $2, $3, $4) RETURNING *',
            [session.user.id, name, url, platform]
        );
        client.release();
        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error("Competitors POST Error:", error);
        return NextResponse.json({ error: "Failed to add competitor" }, { status: 500 });
    }
}
