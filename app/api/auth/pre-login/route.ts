import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import pool from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 1. Find User
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !user.password) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // 2. Validate Password
    const isValid = await compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // 3. Password is Correct! Now Generate & Send OTP.
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Cleanup old codes
    await pool.query("DELETE FROM verification_codes WHERE email = $1", [email]);
    
    // Save new code
    await pool.query(
      "INSERT INTO verification_codes (email, code, expires_at) VALUES ($1, $2, $3)",
      [email, code, expiresAt]
    );

    // Send Email
    await sendVerificationEmail(email, code);

    return NextResponse.json({ message: "OTP Sent" });

  } catch (error) {
    console.error("Pre-Login Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}