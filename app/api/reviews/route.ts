import { NextResponse, NextRequest } from "next/server"; // 1. Import NextRequest
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from "@/lib/db";

export const dynamic = 'force-dynamic';

// 2. Add the type ': NextRequest' to the parameter
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) { // Changed .id to .email just in case, or keep .id if your session has it
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await pool.connect();

    try {
      // Get the Hotel ID from your DB
      // Note: Ensure your 'users' table actually has 'booking_hotel_id'
      // If session.user.id is missing, check your NextAuth configuration
      const userResult = await client.query(
        `SELECT booking_hotel_id FROM users WHERE email = $1`, 
        [session.user.email]
      );

      const hotelId = userResult.rows[0]?.booking_hotel_id;

      if (!hotelId) {
        return NextResponse.json({ error: "No Booking.com Hotel ID linked to this account." }, { status: 400 });
      }

      // Fetch from RapidAPI
      const rapidApiKey = process.env.RAPIDAPI_KEY;
      const rapidApiHost = 'booking-com.p.rapidapi.com';
      
      if (!rapidApiKey) {
          throw new Error("RAPIDAPI_KEY is missing from environment variables");
      }

      const url = `https://${rapidApiHost}/v1/hotels/reviews?hotel_id=${hotelId}&locale=en-gb&sort_type=SORT_MOST_RELEVANT&customer_type=total&language_filter=en-gb,en-us`;

      const apiResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': rapidApiKey,
          'x-rapidapi-host': rapidApiHost
        }
      });

      if (!apiResponse.ok) {
        throw new Error(`Booking API Error: ${apiResponse.status}`);
      }

      const apiData = await apiResponse.json();
      
      return NextResponse.json({ 
        source: 'booking.com',
        reviews: apiData.result || [] 
      });

    } finally {
      client.release();
    }
  } catch (error: any) { // Type 'error' as 'any' to avoid "Object is of type 'unknown'"
    console.error("Reviews API Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}