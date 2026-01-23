import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import pool from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email'; // Import the helper

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

    // 4. Insert User into DB
    // Note: We are NOT returning the user object yet because they aren't verified.
    // Ensure your database schema has 'email_verified' defaulting to NULL or logic to handle it.
    await pool.query(
      "INSERT INTO users (name, email, password, provider) VALUES ($1, $2, $3, 'credentials')",
      [name, email, hashedPassword]
    );

    // 5. Generate 6-Digit Code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // Set expiration to 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

    // 6. Save Code to DB (verification_codes table)
    // Make sure you ran the SQL to create this table!
    await pool.query(
      "INSERT INTO verification_codes (email, code, expires_at) VALUES ($1, $2, $3)",
      [email, code, expiresAt]
    );

    // 7. Send Email
    await sendVerificationEmail(email, code);

    // 8. Return Success (Redirect frontend to OTP entry page)
    return NextResponse.json({ message: "User created. Verification code sent." });

  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}