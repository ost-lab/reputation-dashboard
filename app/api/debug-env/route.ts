import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  console.log("--- DEBUGGING ENV VARS ---");
  
  // Check Client ID
  if (!clientId) {
    console.log("❌ GOOGLE_CLIENT_ID is UNDEFINED");
  } else {
    console.log(`✅ GOOGLE_CLIENT_ID Loaded: Starts with '${clientId.substring(0, 5)}...', Length: ${clientId.length}`);
  }

  // Check Client Secret
  if (!clientSecret) {
    console.log("❌ GOOGLE_CLIENT_SECRET is UNDEFINED");
  } else {
    console.log(`✅ GOOGLE_CLIENT_SECRET Loaded: Starts with '${clientSecret.substring(0, 3)}...', Length: ${clientSecret.length}`);
  }

  console.log("--------------------------");

  return NextResponse.json({ 
    status: "Check your Vercel Logs now",
    id_status: clientId ? "Loaded" : "Missing",
    secret_status: clientSecret ? "Loaded" : "Missing"
  });
}