import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    console.log("🔍 [API] Starting Review Fetch...");

    // 1. Auth Check
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      console.log("❌ [API] No session found.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await pool.connect();

    try {
      // 2. Get Hotel ID
      const userResult = await client.query(
        `SELECT booking_hotel_id FROM users WHERE email = $1`, 
        [session.user.email]
      );
      
      const hotelId = userResult.rows[0]?.booking_hotel_id;
      console.log("🏨 [API] Found Hotel ID:", hotelId);

      if (!hotelId) {
        console.log("⚠️ [API] No Hotel ID linked to user.");
        return NextResponse.json({ reviews: [] }); // Return empty array, not error
      }

      // 3. Call RapidAPI
      const rapidApiKey = process.env.RAPIDAPI_KEY;
      if (!rapidApiKey) console.error("❌ [API] RAPIDAPI_KEY is missing!");

      const url = `https://booking-com.p.rapidapi.com/v1/hotels/reviews?hotel_id=${hotelId}&locale=en-gb&sort_type=SORT_MOST_RELEVANT&customer_type=total&language_filter=en-gb,en-us`;
      
      console.log("🚀 [API] Calling Booking.com...", url);

      const apiResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': rapidApiKey as string,
          'x-rapidapi-host': 'booking-com.p.rapidapi.com'
        }
      });

      if (!apiResponse.ok) {
        console.error(`❌ [API] RapidAPI Error: ${apiResponse.status}`);
        return NextResponse.json({ error: "External API Error" }, { status: 500 });
      }

      const apiData = await apiResponse.json();
      console.log(`✅ [API] Received ${apiData.result?.length || 0} reviews from Booking.com`);

      // 4. Transform Data for Frontend
      const formattedReviews = (apiData.result || []).map((r: any, index: number) => ({
        id: r.review_id || index,
        author_name: r.author.name || "Guest",
        rating: Number(r.average_score),
        content: r.pros || r.cons || r.title || "No comment",
        platform: "booking",
        created_at: r.date // Keep as string or convert: new Date(r.date)
      }));

      return NextResponse.json({ reviews: formattedReviews });

    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("🔥 [API] Critical Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}