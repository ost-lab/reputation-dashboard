import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/connect/google/callback`;
  
  // We pack the Current User ID into the 'state' param
  // This tells the callback: "Whatever happens, link this to THIS user."
  const state = session.user.id;

  const scope = [
    "https://www.googleapis.com/auth/business.manage",
    "email",
    "profile"
  ].join(" ");

  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent select_account&state=${state}`;

  return NextResponse.redirect(url);
}