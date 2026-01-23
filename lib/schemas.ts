import { z } from "zod";

// Password Regex: At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
const passwordRules = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character (@$!%*?&)");

// Schema for Registration
export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: passwordRules,
  accountType: z.enum(["personal", "business"]).optional(),
  // Business fields are optional unless specific logic applies, but we validate type
  businessType: z.string().optional(), 
  platforms: z.array(z.string()).optional(),
});

// Schema for Login
export const LoginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1, "Password is required"), // We don't enforce complexity on login, just existence
});