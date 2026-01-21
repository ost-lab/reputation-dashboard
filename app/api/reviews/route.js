import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// 1. GET ALL REVIEWS
export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM reviews ORDER BY date DESC');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// 2. ADD A REVIEW (POST)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_name, rating, text, source } = body;

    const result = await pool.query(
      'INSERT INTO reviews (user_name, rating, text, source) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_name, rating, text, source || 'Manual']
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save review' }, { status: 500 });
  }
}

// 3. UPDATE / REPLY (PATCH)
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, reply } = body;

    const result = await pool.query(
      "UPDATE reviews SET admin_reply = $1, status = 'replied' WHERE id = $2 RETURNING *",
      [reply, id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}

// 4. DELETE (DELETE)
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    await pool.query('DELETE FROM reviews WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}