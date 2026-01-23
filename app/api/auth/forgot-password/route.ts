import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { v4 as uuidv4 } from "uuid"; // You might need: npm install uuid @types/uuid

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // 1. Check if user exists
    const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userCheck.rows.length === 0) {
      // Security: Don't reveal if email exists. Just say email sent.
      return NextResponse.json({ message: "If that email exists, we sent a link." });
    }

    // 2. Generate Token
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour expiry

    // 3. Save Token to DB
    await pool.query(
      "INSERT INTO password_reset_tokens (email, token, expires_at) VALUES ($1, $2, $3)",
      [email, token, expiresAt]
    );

    // 4. Send Email
    await sendPasswordResetEmail(email, token);

    return NextResponse.json({ message: "Password reset link sent" });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}