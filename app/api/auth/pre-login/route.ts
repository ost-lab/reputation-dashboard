import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import pool from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";
import { LoginSchema } from "@/lib/schemas";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. 🛡️ Validate Inputs
    const { email, password } = LoginSchema.parse(body);

    // 2. 🛡️ RATE LIMITING (Basic IP-based)
    // In production, use Redis. For now, Postgres works.
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    
    const limitCheck = await pool.query(
      "SELECT * FROM login_attempts WHERE ip_address = $1",
      [ip]
    );
    
    if (limitCheck.rows.length > 0) {
      const { attempts, blocked_until } = limitCheck.rows[0];
      
      // Check if currently blocked
      if (blocked_until && new Date() < new Date(blocked_until)) {
         return NextResponse.json(
           { message: "Too many attempts. Try again in 15 minutes." }, 
           { status: 429 } // 429 Too Many Requests
         );
      }
    }

    // 3. Find User
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    // 🛡️ SECURITY: Generic Error Message
    // Never say "User not found". Say "Invalid credentials" to prevent email enumeration.
    const genericError = "Invalid credentials";

    if (!user || !user.password) {
      await registerFailedAttempt(ip);
      return NextResponse.json({ message: genericError }, { status: 401 });
    }

    // 4. Validate Password
    const isValid = await compare(password, user.password);

    if (!isValid) {
      await registerFailedAttempt(ip);
      return NextResponse.json({ message: genericError }, { status: 401 });
    }

    // 5. Success - Clear Rate Limit & Send OTP
    await pool.query("DELETE FROM login_attempts WHERE ip_address = $1", [ip]);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

    await pool.query("DELETE FROM verification_codes WHERE email = $1", [email]);
    await pool.query("INSERT INTO verification_codes (email, code, expires_at) VALUES ($1, $2, $3)", [email, code, expiresAt]);
    await sendVerificationEmail(email, code);

    return NextResponse.json({ message: "OTP Sent" });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }
    console.error("Pre-Login Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// Helper to track failed attempts
async function registerFailedAttempt(ip: string) {
  // Upsert logic: Insert if new, update if exists
  await pool.query(`
    INSERT INTO login_attempts (ip_address, attempts, blocked_until)
    VALUES ($1, 1, NULL)
    ON CONFLICT (ip_address) 
    DO UPDATE SET 
      attempts = login_attempts.attempts + 1,
      blocked_until = CASE 
        WHEN login_attempts.attempts >= 4 THEN NOW() + INTERVAL '15 minutes'
        ELSE NULL
      END
  `, [ip]);
}