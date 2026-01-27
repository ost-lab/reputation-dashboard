import { NextResponse } from "next/server";

export async function GET() {
  const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
  
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/integrations/google/callback`,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/business.manage", // Critical Scope
    access_type: "offline", // Critical: Asks for Refresh Token
    prompt: "consent" // Forces refresh token generation
  });

  return NextResponse.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
}