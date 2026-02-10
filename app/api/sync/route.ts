import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from "@/lib/db";

// Force dynamic to prevent caching issues
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // 1. Security Check
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { platform, url, useToken } = body; 

    console.log(`🚀 SYNC STARTED: ${platform} for User ${session.user.id}`);

    const client = await pool.connect();
    let reviewsData: any[] = [];
    let connectedLabel = ""; 

    try {
      // ==================================================
      // 🔵 GOOGLE SYNC (Official API with Auto-Refresh)
      // ==================================================
      if (useToken && platform === 'google') {
          
          // A. Fetch Credentials from DB
          const tokenRes = await client.query(
            "SELECT access_token, refresh_token, expires_at, connected_email FROM connected_accounts WHERE user_id = $1 AND platform = 'google'", 
            [session.user.id]
          );
          
          if (tokenRes.rows.length === 0) {
              throw new Error("Google account not connected");
          }

          let { access_token, refresh_token, expires_at, connected_email } = tokenRes.rows[0];
          connectedLabel = connected_email || "Google Business Profile";

          // B. CHECK EXPIRY & REFRESH IF NEEDED
          const now = Date.now();
          // If token expires in less than 5 mins (or is null), refresh it
          if (!access_token || (expires_at && now >= parseInt(expires_at) - 300000)) {
              console.log("🔄 Token expired. Refreshing...");
              try {
                  const newTokens = await refreshGoogleToken(refresh_token);
                  
                  if (newTokens.access_token) {
                      access_token = newTokens.access_token;
                      // Update DB with new token
                      await client.query(
                          "UPDATE connected_accounts SET access_token = $1, expires_at = $2, updated_at = NOW() WHERE user_id = $3 AND platform = 'google'",
                          [access_token, Date.now() + (newTokens.expires_in * 1000), session.user.id]
                      );
                      console.log("✅ Token Refreshed & Saved.");
                  }
              } catch (refreshError) {
                  console.error("❌ Token Refresh Failed:", refreshError);
                  throw new Error("Session expired. Please reconnect Google Account.");
              }
          }

          // C. Fetch Reviews using the valid Access Token
          reviewsData = await fetchRealGoogleReviews(access_token);
          console.log(`✅ Fetched ${reviewsData.length} Real Google Reviews`);
      } 

      // ==================================================
      // 🟠 OTHER PLATFORMS (URL / SCRAPER SIMULATION)
      // ==================================================
      else if (url) {
           console.log(`🔍 Processing URL for ${platform}...`);
           connectedLabel = extractIdentityFromUrl(url);

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
                reviewsData = generateGeneralReviews(platform, connectedLabel);
           }
      }
      else {
          return NextResponse.json({ error: "Missing URL or Token" }, { status: 400 });
      }

      // ==================================================
      // 💾 SAVE TO DATABASE
      // ==================================================
      if (reviewsData.length > 0 || connectedLabel) {
          await client.query('BEGIN');

          // Ensure User
          await client.query(`
            INSERT INTO users (id, name, email, created_at) VALUES ($1, $2, $3, NOW())
            ON CONFLICT (id) DO NOTHING
          `, [session.user.id, session.user.name || 'User', session.user.email]);
          
          // Save Connection
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

          // Save Reviews
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

    } catch (e: any) {
      await client.query('ROLLBACK');
      console.error("❌ SYNC ERROR:", e.message);
      return NextResponse.json({ error: e.message }, { status: 500 });
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
// 🛠️ HELPER FUNCTIONS
// ==========================================

// 1. Refresh Google Token
async function refreshGoogleToken(refreshToken: string) {
    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
    });

    const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error_description || "Failed to refresh token");
    return data;
}

// 2. Fetch Google Reviews (Robust Error Handling)
async function fetchRealGoogleReviews(accessToken: string) {
    try {
        console.log("🔍 1. Fetching Accounts...");
        const accountsRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const accountsData = await accountsRes.json();
        
        if (accountsData.error) {
            console.error("❌ Account API Error:", accountsData.error);
            throw new Error(`Google API Error: ${accountsData.error.message} (Enable 'My Business Account Management API')`);
        }

        if (!accountsData.accounts || accountsData.accounts.length === 0) {
             throw new Error("No Google Business Profile found. Ensure this email is an Owner/Manager at business.google.com");
        }
        const accountName = accountsData.accounts[0].name; 

        console.log("🔍 2. Fetching Locations...");
        const locationsRes = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const locationsData = await locationsRes.json();
        
        if (locationsData.error) {
             console.error("❌ Location API Error:", locationsData.error);
             throw new Error(`Google API Error: ${locationsData.error.message} (Enable 'My Business Information API')`);
        }
        
        if (!locationsData.locations || locationsData.locations.length === 0) {
            throw new Error("No Locations found inside this Business Account.");
        }
        const locationName = locationsData.locations[0].name;

        console.log("🔍 3. Fetching Reviews...");
        const reviewsRes = await fetch(`https://mybusiness.googleapis.com/v4/${accountName}/${locationName}/reviews`, {
             headers: { Authorization: `Bearer ${accessToken}` }
        });
        const reviewsJson = await reviewsRes.json();

        if (reviewsJson.error) {
             console.error("❌ Reviews API Error:", reviewsJson.error);
             throw new Error(`Google API Error: ${reviewsJson.error.message} (Enable 'Google My Business API')`);
        }

        return (reviewsJson.reviews || []).map((r: any) => ({
            rating: mapGoogleStarRating(r.starRating),
            content: r.comment || "(No text provided)",
            author: r.reviewer?.displayName || "Anonymous",
            sentiment: mapGoogleStarRating(r.starRating) >= 4 ? 'positive' : (mapGoogleStarRating(r.starRating) <= 2 ? 'negative' : 'neutral'),
            created_at: r.createTime ? new Date(r.createTime) : new Date()
        }));

    } catch (error: any) {
        console.error("Google API Fetch Error:", error.message);
        throw new Error(error.message); 
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

// --- 3. URL EXTRACTOR ---
function extractIdentityFromUrl(url: string): string {
    try {
        const cleanUrl = url.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '');
        const parts = cleanUrl.split('/');
        if (parts.length > 1) {
            let id = parts[parts.length - 1]
                .replace(/-/g, ' ') 
                .replace(/_/g, ' '); 
            return id.replace(/\b\w/g, l => l.toUpperCase()); 
        }
        return "Connected Profile";
    } catch (e) {
        return "Connected Profile";
    }
}

// --- 4. MOCK DATA GENERATORS ---

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