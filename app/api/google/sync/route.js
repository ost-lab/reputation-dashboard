import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";// Import auth handler
import pool from "../../../../lib/db"; // Database connection

export async function POST() {
  // 1. Get the current user's session (contains the Google Access Token)
  const session = await getServerSession(authOptions);
  
  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const accessToken = session.accessToken;

  try {
    // ---------------------------------------------------------
    // STEP A: Get the Account ID
    // ---------------------------------------------------------
    const accountsRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const accountsData = await accountsRes.json();
    
    if (!accountsData.accounts || accountsData.accounts.length === 0) {
      return NextResponse.json({ error: "No Google Business Profile found for this email." }, { status: 404 });
    }

    // We take the first account found (usually the personal account)
    const accountName = accountsData.accounts[0].name; // Format: "accounts/123456789"

    // ---------------------------------------------------------
    // STEP B: Get the Location ID (Your Business)
    // ---------------------------------------------------------
    const locationsRes = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const locationsData = await locationsRes.json();

    if (!locationsData.locations || locationsData.locations.length === 0) {
      return NextResponse.json({ error: "No Business Locations found." }, { status: 404 });
    }

    // We take the first location found
    const locationName = locationsData.locations[0].name; // Format: "locations/987654321"
    const locationTitle = locationsData.locations[0].title;

    // ---------------------------------------------------------
    // STEP C: Get the Reviews
    // ---------------------------------------------------------
    const reviewsRes = await fetch(`https://mybusiness.googleapis.com/v4/${accountName}/${locationName}/reviews`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const reviewsData = await reviewsRes.json();
    
    const reviews = reviewsData.reviews || [];

    // ---------------------------------------------------------
    // STEP D: Save to Database (Postgres)
    // ---------------------------------------------------------
    let savedCount = 0;

    for (const review of reviews) {
      // Map Google's rating (e.g., "FIVE") to a number (5)
      const starRating = review.starRating === 'FIVE' ? 5 : 
                         review.starRating === 'FOUR' ? 4 : 
                         review.starRating === 'THREE' ? 3 : 
                         review.starRating === 'TWO' ? 2 : 1;

      // Determine sentiment based on stars (Simple logic for now)
      const sentiment = starRating >= 4 ? 'positive' : starRating <= 2 ? 'negative' : 'neutral';

      // Insert into DB (ON CONFLICT DO NOTHING prevents duplicates)
      // Note: We need a unique constraint on 'source' + 'text' or similar to truly prevent dupes, 
      // but for now we just insert. A production app would use the Google Review ID.
      
      const query = `
        INSERT INTO reviews (user_name, source, text, sentiment, rating, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `;
      
      const reviewerName = review.reviewer.displayName || "Anonymous";
      const comment = review.comment || "(No text)";

      await pool.query(query, [reviewerName, `Google - ${locationTitle}`, comment, sentiment, starRating]);
      savedCount++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully synced ${savedCount} reviews from ${locationTitle}`,
      location: locationTitle
    });

  } catch (error) {
    console.error("Google Sync Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}