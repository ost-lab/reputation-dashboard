import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import pool from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    console.log("--------------------------------");
    console.log("🛑 PRE-LOGIN DEBUG:");
    console.log("1. Email Received:", email);
    console.log("2. Password Received:", password ? `"${password}"` : "EMPTY/NULL");

    // 1. Find User
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      console.log("❌ Error: User not found in Database");
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // 2. Validate Password
    console.log("3. User Found in DB:", user.email);
    console.log("4. Hashed Password in DB:", user.password?.substring(0, 15) + "...");

    const isValid = await compare(password, user.password);
    console.log("5. Do they match?", isValid);

    if (!isValid) {
      console.log("❌ Error: Password mismatch");
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // 3. Success
    console.log("✅ SUCCESS! Credentials valid. Sending OTP...");
    
    // ... (Your existing OTP logic) ...
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

    await pool.query("DELETE FROM verification_codes WHERE email = $1", [email]);
    await pool.query("INSERT INTO verification_codes (email, code, expires_at) VALUES ($1, $2, $3)", [email, code, expiresAt]);
    await sendVerificationEmail(email, code);

    return NextResponse.json({ message: "OTP Sent" });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}