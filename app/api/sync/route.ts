import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from "@/lib/db";

// 🏗️ TIER 1 ARCHITECTURE: UNIVERSAL INGESTION ENGINE
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { platform, url, useToken } = body; 

    console.log(`🚀 SYNC STARTED: ${platform}`);

    let reviewsData: any[] = [];
    let connectedLabel = ""; // Stores "pizza@gmail.com" OR "Toronto Condo Kings"

    const client = await pool.connect();

    try {
      // --- 1. GOOGLE REAL-TIME SYNC (OFFICIAL API) ---
      if (useToken && platform === 'google') {
          console.log("🔍 Fetching Real Google Reviews via API...");
          
          // A. Get the Access Token & Email from DB
          const tokenRes = await client.query(
            "SELECT access_token, connected_email FROM connected_accounts WHERE user_id = $1 AND platform = 'google'", 
            [session.user.id]
          );
          
          const accountData = tokenRes.rows[0];

          if (!accountData || !accountData.access_token) {
            throw new Error("No Google Access Token found. Please reconnect account.");
          }

          // B. Set the Label (The Email)
          connectedLabel = accountData.connected_email || "Google Business Profile";

          // C. Fetch Real Data
          reviewsData = await fetchRealGoogleReviews(accountData.access_token);
          console.log(`✅ Fetched ${reviewsData.length} Real Google Reviews`);
      } 
      
      // --- 2. OTHER PLATFORMS (URL / SCRAPER SIMULATION) ---
      else if (url) {
           console.log(`🔍 Processing URL for ${platform}...`);
           
           // A. Extract Identity (The "Name") from the URL
           connectedLabel = extractIdentityFromUrl(url);
           console.log(`Identified '${connectedLabel}' from URL`);

           // B. Generate Specific Data (Simulating a Scraper)
           // When you get a real Scraper API key, you will replace these calls with fetch()
           
           if (['zillow', 'realtor', 'trulia', 'apartments', 'redfin'].includes(platform)) {
                reviewsData = generateRealEstateReviews(platform, connectedLabel);
           }
           else if (['booking', 'tripadvisor', 'expedia', 'hotels', 'airbnb'].includes(platform)) {
                reviewsData = generateTravelReviews(platform, connectedLabel);
           }
           else if (['healthgrades', 'vitals', 'zocdoc', 'ratemds'].includes(platform)) {
                reviewsData = generateMedicalReviews(platform, connectedLabel);
           }
           else if (['carsdotcom', 'dealerrater', 'edmunds'].includes(platform)) {
                reviewsData = generateAutoReviews(platform, connectedLabel);
           }
           else if (['g2', 'capterra', 'clutch'].includes(platform)) {
                reviewsData = generateSoftwareReviews(platform, connectedLabel);
           }
           else {
                // General Fallback
                reviewsData = generateGeneralReviews(platform, connectedLabel);
           }
      }
      else {
          return NextResponse.json({ error: "Missing URL or Token" }, { status: 400 });
      }

      // --- 3. SAVE TO DATABASE ---
      if (reviewsData.length > 0 || connectedLabel) {
          await client.query('BEGIN');

          // A. Ensure User Exists
          await client.query(`
            INSERT INTO users (id, name, email, created_at) VALUES ($1, $2, $3, NOW())
            ON CONFLICT (id) DO NOTHING
          `, [session.user.id, session.user.name || 'User', session.user.email]);
          
          // B. Save Connection with LABEL (The Critical Fix)
          // We save 'connectedLabel' so the UI shows the specific account name
          await client.query(`
            INSERT INTO connected_accounts 
            (user_id, platform, provider_account_id, connected_label, updated_at)
            VALUES ($1, $2, $3, $4, NOW())
            ON CONFLICT (user_id, platform) 
            DO UPDATE SET 
                provider_account_id = $3,
                connected_label = $4,
                updated_at = NOW()
          `, [
              session.user.id, 
              platform, 
              url || 'oauth_linked', 
              connectedLabel 
          ]);

          // C. Save Reviews (Upsert to avoid duplicates)
          for (const review of reviewsData) {
            await client.query(`
              INSERT INTO reviews (
                user_id, platform, rating, content, author_name, sentiment, created_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7)
              ON CONFLICT DO NOTHING 
            `, [
              session.user.id,
              platform, 
              review.rating,
              review.content,
              review.author,
              review.sentiment,
              review.created_at
            ]);
          }
          await client.query('COMMIT');
      }

    } catch (e) {
      await client.query('ROLLBACK');
      console.error("Sync Error:", e);
      return NextResponse.json({ error: "Sync Failed: " + (e as Error).message }, { status: 500 });
    } finally {
      client.release();
    }

    return NextResponse.json({ 
        message: "Sync successful", 
        count: reviewsData.length,
        connectedPlatforms: [platform]
    });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// ==========================================
// 🧩 HELPER FUNCTIONS & GENERATORS
// ==========================================

// --- 1. GOOGLE REAL-TIME API ---
async function fetchRealGoogleReviews(accessToken: string) {
    try {
        // A. Get Account ID
        const accountsRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const accountsData = await accountsRes.json();
        
        if (!accountsData.accounts || accountsData.accounts.length === 0) {
            throw new Error("No Google Business Profile found.");
        }
        const accountName = accountsData.accounts[0].name; 

        // B. Get Location ID
        const locationsRes = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const locationsData = await locationsRes.json();
        
        if (!locationsData.locations || locationsData.locations.length === 0) {
            throw new Error("No Locations found.");
        }
        const locationName = locationsData.locations[0].name;

        // C. Get Reviews
        const reviewsRes = await fetch(`https://mybusiness.googleapis.com/v4/${accountName}/${locationName}/reviews`, {
             headers: { Authorization: `Bearer ${accessToken}` }
        });
        const reviewsJson = await reviewsRes.json();

        // D. Transform
        return (reviewsJson.reviews || []).map((r: any) => ({
            rating: mapGoogleStarRating(r.starRating),
            content: r.comment || "(No text provided)",
            author: r.reviewer?.displayName || "Anonymous Google User",
            sentiment: mapGoogleStarRating(r.starRating) >= 4 ? 'positive' : (mapGoogleStarRating(r.starRating) <= 2 ? 'negative' : 'neutral'),
            created_at: r.createTime ? new Date(r.createTime) : new Date()
        }));

    } catch (error) {
        console.error("Google API Error:", error);
        throw error;
    }
}

function mapGoogleStarRating(ratingString: string): number {
    switch (ratingString) {
        case 'FIVE': return 5;
        case 'FOUR': return 4;
        case 'THREE': return 3;
        case 'TWO': return 2;
        case 'ONE': return 1;
        default: return 5;
    }
}

// --- 2. URL EXTRACTOR ---
function extractIdentityFromUrl(url: string): string {
    try {
        const cleanUrl = url.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '');
        const parts = cleanUrl.split('/');
        if (parts.length > 1) {
            let id = parts[parts.length - 1]
                .replace(/-/g, ' ') 
                .replace(/_/g, ' '); 
            return id.replace(/\b\w/g, l => l.toUpperCase()); // Capitalize
        }
        return "Connected Profile";
    } catch (e) {
        return "Connected Profile";
    }
}

// --- 3. MOCK DATA GENERATORS (For non-Google platforms) ---

function generateGeneralReviews(platform: string, businessName: string) {
    return [
      { author: "Sarah Jenkins", rating: 5, content: `I had a great experience with ${businessName}! Highly recommended.`, sentiment: "positive", created_at: getDateDaysAgo(1) },
      { author: "Mike Ross", rating: 4, content: `${businessName} provides good service, but wait times were long.`, sentiment: "neutral", created_at: getDateDaysAgo(3) },
      { author: "David Wright", rating: 1, content: "Terrible customer support.", sentiment: "negative", created_at: getDateDaysAgo(12) }
    ];
}

function generateRealEstateReviews(platform: string, businessName: string) {
    return [
      { author: "Home Buyer", rating: 5, content: `${businessName} helped us find our dream home in record time!`, sentiment: "positive", created_at: getDateDaysAgo(5) },
      { author: "Property Investor", rating: 4, content: "Very knowledgeable about the market.", sentiment: "positive", created_at: getDateDaysAgo(8) },
      { author: "Renter", rating: 2, content: `I tried contacting ${businessName} but they never replied.`, sentiment: "negative", created_at: getDateDaysAgo(20) }
    ];
}

function generateTravelReviews(platform: string, businessName: string) {
    return [
      { author: "Traveler UK", rating: 5, content: "The room was spotless and the view was amazing.", sentiment: "positive", created_at: getDateDaysAgo(2) },
      { author: "Family Vacation", rating: 4, content: "Breakfast was delicious but the pool was crowded.", sentiment: "neutral", created_at: getDateDaysAgo(4) },
      { author: "Business Trip", rating: 2, content: "WiFi was too slow for work calls.", sentiment: "negative", created_at: getDateDaysAgo(10) }
    ];
}

function generateMedicalReviews(platform: string, businessName: string) {
    return [
      { author: "Anonymous Patient", rating: 5, content: `Dr. at ${businessName} was very attentive and kind.`, sentiment: "positive", created_at: getDateDaysAgo(1) },
      { author: "Local Resident", rating: 5, content: "Best clinic in town. Very professional staff.", sentiment: "positive", created_at: getDateDaysAgo(6) },
      { author: "New Patient", rating: 3, content: "Good doctor but the receptionist was rude.", sentiment: "negative", created_at: getDateDaysAgo(14) }
    ];
}

function generateAutoReviews(platform: string, businessName: string) {
    return [
      { author: "Car Enthusiast", rating: 5, content: "Fair price and no hidden fees. Great dealership.", sentiment: "positive", created_at: getDateDaysAgo(2) },
      { author: "First Time Buyer", rating: 4, content: "Process was easy but took longer than expected.", sentiment: "neutral", created_at: getDateDaysAgo(4) },
      { author: "Service Customer", rating: 1, content: "They charged me for repairs I didn't need.", sentiment: "negative", created_at: getDateDaysAgo(15) }
    ];
}

function generateSoftwareReviews(platform: string, businessName: string) {
    return [
      { author: "CTO @ TechCorp", rating: 5, content: "This software changed our workflow completely. 10/10.", sentiment: "positive", created_at: getDateDaysAgo(3) },
      { author: "Marketing Manager", rating: 5, content: "Incredible ROI and easy to use.", sentiment: "positive", created_at: getDateDaysAgo(7) },
      { author: "Developer", rating: 3, content: "Good features but the API documentation is lacking.", sentiment: "neutral", created_at: getDateDaysAgo(12) }
    ];
}

function getDateDaysAgo(days: number) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
}