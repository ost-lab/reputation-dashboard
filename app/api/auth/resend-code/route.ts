import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    // 1. Check if user exists
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userResult.rows.length === 0) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const user = userResult.rows[0];

    // ✅ FIX: Check if already verified
    if (user.email_verified) {
       return NextResponse.json({ message: "User is already verified" }, { status: 400 });
    }
    
    // 2. Cleanup old codes
    await pool.query("DELETE FROM verification_codes WHERE email = $1", [email]);

    // 3. Generate New Code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

    // 4. Save Code
    await pool.query(
      "INSERT INTO verification_codes (email, code, expires_at) VALUES ($1, $2, $3)",
      [email, code, expiresAt]
    );

    // 5. Send Email
    await sendVerificationEmail(email, code);

    return NextResponse.json({ message: "Verification code sent" });

  } catch (error) {
    console.error("Resend Error:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}