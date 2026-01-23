import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import pool from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    // --- DEBUG LOGS ---
    console.log("1. Received Token:", token);
    
    // 1. Find Valid Token
    // FIX: We replace 'NOW()' with '$2' and pass 'new Date()' from Node.js
    // This ensures we compare apples to apples regarding timezones.
    const result = await pool.query(
      "SELECT * FROM password_reset_tokens WHERE token = $1 AND expires_at > $2",
      [token, new Date()] 
    );

    if (result.rows.length === 0) {
      console.log("❌ Token validation failed (Expired or Invalid).");
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 });
    }

    const email = result.rows[0].email;
    console.log("✅ Token verified for:", email);

    // 2. Hash New Password
    const hashedPassword = await hash(password, 10);

    // 3. Update User Password
  await pool.query(
      "UPDATE users SET password = $1, email_verified = NOW() WHERE email = $2", 
      [hashedPassword, email]
    );

    // 4. Delete Used Token (Cleanup)
    await pool.query("DELETE FROM password_reset_tokens WHERE email = $1", [email]);

    return NextResponse.json({ message: "Password updated successfully" });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}