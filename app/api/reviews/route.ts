import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    // 1. Authentication Check
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await pool.connect();

    try {
      // 2. GET THE HOTEL ID FROM YOUR DB (New Step)
      // We need to know which Booking.com hotel belongs to this user.
      // Assuming you have a column 'booking_hotel_id' in your users table.
      const userResult = await client.query(
        `SELECT booking_hotel_id FROM users WHERE id = $1`, 
        [session.user.id]
      );

      const hotelId = userResult.rows[0]?.booking_hotel_id;

      // If the user hasn't linked a hotel yet, return an error or empty list
      if (!hotelId) {
        return NextResponse.json({ error: "No Booking.com Hotel ID linked to this account." }, { status: 400 });
      }

      // 3. CALL RAPIDAPI (New Step)
      const rapidApiKey = process.env.RAPIDAPI_KEY; // Ensure this is in your .env file
      const rapidApiHost = 'booking-com.p.rapidapi.com';
      
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
      
      // 4. Return the data (The reviews are usually in apiData.result)
      return NextResponse.json({ 
        source: 'booking.com',
        reviews: apiData.result || [] 
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Reviews API Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}