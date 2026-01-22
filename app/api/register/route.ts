import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import pool from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // 1. Validate Input
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 2. Check if User Exists
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // 3. Hash Password
    const hashedPassword = await hash(password, 10);

    // 4. Insert User
    const result = await pool.query(
      "INSERT INTO users (name, email, password, provider) VALUES ($1, $2, $3, 'credentials') RETURNING id, name, email",
      [name, email, hashedPassword]
    );

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}