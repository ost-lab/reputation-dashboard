import { NextResponse, NextRequest } from "next/server"; // Import NextRequest to fix the type error
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from "@/lib/db";

// Force dynamic so it doesn't cache old reviews
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // 1. Check if user is logged in
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await pool.connect();

    try {
      // 2. Get the Hotel ID from your database
      // Make sure your database has a 'booking_hotel_id' column in the users table!
      const userResult = await client.query(
        `SELECT booking_hotel_id FROM users WHERE email = $1`, 
        [session.user.email]
      );

      const hotelId = userResult.rows[0]?.booking_hotel_id;

      if (!hotelId) {
        return NextResponse.json({ error: "No Booking.com Hotel ID linked to this account." }, { status: 400 });
      }

      // 3. Call Booking.com API
      const rapidApiKey = process.env.RAPIDAPI_KEY;
      const rapidApiHost = 'booking-com.p.rapidapi.com';
      
      if (!rapidApiKey) {
         return NextResponse.json({ error: "API Key missing" }, { status: 500 });
      }

      // Using the endpoint from your docs: @Reviews of the hotel
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
      
      // 4. Send the reviews list to your frontend
      return NextResponse.json({ 
        reviews: apiData.result || [] 
      });

    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Reviews API Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}