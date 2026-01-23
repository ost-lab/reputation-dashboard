import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import pool from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email'; 
import { RegisterSchema } from '@/lib/schemas'; // Import Zod Schema
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. 🛡️ REAL WORLD SECURITY: Validate Inputs with Zod
    // If validation fails, this line will throw a detailed error automatically
    const validData = RegisterSchema.parse(body);

    const { name, email, password, accountType, businessType, platforms } = validData;

    // 2. Check if User Exists
    const userCheck = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 }); // 409 Conflict
    }

    // 3. Hash Password (bcryptjs is good, ensure salt rounds is 10-12)
    const hashedPassword = await hash(password, 12); // Increased cost to 12 for better security

    // 4. Prepare Data
    const typeToSave = accountType === 'business' ? 'business' : 'personal';
    const platformsToSave = platforms ? JSON.stringify(platforms) : null;
    const businessTypeToSave = businessType || null;

    // 5. Insert into DB
    await pool.query(
      `INSERT INTO users (
        name, email, password, provider, account_type, business_type, platforms
      ) VALUES ($1, $2, $3, 'credentials', $4, $5, $6)`,
      [name, email, hashedPassword, typeToSave, businessTypeToSave, platformsToSave]
    );

    // 6. Generate Code & Send Email
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

    await pool.query("DELETE FROM verification_codes WHERE email = $1", [email]);
    await pool.query(
      "INSERT INTO verification_codes (email, code, expires_at) VALUES ($1, $2, $3)",
      [email, code, expiresAt]
    );

    await sendVerificationEmail(email, code);

    return NextResponse.json({ message: "Account created" });

  } catch (error) {
    // 🛡️ Secure Error Handling
    if (error instanceof z.ZodError) {
      // Return specific validation errors (e.g. "Password too short")
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    
    console.error("Registration Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}