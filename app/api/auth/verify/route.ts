import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;
    
    // 1. Sanitize the code (Remove spaces and force string)
    const code = String(body.code).trim();

    console.log("--- VERIFY ATTEMPT ---");
    console.log("Email:", email);
    console.log("Code Received:", code);

    // 2. DEBUG CHECK: See if the code exists in DB at all (Ignoring time)
    // This helps us know if it's a Typos issue or a Time issue
    const debugCheck = await pool.query(
      "SELECT * FROM verification_codes WHERE email = $1 AND code = $2",
      [email, code]
    );

    if (debugCheck.rows.length > 0) {
      console.log("✅ Code match found in DB.");
      console.log("   - Expires At:", debugCheck.rows[0].expires_at);
      console.log("   - Server Time:", new Date());
    } else {
      console.log("❌ No matching code found in DB for this email.");
    }

    // 3. REAL CHECK: Validate Code AND Expiry
    // We use $3 (new Date()) instead of NOW() to fix timezone issues
    const result = await pool.query(
      "SELECT * FROM verification_codes WHERE email = $1 AND code = $2 AND expires_at > $3",
      [email, code, new Date()] 
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ message: "Invalid or expired code" }, { status: 400 });
    }

    // 4. Mark User as Verified
    await pool.query("UPDATE users SET email_verified = NOW() WHERE email = $1", [email]);

    // 5. Cleanup: Delete the used code
    await pool.query("DELETE FROM verification_codes WHERE email = $1", [email]);

    console.log("🎉 User Verified Successfully!");
    return NextResponse.json({ message: "Verified successfully" });

  } catch (error) {
    console.error("Verify Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}