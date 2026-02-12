import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from "@/lib/db";
import { ApifyClient } from "apify-client";

// Initialize Apify (Safe initialization even if key is missing)
const apifyClient = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

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
      // 🔵 STRATEGY A: GOOGLE OFFICIAL API (Primary)
      // ==================================================
      if (useToken && platform === 'google') {
          try {
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

             // B. Auto-Refresh Token Logic
             const now = Date.now();
             if (!access_token || (expires_at && now >= parseInt(expires_at) - 300000)) {
                  console.log("🔄 Token expired. Refreshing...");
                  try {
                      const newTokens = await refreshGoogleToken(refresh_token);
                      if (newTokens.access_token) {
                          access_token = newTokens.access_token;
                          await client.query(
                              "UPDATE connected_accounts SET access_token = $1, expires_at = $2, updated_at = NOW() WHERE user_id = $3 AND platform = 'google'",
                              [access_token, Date.now() + (newTokens.expires_in * 1000), session.user.id]
                          );
                          console.log("✅ Token Refreshed & Saved.");
                      }
                  } catch (refreshError) {
                      console.error("❌ Token Refresh Failed. Will try scraper fallback.");
                  }
             }

             // C. Try Official API
             reviewsData = await fetchRealGoogleReviews(access_token);
             console.log(`✅ Google Official API Success: ${reviewsData.length} reviews`);

          } catch (googleError: any) {
             console.warn(`⚠️ Google Official API Failed (${googleError.message}). Switching to Fallback Strategy...`);
          }
      } 

      // ==================================================
      // 🟢 STRATEGY C: RAPIDAPI (The Free Option for Booking)
      // ==================================================

      if ((platform === 'booking' || platform === 'booking.com') && process.env.RAPIDAPI_KEY && reviewsData.length === 0) {
          console.log("⚡ Trying RapidAPI (Free Tier)...");
          try {
              let hotelId = "";

              // 1. CHECK INPUT TYPE
              // If the user pasted a pure number (e.g., "5936336"), use it directly.
              if (/^\d+$/.test(url.trim())) {
                  hotelId = url.trim();
                  console.log(`✅ User provided Direct Hotel ID: ${hotelId}`);
              } 
              // Otherwise, assume it's a URL and try to find the ID
              else {
                  const nameMatch = url.match(/hotel\/[a-z]+\/([^.]+)/);
                  const hotelName = nameMatch ? nameMatch[1].replace(/-/g, ' ') : "Hotel";
                  
                  console.log(`🔎 Searching RapidAPI for name: ${hotelName}`);

                  const searchRes = await fetch(`https://${process.env.RAPIDAPI_HOST}/v1/hotels/locations?name=${hotelName}&locale=en-gb`, {
                      headers: {
                          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
                          'X-RapidAPI-Host': process.env.RAPIDAPI_HOST!
                      }
                  });
                  const searchData = await searchRes.json();
                  hotelId = searchData.find((d: any) => d.dest_type === 'hotel')?.dest_id;
              }

              // 2. FETCH REVIEWS (If we have an ID)
              if (hotelId) {
                  console.log(`✅ Fetching reviews for Hotel ID: ${hotelId}...`);
                  
                  const reviewRes = await fetch(`https://${process.env.RAPIDAPI_HOST}/v1/hotels/reviews?hotel_id=${hotelId}&locale=en-gb&sort_type=SORT_MOST_RECENT_FIRST`, {
                      headers: {
                          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
                          'X-RapidAPI-Host': process.env.RAPIDAPI_HOST!
                      }
                  });
                  const reviewData = await reviewRes.json();
                  
                  if (reviewData.result) {
                      reviewsData = reviewData.result.map((item: any) => ({
                          rating: item.average_score ? (item.average_score / 2) : 0, 
                          content: item.pros ? `✅ ${item.pros}\n❌ ${item.cons}` : (item.title || "No text"),
                          author: item.author?.name || "Booking Guest",
                          sentiment: item.average_score >= 8 ? 'positive' : 'neutral',
                          created_at: item.date ? new Date(item.date) : new Date()
                      }));
                      console.log(`✅ RapidAPI Success: ${reviewsData.length} reviews`);
                  }
              } else {
                  console.warn("❌ RapidAPI could not find a hotel ID for this input.");
              }

          } catch (rapidError) {
              console.error("❌ RapidAPI Failed:", rapidError);
          }
      }
      // ==================================================
      // 🕷️ STRATEGY B: APIFY SCRAPER (Fallback & Other Platforms)
      // ==================================================
      
      if (reviewsData.length === 0 && (url || (platform === 'google' && reviewsData.length === 0) || ['booking', 'booking.com'].includes(platform))) {
           
           const targetUrl = url || connectedLabel || "business review";
           console.log(`🕷️ Starting Apify Scraper for ${platform}...`);
           
           try {
               let actorId = "";
               let input = {};

               // --- CONFIG: CHOOSE THE RIGHT SCRAPER ROBOT ---
               if (platform === 'google') {
                   actorId = "compass/google-maps-reviews-scraper"; 
                   input = { searchStrings: [targetUrl], maxReviews: 20, language: "en" };
               }
               else if (platform === 'yelp') {
                   actorId = "bam5/yelp-scraper";
                   input = { startUrls: [{ url: targetUrl }], maxItems: 20 };
               }
               else if (platform === 'tripadvisor') {
                   actorId = "maxcopell/tripadvisor-reviews"; 
                   input = { startUrls: [{ url: targetUrl }], maxItems: 20 };
               }
               else if (platform === 'facebook') {
                   actorId = "apify/facebook-reviews-scraper";
                   input = { startUrls: [{ url: targetUrl }], maxReviews: 20 };
               }
               else if (['zillow', 'realtor'].includes(platform)) {
                    actorId = "apify/zillow-scraper";
                    input = { search: targetUrl, maxItems: 20 };
               }
               // 🏨 BOOKING.COM SUPPORT
               else if (platform === 'booking' || platform === 'booking.com') {
                   actorId = "voyager/booking-reviews-scraper";
                   input = { 
                       startUrls: [{ url: targetUrl }], 
                       maxReviews: 50
                   };
               }

               // --- EXECUTE SCRAPER ---
               if (actorId && process.env.APIFY_API_TOKEN) {
                   const run = await apifyClient.actor(actorId).call(input);
                   
                   // ✅ Use .listItems() (Correct method for new Apify SDK)
                   const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

                   if (items && items.length > 0) {
                        reviewsData = items.map((item: any) => {
                            // 1. FIX RATING: Convert 10-point scale to 5-point
                            let finalRating = item.rating || item.stars || 0;
                            if (typeof finalRating === 'string') finalRating = parseFloat(finalRating);
                            
                            // If it's Booking.com and rating is > 5 (e.g., 8.5/10), convert to 5-star scale
                            if ((platform === 'booking' || platform === 'booking.com') && finalRating > 5) {
                                finalRating = finalRating / 2;
                            }

                            // 2. FIX CONTENT: Stitch together split text fields
                            let contentParts = [];
                            if (item.reviewTitle) contentParts.push(`"${item.reviewTitle}"`);
                            if (item.reviewTextParts?.Liked) contentParts.push(`✅ ${item.reviewTextParts.Liked}`);
                            if (item.reviewTextParts?.Disliked) contentParts.push(`❌ ${item.reviewTextParts.Disliked}`);
                            
                            // Fallback for other scrapers that use simple 'text'
                            const finalContent = contentParts.length > 0 
                                ? contentParts.join("\n") 
                                : (item.text || item.description || item.reviewText || "(No text provided)");

                            // 3. FIX AUTHOR: Check 'userName' specifically for Booking
                            const finalAuthor = item.userName || item.reviewerName || item.user?.name || item.name || "Anonymous Guest";

                            // 4. FIX DATE: Check multiple possible date fields
                            // Booking scraper sometimes uses 'submissionTime' or 'date' or 'reviewDate'
                            let rawDate = item.submissionTime || item.date || item.reviewDate || item.postedAt;
                            let finalDate = new Date(); // Default to now
                            if (rawDate) {
                                const parsed = new Date(rawDate);
                                if (!isNaN(parsed.getTime())) finalDate = parsed;
                            }

                            return {
                                rating: finalRating,
                                content: finalContent,
                                author: finalAuthor,
                                sentiment: finalRating >= 4 ? 'positive' : (finalRating <= 2 ? 'negative' : 'neutral'),
                                created_at: finalDate
                            };
                        });
                        console.log(`✅ Scraped ${reviewsData.length} reviews via Apify`);
                   }
               } 

               if (reviewsData.length === 0) {
                   console.log("⚠️ Scraper returned empty or no token. Using Simulation.");
                   reviewsData = generateFallbackReviews(platform, connectedLabel);
               }

           } catch (scraperError) {
               console.error("❌ Scraper Failed:", scraperError);
               reviewsData = generateFallbackReviews(platform, connectedLabel);
           }
      }
      
      // If we still have no data, generate mock
      if (reviewsData.length === 0 && !['google'].includes(platform)) {
          reviewsData = generateFallbackReviews(platform, connectedLabel);
      }

      // ==================================================
      // 💾 SAVE TO DATABASE
      // ==================================================
      if (reviewsData.length > 0 || connectedLabel) {
          await client.query('BEGIN');
          
          await client.query(`
            INSERT INTO users (id, name, email, created_at) VALUES ($1, $2, $3, NOW())
            ON CONFLICT (id) DO NOTHING
          `, [session.user.id, session.user.name || 'User', session.user.email]);
          
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
          
          for (const review of reviewsData) {
            await client.query(`
              INSERT INTO reviews (
                user_id, platform, rating, content, author_name, sentiment, created_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7)
              ON CONFLICT (user_id, platform, author_name, content) 
              DO NOTHING 
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

    return NextResponse.json({ success: true, count: reviewsData.length });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// ==========================================
// 🛠️ HELPER FUNCTIONS
// ==========================================

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

async function fetchRealGoogleReviews(accessToken: string) {
    try {
        console.log("🔍 1. Fetching Accounts...");
        const accountsRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const accountsData = await accountsRes.json();
        
        if (accountsData.error) throw new Error(`Google API Error: ${accountsData.error.message}`);
        if (!accountsData.accounts || accountsData.accounts.length === 0) throw new Error("No Google Business Profile found.");
        
        const accountName = accountsData.accounts[0].name; 

        console.log("🔍 2. Fetching Locations...");
        const locationsRes = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const locationsData = await locationsRes.json();
        
        if (locationsData.error) throw new Error(`Google API Error: ${locationsData.error.message}`);
        if (!locationsData.locations || locationsData.locations.length === 0) throw new Error("No Locations found.");
        
        const locationName = locationsData.locations[0].name;

        console.log("🔍 3. Fetching Reviews...");
        const reviewsRes = await fetch(`https://mybusiness.googleapis.com/v4/${accountName}/${locationName}/reviews`, {
             headers: { Authorization: `Bearer ${accessToken}` }
        });
        const reviewsJson = await reviewsRes.json();

        if (reviewsJson.error) throw new Error(`Google API Error: ${reviewsJson.error.message}`);

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

function generateFallbackReviews(platform: string, label: string) {
    return [
      { author: "Simulation User", rating: 5, content: `Simulation Data for ${platform} (${label}). Add APIFY_API_TOKEN to fetch real data.`, sentiment: "positive", created_at: new Date() },
      { author: "Happy Client", rating: 4, content: "Great service, waiting for real API connection.", sentiment: "positive", created_at: new Date(Date.now() - 86400000) }
    ];
}