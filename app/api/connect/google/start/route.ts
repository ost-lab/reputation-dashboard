import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ Get the 'login_hint' from the URL
  const { searchParams } = new URL(req.url);
  const loginHint = searchParams.get("login_hint") || "";

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/connect/google/callback`;
  const state = session.user.id;

  const scope = [
    "https://www.googleapis.com/auth/business.manage",
    "email",
    "profile"
  ].join(" ");

  // ✅ Pass login_hint to Google
  let url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;
  
  if (loginHint) {
      url += `&login_hint=${encodeURIComponent(loginHint)}`;
  }

  return NextResponse.redirect(url);
}