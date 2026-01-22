import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route"; // Now this import will work
import pool from "@/lib/db"; 

export async function POST() {
  try {
    // 1. Verify User is Logged In
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Perform the Sync (Simulated for now, or connect to real Google API)
    // In a real app, you would use the Google Access Token here to fetch reviews
    console.log(`Syncing reviews for user: ${session.user.email}`);

    // Example: Insert a "system" notification or mock review to show it worked
    await pool.query(
        "INSERT INTO reviews (user_name, rating, text, source) VALUES ($1, $2, $3, $4)",
        ['Google User', 5, 'Reviews synced successfully from Google!', 'google']
    );

    return NextResponse.json({ message: "Google reviews synced successfully!" });

  } catch (error) {
    console.error("Sync Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}