import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Force this route to be dynamic so it runs on every request
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // 1. Check Authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get hotel_id from the URL query params
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get('hotel_id');

    if (!hotelId) {
      return NextResponse.json({ error: "Missing hotel_id parameter" }, { status: 400 });
    }

    // 3. Prepare the RapidAPI Request
    const apiKey = process.env.RAPIDAPI_KEY; // Your key from .env
    const apiHost = 'booking-com.p.rapidapi.com';
    const url = `https://${apiHost}/v1/hotels/reviews-filter-metadata?hotel_id=${hotelId}&locale=en-gb`;

    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey as string,
        'x-rapidapi-host': apiHost
      }
    };

    // 4. Fetch the Data
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`RapidAPI Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // 5. Return the result
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Metadata API Error:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}